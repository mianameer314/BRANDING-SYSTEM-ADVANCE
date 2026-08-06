"""
Project CRUD routes — list, get by slug, create, update, delete.
Create and update accept multipart/form-data with file uploads for cover_image and gallery.
"""
import json
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status, BackgroundTasks

from app.api.deps import DbDep, OptionalUser
from app.api.idempotency import IdempotencyDep
from app.core.permissions import require_permission, enforce_publish_permission, enforce_content_lock, can_view_drafts
from app.models.user import User
from app.schemas.common import ContentStatus, PaginatedResponse
from app.schemas.project import ProjectCreate, ProjectOut, ProjectUpdate
from app.services import project as project_service
from app.services import resource as resource_service
from app.services.storage import get_storage_service
from app.services.webhook_dispatcher import dispatch_publish_event
from app.services.revision_history import get_revision_referenced_urls
from app.utils.parsers import parse_optional_string
from app.rate_limit import PUBLIC_GET_LIMIT, UPLOAD_LIMIT, CONTENT_DELETE_LIMIT

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["Projects"])

CreateDep = Annotated[User, Depends(require_permission("create"))]
UpdateDep = Annotated[User, Depends(require_permission("update"))]
DeleteDep = Annotated[User, Depends(require_permission("delete"))]


@router.get("", response_model=PaginatedResponse[ProjectOut], dependencies=[Depends(PUBLIC_GET_LIMIT)])
def list_projects(
    db: DbDep,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    search: str | None = Query(None, description="Search term for title or summary"),
    status: ContentStatus | None = Query(None, description="Filter by publication status"),
    category: str | None = Query(None, description="Filter by project category"),
    is_featured: bool | None = Query(None, description="Filter featured projects only"),
    sort_by: str | None = Query(None, description="Sort field"),
    sort_order: str | None = Query(None, description="Sort order: asc or desc"),
    user: OptionalUser = None,
):
    """
    List all projects with pagination and optional filtering.

    - Public endpoint
    - Filterable by status, category, and is_featured
    """
    return project_service.list_projects(
        db,
        page=page,
        per_page=per_page,
        search=search,
        status=status.value if status else None,
        category=category,
        is_featured=is_featured,
        sort_by=sort_by,
        sort_order=sort_order,
        user_id=user.id if user else None,
        include_drafts=can_view_drafts(user),
    )


