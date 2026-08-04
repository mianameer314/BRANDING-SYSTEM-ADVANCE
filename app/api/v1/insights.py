"""
Insight CRUD routes — list, get by slug, create, update, delete.
Create and update accept multipart/form-data with file upload for cover_image.
"""
import json
import logging
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Query, UploadFile, status

from app.api.deps import DbDep, OptionalUser
from app.core.permissions import require_permission, enforce_publish_permission, can_view_drafts
from app.models.user import User
from app.schemas.common import ContentStatus, PaginatedResponse
from app.schemas.insight import InsightCreate, InsightOut, InsightUpdate
from app.services import insight as insight_service
from app.services import resource as resource_service
from app.services.storage import get_storage_service
from app.services.webhook_dispatcher import dispatch_publish_event
from app.services.revision_history import get_revision_referenced_urls
from app.utils.parsers import parse_optional_string
from app.rate_limit import PUBLIC_GET_LIMIT, UPLOAD_LIMIT, CONTENT_DELETE_LIMIT

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/insights", tags=["Insights"])

CreateDep = Annotated[User, Depends(require_permission("create"))]
UpdateDep = Annotated[User, Depends(require_permission("update"))]
DeleteDep = Annotated[User, Depends(require_permission("delete"))]


@router.get("", response_model=PaginatedResponse[InsightOut], dependencies=[Depends(PUBLIC_GET_LIMIT)])
def list_insights(
    db: DbDep,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    search: str | None = Query(None, description="Search term for title or excerpt"),
    status: ContentStatus | None = Query(None, description="Filter by publication status"),
    category: str | None = Query(None, description="Filter by category"),
    sort_by: str | None = Query(None, description="Sort field"),
    sort_order: str | None = Query(None, description="Sort order: asc or desc"),
    user: OptionalUser = None,
):
    """
    List all insights with pagination and optional filtering.

    - Public endpoint
    - Filterable by status and category
    """
    return insight_service.list_insights(
        db,
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


@router.get("/{slug}", response_model=InsightOut, dependencies=[Depends(PUBLIC_GET_LIMIT)])
def get_insight(slug: str, db: DbDep, user: OptionalUser = None):
    """
    Get a single insight article by its URL slug.

    - Public endpoint
    - Returns 404 if slug not found
    """
    insight = insight_service.get_insight_by_slug(db, slug, user_id=user.id if user else None, include_drafts=can_view_drafts(user))
    if insight is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Insight with slug '{slug}' not found",
        )
    return insight


