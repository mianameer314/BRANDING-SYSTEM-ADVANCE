"""
Blog CRUD routes — list, get by slug, create, update, delete.
Create and update accept multipart/form-data with file upload for cover_image.
"""

import json
import logging
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
    BackgroundTasks,
)

from app.api.deps import DbDep, OptionalUser
from app.core.permissions import require_permission, enforce_publish_permission, can_view_drafts
from app.models.user import User
from app.schemas.blog import BlogCreate, BlogOut, BlogUpdate
from app.schemas.common import ContentStatus, PaginatedResponse
from app.services import blog as blog_service
from app.services import resource as resource_service
from app.services.storage import get_storage_service
from app.services.webhook_dispatcher import dispatch_publish_event
from app.utils.parsers import parse_optional_string
from app.rate_limit import PUBLIC_GET_LIMIT, UPLOAD_LIMIT, CONTENT_DELETE_LIMIT

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/blogs", tags=["Blogs"])

CreateDep = Annotated[User, Depends(require_permission("create"))]
UpdateDep = Annotated[User, Depends(require_permission("update"))]
DeleteDep = Annotated[User, Depends(require_permission("delete"))]


# ---------------------------------------------------------
# Helper
# ---------------------------------------------------------

def parse_tags(tags: str | None) -> list[str] | None:
    """
    Convert string into list[str].
    Supports strict JSON array or comma-separated string fallback.
    """

    if tags is None or tags.strip() == "":
        return None

    # Try strict JSON first
    try:
        parsed = json.loads(tags)
        if isinstance(parsed, list) and all(isinstance(item, str) for item in parsed):
            return parsed
    except (json.JSONDecodeError, ValueError):
        pass

    # Try cleaning and splitting by comma as a fallback
    cleaned = tags.strip("[]")
    if cleaned:
        items = [item.strip().strip("\"'") for item in cleaned.split(",")]
        items = [item for item in items if item]
        if items:
            return items

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail='tags must be a JSON array of strings, e.g. ["python","fastapi"]',
    )


# ---------------------------------------------------------
# List Blogs
# ---------------------------------------------------------

@router.get("", response_model=PaginatedResponse[BlogOut], dependencies=[Depends(PUBLIC_GET_LIMIT)])
def list_blogs(
    db: DbDep,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: str | None = Query(None),
    status: ContentStatus | None = Query(None),
    category: str | None = Query(None),
    sort_by: str | None = Query(None),
    sort_order: str | None = Query(None),
    user: OptionalUser = None,
):
    return blog_service.list_blogs(
        db=db,
        page=page,
        per_page=per_page,
        search=search,
        status=status.value if status else None,
        category=category,
        sort_by=sort_by,
        sort_order=sort_order,
        user_id=user.id if user else None,
        include_drafts=can_view_drafts(user),
    )


# ---------------------------------------------------------
# Get Blog
# ---------------------------------------------------------

@router.get("/{slug}", response_model=BlogOut, dependencies=[Depends(PUBLIC_GET_LIMIT)])
def get_blog(
    slug: str,
    db: DbDep,
    user: OptionalUser = None,
):
    blog = blog_service.get_blog_by_slug(db, slug, user_id=user.id if user else None, include_drafts=can_view_drafts(user))

    if blog is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found",
        )

    return blog


# ---------------------------------------------------------
# Create Blog
# ---------------------------------------------------------

@router.post("", response_model=BlogOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(UPLOAD_LIMIT)])
def create_blog(
    db: DbDep,
    admin: CreateDep,
    title: str = Form(..., max_length=200),
    author: str = Form(..., max_length=150),
    content: str = Form(...),
    excerpt: str | None = Form(None, max_length=300),
    category: str | None = Form(None, max_length=100),
    tags: str | None = Form(
        None,
        description='JSON array string, e.g. ["python","fastapi"]',
    ),
    status: ContentStatus = Form(ContentStatus.draft),
    status_reason: str | None = Form(None, max_length=500),
    cover_image: UploadFile | None = File(
        None,
        description="Cover image",
    ),
):
    enforce_publish_permission(admin, status)
    storage = get_storage_service()

    try:

        cover_image_url = None

        if cover_image and cover_image.filename:
            cover_image_url = storage.upload_image(
                cover_image,
                "blogs",
            )

        data = BlogCreate(
            title=title,
            author=author,
            content=content,
            excerpt=excerpt,
            category=category,
            tags=parse_tags(tags),
            status=status,
            cover_image=cover_image_url,
        )

        blog = blog_service.create_blog(db, data, status_actor_id=admin.id, status_reason=status_reason)

        storage.clear_pending()

        return blog

    except HTTPException:
        storage.rollback_uploads()
        raise

    except Exception as e:
        storage.rollback_uploads()
        logger.exception(e)

        raise HTTPException(
            status_code=500,
            detail="Internal server error",
        )


