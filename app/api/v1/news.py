"""
News CRUD routes — list, get by slug, create, update, delete.
Create and update accept multipart/form-data with file upload for cover_image.
"""
import logging
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Query, UploadFile, status

from app.api.deps import DbDep, OptionalUser
from app.core.permissions import require_permission, enforce_publish_permission, can_view_drafts
from app.models.user import User
from app.schemas.common import ContentStatus, PaginatedResponse
from app.schemas.news import NewsCreate, NewsOut, NewsUpdate
from app.services import news as news_service
from app.services import resource as resource_service
from app.services.storage import get_storage_service
from app.services.webhook_dispatcher import dispatch_publish_event
from app.services.revision_history import get_revision_referenced_urls
from app.utils.parsers import parse_optional_string
from app.rate_limit import PUBLIC_GET_LIMIT, UPLOAD_LIMIT, CONTENT_DELETE_LIMIT

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/news", tags=["News"])

CreateDep = Annotated[User, Depends(require_permission("create"))]
UpdateDep = Annotated[User, Depends(require_permission("update"))]
DeleteDep = Annotated[User, Depends(require_permission("delete"))]


@router.get("", response_model=PaginatedResponse[NewsOut], dependencies=[Depends(PUBLIC_GET_LIMIT)])
def list_news(
    db: DbDep,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    search: str | None = Query(None, description="Search term for headline or summary"),
    status: ContentStatus | None = Query(None, description="Filter by publication status"),
    is_featured: bool | None = Query(None, description="Filter featured news only"),
    sort_by: str | None = Query(None, description="Sort field"),
    sort_order: str | None = Query(None, description="Sort order: asc or desc"),
    user: OptionalUser = None,
):
    """
    List all news articles with pagination.

    - Public endpoint
    - Filterable by status and is_featured flag
    """
    result = news_service.list_news(
        db=db,
        page=page,
        per_page=per_page,
        search=search,
        status=status.value if status else None,
        is_featured=is_featured,
        sort_by=sort_by,
        sort_order=sort_order,
        user_id=user.id if user else None,
        include_drafts=can_view_drafts(user),
    )
    return result


@router.get("/{slug}", response_model=NewsOut, dependencies=[Depends(PUBLIC_GET_LIMIT)])
def get_news(slug: str, db: DbDep, user: OptionalUser = None):
    """
    Get a single news article by its URL slug.

    - Public endpoint
    - Returns 404 if slug not found
    """
    news = news_service.get_news_by_slug(db, slug, user_id=user.id if user else None, include_drafts=can_view_drafts(user))
    if news is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"News article with slug '{slug}' not found",
        )
    return news


@router.post("", response_model=NewsOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(UPLOAD_LIMIT)])
def create_news(
    db: DbDep,
    admin: CreateDep,
    headline: str = Form(..., max_length=150),
    summary: str = Form(...),
    source: str | None = Form(None, max_length=255),
    is_featured: bool = Form(False),
    status: ContentStatus = Form(ContentStatus.draft),
    status_reason: str | None = Form(None, max_length=500),
    cover_image: UploadFile | None = File(None, description="Cover image (JPG/PNG/WebP, max 5MB)"),
):
    """
    Create a new news article with optional cover image upload.

    - Admin-only endpoint
    - Slug auto-generated from headline
    """
    enforce_publish_permission(admin, status)
    storage = get_storage_service()

    try:
        cover_image_url: str | None = None
        if cover_image and cover_image.filename:
            cover_image_url = storage.upload_image(cover_image, "news")

        data = NewsCreate(
            headline=headline,
            summary=summary,
            cover_image=cover_image_url,
            source=source,
            is_featured=is_featured,
            status=status,
        )

        news = news_service.create_news(db, data, status_actor_id=admin.id, status_reason=status_reason)
        storage.clear_pending()
        return news

    except HTTPException:
        storage.rollback_uploads()
        raise
    except Exception as e:
        storage.rollback_uploads()
        logger.error("News creation failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.put("/{news_id}", response_model=NewsOut, dependencies=[Depends(UPLOAD_LIMIT)])
def update_news(
    news_id: int,
    db: DbDep,
    admin: UpdateDep,
    background_tasks: BackgroundTasks,
    headline: str | None = Form(None, max_length=150),
    summary: str | None = Form(None),
    source: str | None = Form(None, max_length=255),
    is_featured: bool | None = Form(None),
    status: ContentStatus | None = Form(None),
    status_reason: str | None = Form(None, max_length=500),
    cover_image: UploadFile | None = File(None, description="New cover image (replaces existing)"),
    remove_cover_image: bool = Form(False),
):
    """
    Update an existing news article by ID.

    - Admin-only endpoint
    - Partial update (only provided fields)
    - New cover_image replaces the old one
    """
    enforce_publish_permission(admin, status)
    storage = get_storage_service()

    existing = news_service.get_news_by_id(db, news_id, include_drafts=True)
    old_status = existing.status if existing else None
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"News article with id {news_id} not found",
        )

    try:
        update_kwargs = {}

        # Collect URLs protected by revision history
        protected_urls = get_revision_referenced_urls(db, "news", news_id)

        def safe_delete(urls: list[str]) -> None:
            deletable = [u for u in urls if u and u not in protected_urls]
            if deletable:
                storage.delete_files(deletable)
        
        if remove_cover_image and existing.cover_image:
            safe_delete([existing.cover_image])
            update_kwargs["cover_image"] = None
        elif cover_image and cover_image.filename:
            new_cover_url = storage.upload_image(cover_image, "news")
            safe_delete([existing.cover_image] if existing.cover_image else [])
            update_kwargs["cover_image"] = new_cover_url

        if headline is not None:
            update_kwargs["headline"] = parse_optional_string(headline)
        if summary is not None:
            update_kwargs["summary"] = parse_optional_string(summary)
        if source is not None:
            update_kwargs["source"] = parse_optional_string(source)
            
        if is_featured is not None:
            update_kwargs["is_featured"] = is_featured
            
        if status is not None:
            update_kwargs["status"] = status
            
        data = NewsUpdate(**update_kwargs)
        news = news_service.update_news(db, news_id, data, status_actor_id=admin.id, status_reason=status_reason)
        storage.clear_pending()

        # Fire webhook if transitioned to published
        if old_status != "published" and news.status == "published":
            background_tasks.add_task(
                dispatch_publish_event,
                content_type="news",
                content_id=news.id,
                payload=NewsOut.model_validate(news).model_dump(mode="json")
            )

        return news

    except HTTPException:
        storage.rollback_uploads()
        raise
    except Exception as e:
        storage.rollback_uploads()
        logger.error("News update failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.delete("/{news_id}", status_code=status.HTTP_200_OK, dependencies=[Depends(CONTENT_DELETE_LIMIT)])
def delete_news(news_id: int, db: DbDep, admin: DeleteDep):
    """
    Delete a news article by ID.

    - Admin-only endpoint
    - Also deletes the cover image from storage
    """
    storage = get_storage_service()

    news = news_service.get_news_by_id(db, news_id, include_drafts=True)
    if news is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"News article with id {news_id} not found",
        )

    # Delete attached resources first to avoid validate_content_exists 404
    resources = resource_service.list_resources(db, "news", news_id)
    for res in resources:
        storage.delete_file(res.file_url)
        resource_service.delete_resource(db, res.id)

    success = news_service.delete_news(db, news_id, actor_id=admin.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"News article with id {news_id} not found",
        )

    if news.cover_image:
        storage.delete_file(news.cover_image)

    return {"message": "Successfully deleted"}