@router.get("/{slug}", response_model=ProjectOut, dependencies=[Depends(PUBLIC_GET_LIMIT)])
def get_project(slug: str, db: DbDep, user: OptionalUser = None):
    """
    Get a single project by its URL slug.

    - Public endpoint
    - Returns 404 if slug not found
    """
    project = project_service.get_project_by_slug(db, slug, user_id=user.id if user else None, include_drafts=can_view_drafts(user))
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with slug '{slug}' not found",
        )
    return project


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(UPLOAD_LIMIT)])
def create_project(
    db: DbDep,
    admin: CreateDep,
    name: str = Form(..., max_length=200),
    description: str = Form(...),
    client: str | None = Form(None, max_length=200),
    short_desc: str | None = Form(None, max_length=300),
    technologies: str | None = Form(None, description="JSON array string"),
    category: str | None = Form(None, max_length=100),
    project_url: str | None = Form(None, max_length=500),
    is_featured: bool = Form(False),
    status: ContentStatus = Form(ContentStatus.draft),
    status_reason: str | None = Form(None, max_length=500),
    completed_at: str | None = Form(None, description="ISO datetime string"),
    cover_image: UploadFile | None = File(None, description="Cover image (JPG/PNG/WebP, max 5MB)"),
    gallery: list[UploadFile] = File(None, description="Gallery images (multiple files)", json_schema_extra={"items": {"type": "string", "format": "binary"}}),
    idempotency: IdempotencyDep = None,
):
    """
    Create a new project showcase with optional image uploads.

    - Admin-only endpoint
    - Slug auto-generated from project name
    - cover_image: single image upload
    - gallery: multiple image uploads
    """
    enforce_publish_permission(admin, status)
    storage = get_storage_service()

    try:
        # Handle cover image
        cover_image_url: str | None = None
        if cover_image and cover_image.filename:
            cover_image_url = storage.upload_image(cover_image, "projects")

        # Handle gallery images
        gallery_urls: list[str] | None = None
        if gallery:
            urls = storage.upload_images(gallery, "projects")
            if urls:
                gallery_urls = urls

        # Parse JSON strings
        parsed_techs: list[str] | None = None
        if technologies:
            try:
                parsed = json.loads(technologies)
                if isinstance(parsed, list):
                    parsed_techs = [str(t).strip() for t in parsed]
                else:
                    raise ValueError()
            except (json.JSONDecodeError, ValueError):
                cleaned = technologies.strip("[]").replace('"', "").replace("'", "")
                parsed_techs = [t.strip() for t in cleaned.split(",") if t.strip()]

        # Parse completed_at datetime
        parsed_completed = None
        if completed_at:
            from datetime import datetime
            try:
                parsed_completed = datetime.fromisoformat(completed_at)
            except ValueError:
                raise HTTPException(status_code=400, detail="completed_at must be a valid ISO datetime")

        data = ProjectCreate(
            name=name,
            client=client,
            description=description,
            short_desc=short_desc,
            cover_image=cover_image_url,
            gallery=gallery_urls,
            technologies=parsed_techs,
            category=category,
            project_url=project_url,
            is_featured=is_featured,
            status=status,
            completed_at=parsed_completed,
        )

        project = project_service.create_project(db, data, status_actor_id=admin.id, status_reason=status_reason)
        storage.clear_pending()

        if idempotency:
            idempotency.save(db, 201, ProjectOut.model_validate(project).model_dump(mode="json"))

        return project

    except HTTPException:
        storage.rollback_uploads()
        raise
    except Exception as e:
        storage.rollback_uploads()
        logger.error("Project creation failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.put("/{project_id}", response_model=ProjectOut, dependencies=[Depends(UPLOAD_LIMIT)])
def update_project(
    project_id: int,
    db: DbDep,
    admin: UpdateDep,
    background_tasks: BackgroundTasks,
    name: str | None = Form(None, max_length=200),
    description: str | None = Form(None),
    client: str | None = Form(None, max_length=200),
    short_desc: str | None = Form(None, max_length=300),
    technologies: str | None = Form(None, description="JSON array string"),
    category: str | None = Form(None, max_length=100),
    project_url: str | None = Form(None, max_length=500),
    is_featured: bool | None = Form(None),
    status: ContentStatus | None = Form(None),
    status_reason: str | None = Form(None, max_length=500),
    completed_at: str | None = Form(None, description="ISO datetime string"),
    cover_image: UploadFile | None = File(None, description="New cover image"),
    gallery: list[UploadFile] | None = File(None),
    existing_gallery: str | None = Form(None),
    remove_cover_image: bool = Form(False),
    idempotency: IdempotencyDep = None,
):
    """
    Update an existing project.

    - Admin-only endpoint
    - Partial update
    - Supports granular gallery updates
    """
    enforce_publish_permission(admin, status)
    storage = get_storage_service()

    existing = project_service.get_project_by_id(db, project_id, include_drafts=True)
    old_status = existing.status if existing else None
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )
    
    enforce_content_lock(admin, existing.status)

    try:
        update_kwargs = {}

        # Collect URLs protected by revision history — never delete these from storage
        protected_urls = get_revision_referenced_urls(db, "project", project_id)

        def safe_delete(urls: list[str]) -> None:
            """Delete files from storage only if they are NOT referenced by any revision snapshot."""
            deletable = [u for u in urls if u and u not in protected_urls]
            if deletable:
                storage.delete_files(deletable)

        # Handle cover image replacement
        if remove_cover_image and existing.cover_image:
            safe_delete([existing.cover_image])
            update_kwargs["cover_image"] = None
        elif cover_image and cover_image.filename:
            new_cover_url = storage.upload_image(cover_image, "projects")
            safe_delete([existing.cover_image] if existing.cover_image else [])
            update_kwargs["cover_image"] = new_cover_url

        # Handle gallery logic
        if existing_gallery is None:
            retained_urls = existing.gallery or []
        else:
            try:
                retained_urls = json.loads(existing_gallery)
                if not isinstance(retained_urls, list):
                    raise ValueError()
            except (json.JSONDecodeError, ValueError):
                raise HTTPException(status_code=400, detail="existing_gallery must be a valid JSON array")

        # Find which old URLs were removed — only delete if not protected
        if existing.gallery:
            removed_urls = [url for url in existing.gallery if url not in retained_urls]
            if removed_urls:
                safe_delete(removed_urls)

        has_gallery_files = bool(gallery) and any(f.filename for f in gallery)
        new_urls = []
        if has_gallery_files:
            new_urls = storage.upload_images(gallery, "projects") or []

        # Deduplicate and set final gallery
        final_gallery = list(dict.fromkeys(retained_urls + new_urls))
        update_kwargs["gallery"] = final_gallery

        # Parse JSON strings
        if technologies is not None:
            if technologies == "null":
                update_kwargs["technologies"] = None
            elif technologies == "[]" or technologies.strip() == "":
                update_kwargs["technologies"] = []
            else:
                try:
                    parsed = json.loads(technologies)
                    if isinstance(parsed, list):
                        update_kwargs["technologies"] = [str(t).strip() for t in parsed]
                    else:
                        raise ValueError()
                except (json.JSONDecodeError, ValueError):
                    cleaned = technologies.strip("[]").replace('"', "").replace("'", "")
                    update_kwargs["technologies"] = [t.strip() for t in cleaned.split(",") if t.strip()]

        if completed_at is not None:
            if completed_at == "null" or completed_at.strip() == "":
                update_kwargs["completed_at"] = None
            else:
                from datetime import datetime
                try:
                    parsed_completed = datetime.fromisoformat(completed_at)
                    update_kwargs["completed_at"] = parsed_completed
                except ValueError:
                    raise HTTPException(status_code=400, detail="completed_at must be a valid ISO datetime")

        if name is not None:
            update_kwargs["name"] = parse_optional_string(name)
        if description is not None:
            update_kwargs["description"] = parse_optional_string(description)
        if client is not None:
            update_kwargs["client"] = parse_optional_string(client)
        if short_desc is not None:
            update_kwargs["short_desc"] = parse_optional_string(short_desc)
        if category is not None:
            update_kwargs["category"] = parse_optional_string(category)
        if project_url is not None:
            update_kwargs["project_url"] = parse_optional_string(project_url)
            
        if is_featured is not None:
            update_kwargs["is_featured"] = is_featured
            
        if status is not None:
            update_kwargs["status"] = status

        data = ProjectUpdate(**update_kwargs)
        project = project_service.update_project(db, project_id, data, status_actor_id=admin.id, status_reason=status_reason)
        storage.clear_pending()

        # Fire webhook if transitioned to published
        if old_status != "published" and project.status == "published":
            background_tasks.add_task(
                dispatch_publish_event,
                content_type="project",
                content_id=project.id,
                payload=ProjectOut.model_validate(project).model_dump(mode="json")
            )

        if idempotency:
            idempotency.save(db, 200, ProjectOut.model_validate(project).model_dump(mode="json"))

        return project

    except HTTPException:
        storage.rollback_uploads()
        raise
    except Exception as e:
        storage.rollback_uploads()
        logger.error("Project update failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.delete("/{project_id}", status_code=status.HTTP_200_OK, dependencies=[Depends(CONTENT_DELETE_LIMIT)])
def delete_project(
    project_id: int,
    db: DbDep,
    admin: DeleteDep,
    idempotency: IdempotencyDep = None,
):
    """
    Delete a project by ID.

    - Admin-only endpoint
    - Also deletes cover image and gallery from storage
    """
    storage = get_storage_service()

    project = project_service.get_project_by_id(db, project_id, include_drafts=True)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )

    # Delete attached resources first to avoid validate_content_exists 404
    resources = resource_service.list_resources(db, "project", project_id)
    for res in resources:
        storage.delete_file(res.file_url)
        resource_service.delete_resource(db, res.id)

    success = project_service.delete_project(db, project_id, actor_id=admin.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found",
        )

    # Cleanup all files
    if project.cover_image:
        storage.delete_file(project.cover_image)
    if project.gallery:
        storage.delete_files(project.gallery)

    response_body = {"message": "Successfully deleted"}
    if idempotency:
        idempotency.save(db, 200, response_body)

    return response_body