# ---------------------------------------------------------

@router.put("/{blog_id}", response_model=BlogOut, dependencies=[Depends(UPLOAD_LIMIT)])
def update_blog(
    blog_id: int,
    db: DbDep,
    admin: UpdateDep,
    background_tasks: BackgroundTasks,
    title: str | None = Form(None),
    author: str | None = Form(None),
    content: str | None = Form(None),
    excerpt: str | None = Form(None),
    category: str | None = Form(None),
    tags: str | None = Form(
        None,
        description='JSON array string, e.g. ["python","fastapi"]',
    ),
    status: ContentStatus | None = Form(None),
    status_reason: str | None = Form(None, max_length=500),
    cover_image: UploadFile | None = File(None),
    remove_cover_image: bool = Form(False),
):
    enforce_publish_permission(admin, status)
    storage = get_storage_service()

    existing = blog_service.get_blog_by_id(db, blog_id, include_drafts=True)
    old_status = existing.status if existing else None

    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found",
        )

    try:
        update_data = {}
        
        if remove_cover_image and existing.cover_image:
            storage.delete_files([existing.cover_image])
            update_data["cover_image"] = None
        elif cover_image and cover_image.filename:
            cover_image_url = storage.replace_image(existing.cover_image, cover_image, "blogs")
            update_data["cover_image"] = cover_image_url

        if title is not None:
            update_data["title"] = parse_optional_string(title)
        if author is not None:
            update_data["author"] = parse_optional_string(author)
        if content is not None:
            update_data["content"] = parse_optional_string(content)
        if excerpt is not None:
            update_data["excerpt"] = parse_optional_string(excerpt)
        if category is not None:
            update_data["category"] = parse_optional_string(category)

        if tags is not None:
            if tags == "null":
                update_data["tags"] = None
            elif tags == "[]" or tags.strip() == "":
                update_data["tags"] = []
            else:
                update_data["tags"] = parse_tags(tags)

        if status is not None:
            update_data["status"] = status

        blog = blog_service.update_blog(
            db=db,
            blog_id=blog_id,
            data=BlogUpdate(**update_data),
            status_actor_id=admin.id,
            status_reason=status_reason,
        )

        storage.clear_pending()

        # Fire webhook if transitioned to published
        if old_status != "published" and blog.status == "published":
            background_tasks.add_task(
                dispatch_publish_event,
                content_type="blog",
                content_id=blog.id,
                payload=BlogOut.model_validate(blog).model_dump(mode="json")
            )

        return blog

    except HTTPException:
        storage.rollback_uploads()
        raise

    except Exception as e:
        storage.rollback_uploads()
        logger.exception(e)

        raise HTTPException(
            status_code=500,
            detail="Internal server error",
        )


# ---------------------------------------------------------
# Delete Blog
# ---------------------------------------------------------

@router.delete("/{blog_id}", status_code=status.HTTP_200_OK, dependencies=[Depends(CONTENT_DELETE_LIMIT)])
def delete_blog(
    blog_id: int,
    db: DbDep,
    admin: DeleteDep,
):
    storage = get_storage_service()

    blog = blog_service.get_blog_by_id(db, blog_id, include_drafts=True)
    if blog is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found",
        )

    # Delete attached resources first to avoid validate_content_exists 404
    resources = resource_service.list_resources(db, "blog", blog_id)
    for res in resources:
        storage.delete_file(res.file_url)
        resource_service.delete_resource(db, res.id)

    success = blog_service.delete_blog(db, blog_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found",
        )

    if blog.cover_image:
        storage.delete_file(blog.cover_image)

    return {"message": "Successfully deleted"}