@router.post("", response_model=InsightOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(UPLOAD_LIMIT)])
def create_insight(
    db: DbDep,
    admin: CreateDep,
    title: str = Form(..., max_length=200),
    author: str = Form(..., max_length=150),
    content: str = Form(...),
    excerpt: str | None = Form(None, max_length=300),
    category: str | None = Form(None, max_length=100),
    tags: str | None = Form(None, description="JSON array string"),
    status: ContentStatus = Form(ContentStatus.draft),
    status_reason: str | None = Form(None, max_length=500),
    cover_image: UploadFile | None = File(None, description="Cover image (JPG/PNG/WebP, max 5MB)"),
):
    """
    Create a new insight article with optional cover image upload.

    - Admin-only endpoint
    - Slug auto-generated from title
    """
    enforce_publish_permission(admin, status)
    storage = get_storage_service()

    try:
        cover_image_url: str | None = None
        if cover_image and cover_image.filename:
            cover_image_url = storage.upload_image(cover_image, "insights")

        parsed_tags: list[str] | None = None
        if tags:
            try:
                parsed = json.loads(tags)
                if isinstance(parsed, list) and all(isinstance(i, str) for i in parsed):
                    parsed_tags = parsed
                else:
                    raise ValueError
            except (json.JSONDecodeError, ValueError):
                cleaned = tags.strip("[]")
                items = [item.strip().strip("\"'") for item in cleaned.split(",")]
                parsed_tags = [item for item in items if item]
                if not parsed_tags:
                    raise HTTPException(status_code=400, detail="tags must be a valid JSON array string")

        data = InsightCreate(
            title=title,
            author=author,
            content=content,
            excerpt=excerpt,
            cover_image=cover_image_url,
            category=category,
            tags=parsed_tags,
            status=status,
        )

        insight = insight_service.create_insight(db, data, status_actor_id=admin.id, status_reason=status_reason)
        storage.clear_pending()
        return insight

    except HTTPException:
        storage.rollback_uploads()
        raise
    except Exception as e:
        storage.rollback_uploads()
        logger.error("Insight creation failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.put("/{insight_id}", response_model=InsightOut, dependencies=[Depends(UPLOAD_LIMIT)])
def update_insight(
    insight_id: int,
    db: DbDep,
    admin: UpdateDep,
    background_tasks: BackgroundTasks,
    title: str | None = Form(None, max_length=200),
    author: str | None = Form(None, max_length=150),
    content: str | None = Form(None),
    excerpt: str | None = Form(None, max_length=300),
    category: str | None = Form(None, max_length=100),
    tags: str | None = Form(None, description="JSON array string"),
    status: ContentStatus | None = Form(None),
    status_reason: str | None = Form(None, max_length=500),
    cover_image: UploadFile | None = File(None, description="New cover image (replaces existing)"),
    remove_cover_image: bool = Form(False),
):
    """
    Update an existing insight article by ID.

    - Admin-only endpoint
    - Partial update (only provided fields)
    """
    enforce_publish_permission(admin, status)
    storage = get_storage_service()

    existing = insight_service.get_insight_by_id(db, insight_id, include_drafts=True)
    old_status = existing.status if existing else None
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Insight with id {insight_id} not found",
        )

    try:
        update_kwargs = {}

        # Collect URLs protected by revision history
        protected_urls = get_revision_referenced_urls(db, "insight", insight_id)

        def safe_delete(urls: list[str]) -> None:
            deletable = [u for u in urls if u and u not in protected_urls]
            if deletable:
                storage.delete_files(deletable)
        
        if remove_cover_image and existing.cover_image:
            safe_delete([existing.cover_image])
            update_kwargs["cover_image"] = None
        elif cover_image and cover_image.filename:
            new_cover_url = storage.upload_image(cover_image, "insights")
            safe_delete([existing.cover_image] if existing.cover_image else [])
            update_kwargs["cover_image"] = new_cover_url

        if tags is not None:
            if tags == "null":
                update_kwargs["tags"] = None
            elif tags == "[]" or tags.strip() == "":
                update_kwargs["tags"] = []
            else:
                try:
                    parsed = json.loads(tags)
                    if isinstance(parsed, list) and all(isinstance(i, str) for i in parsed):
                        update_kwargs["tags"] = parsed
                    else:
                        raise ValueError
                except (json.JSONDecodeError, ValueError):
                    cleaned = tags.strip("[]")
                    items = [item.strip().strip("\"'") for item in cleaned.split(",")]
                    parsed_tags = [item for item in items if item]
                    if not parsed_tags:
                        raise HTTPException(status_code=400, detail="tags must be a valid JSON array string")
                    update_kwargs["tags"] = parsed_tags

        if title is not None:
            update_kwargs["title"] = parse_optional_string(title)
        if author is not None:
            update_kwargs["author"] = parse_optional_string(author)
        if content is not None:
            update_kwargs["content"] = parse_optional_string(content)
        if excerpt is not None:
            update_kwargs["excerpt"] = parse_optional_string(excerpt)
        if category is not None:
            update_kwargs["category"] = parse_optional_string(category)
            
        if status is not None:
            update_kwargs["status"] = status
            
        data = InsightUpdate(**update_kwargs)
        insight = insight_service.update_insight(db, insight_id, data, status_actor_id=admin.id, status_reason=status_reason)
        storage.clear_pending()

        # Fire webhook if transitioned to published
        if old_status != "published" and insight.status == "published":
            background_tasks.add_task(
                dispatch_publish_event,
                content_type="insight",
                content_id=insight.id,
                payload=InsightOut.model_validate(insight).model_dump(mode="json")
            )

        return insight

    except HTTPException:
        storage.rollback_uploads()
        raise
    except Exception as e:
        storage.rollback_uploads()
        logger.error("Insight update failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.delete("/{insight_id}", status_code=status.HTTP_200_OK, dependencies=[Depends(CONTENT_DELETE_LIMIT)])
def delete_insight(insight_id: int, db: DbDep, admin: DeleteDep):
    """
    Delete an insight article by ID.

    - Admin-only endpoint
    - Also deletes the cover image from storage
    """
    storage = get_storage_service()

    insight = insight_service.get_insight_by_id(db, insight_id, include_drafts=True)
    if insight is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Insight with id {insight_id} not found",
        )

    # Delete attached resources first to avoid validate_content_exists 404
    resources = resource_service.list_resources(db, "insight", insight_id)
    for res in resources:
        storage.delete_file(res.file_url)
        resource_service.delete_resource(db, res.id)

    success = insight_service.delete_insight(db, insight_id, actor_id=admin.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Insight with id {insight_id} not found",
        )

    if insight.cover_image:
        storage.delete_file(insight.cover_image)

    return {"message": "Successfully deleted"}
