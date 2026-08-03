"""
Case Study CRUD routes — list, get by slug, create, update, delete.
Most complex content type — accepts cover_image, client_logo, and gallery as file uploads.
"""
import json
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status, BackgroundTasks

from app.api.deps import DbDep, OptionalUser
from app.core.permissions import require_permission, enforce_publish_permission, can_view_drafts
from app.models.user import User
from app.schemas.case_study import CaseStudyCreate, CaseStudyOut, CaseStudyUpdate
from app.schemas.common import ContentStatus, PaginatedResponse
from app.services import case_study as case_study_service
from app.services import resource as resource_service
from app.services.storage import get_storage_service
from app.services.webhook_dispatcher import dispatch_publish_event
from app.utils.parsers import parse_optional_string
from app.rate_limit import PUBLIC_GET_LIMIT, UPLOAD_LIMIT, CONTENT_DELETE_LIMIT

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/case-studies", tags=["Case Studies"])

CreateDep = Annotated[User, Depends(require_permission("create"))]
UpdateDep = Annotated[User, Depends(require_permission("update"))]
DeleteDep = Annotated[User, Depends(require_permission("delete"))]


@router.get("", response_model=PaginatedResponse[CaseStudyOut], dependencies=[Depends(PUBLIC_GET_LIMIT)])
def list_case_studies(
    db: DbDep,
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    search: str | None = Query(None, description="Search term for title or client name"),
    status: ContentStatus | None = Query(None, description="Filter by publication status"),
    industry: str | None = Query(None, description="Filter by industry"),
    is_featured: bool | None = Query(None, description="Filter featured case studies only"),
    sort_by: str | None = Query(None, description="Sort field"),
    sort_order: str | None = Query(None, description="Sort order: asc or desc"),
    user: OptionalUser = None,
):
    """
    List all case studies with pagination and optional filtering.

    - Public endpoint
    - Filterable by status, industry, and is_featured
    """
    return case_study_service.list_case_studies(
        db,
        page=page,
        per_page=per_page,
        search=search,
        status=status.value if status else None,
        industry=industry,
        is_featured=is_featured,
        sort_by=sort_by,
        sort_order=sort_order,
        user_id=user.id if user else None,
        include_drafts=can_view_drafts(user),
    )


@router.get("/{slug}", response_model=CaseStudyOut, dependencies=[Depends(PUBLIC_GET_LIMIT)])
def get_case_study(slug: str, db: DbDep, user: OptionalUser = None):
    """
    Get a single case study by its URL slug.

    - Public endpoint
    - Returns 404 if slug not found
    """
    case_study = case_study_service.get_case_study_by_slug(db, slug, user_id=user.id if user else None, include_drafts=can_view_drafts(user))
    if case_study is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case study with slug '{slug}' not found",
        )
    return case_study


@router.post("", response_model=CaseStudyOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(UPLOAD_LIMIT)])
def create_case_study(
    db: DbDep,
    admin: CreateDep,
    title: str = Form(..., max_length=200),
    client_name: str = Form(..., max_length=200),
    challenge: str = Form(...),
    solution: str = Form(...),
    results: str = Form(...),
    industry: str | None = Form(None, max_length=100),
    metrics: str | None = Form(None, description='JSON array of {"label":"...", "value":"..."} objects'),
    testimonial: str | None = Form(None),
    testimonial_author: str | None = Form(None, max_length=200),
    technologies: str | None = Form(None, description="JSON array string"),
    is_featured: bool = Form(False),
    status: ContentStatus = Form(ContentStatus.draft),
    status_reason: str | None = Form(None, max_length=500),
    cover_image: UploadFile | None = File(None, description="Cover image"),
    client_logo: UploadFile | None = File(None, description="Client logo image"),
    gallery: list[UploadFile] = File(None, description="Gallery images (multiple files)", json_schema_extra={"items": {"type": "string", "format": "binary"}}),
):
    """
    Create a new case study with optional image uploads.

    - Admin-only endpoint
    - Slug auto-generated from title
    - metrics: JSON array of {label, value} objects
    """
    enforce_publish_permission(admin, status)
    storage = get_storage_service()

    try:
        # Handle file uploads
        cover_image_url: str | None = None
        if cover_image and cover_image.filename:
            cover_image_url = storage.upload_image(cover_image, "case-studies")

        client_logo_url: str | None = None
        if client_logo and client_logo.filename:
            client_logo_url = storage.upload_image(client_logo, "case-studies")

        gallery_urls: list[str] | None = None
        if gallery:
            urls = storage.upload_images(gallery, "case-studies")
            if urls:
                gallery_urls = urls

        # Parse JSON fields
        parsed_metrics = None
        if metrics:
            try:
                parsed_metrics = json.loads(metrics)
            except json.JSONDecodeError:
                try:
                    # Fallback: try replacing single quotes with double quotes
                    parsed_metrics = json.loads(metrics.replace("'", '"'))
                except json.JSONDecodeError:
                    raise HTTPException(status_code=400, detail="metrics must be a valid JSON array")

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

        data = CaseStudyCreate(
            title=title,
            client_name=client_name,
            client_logo=client_logo_url,
            industry=industry,
            challenge=challenge,
            solution=solution,
            results=results,
            metrics=parsed_metrics,
            testimonial=testimonial,
            testimonial_author=testimonial_author,
            cover_image=cover_image_url,
            gallery=gallery_urls,
            technologies=parsed_techs,
            is_featured=is_featured,
            status=status,
        )

        case_study = case_study_service.create_case_study(db, data, status_actor_id=admin.id, status_reason=status_reason)
        storage.clear_pending()
        return case_study

    except HTTPException:
        storage.rollback_uploads()
        raise
    except Exception as e:
        storage.rollback_uploads()
        logger.error("Case study creation failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.put("/{case_study_id}", response_model=CaseStudyOut, dependencies=[Depends(UPLOAD_LIMIT)])
def update_case_study(
    case_study_id: int,
    db: DbDep,
    admin: UpdateDep,
    background_tasks: BackgroundTasks,
    title: str | None = Form(None, max_length=200),
    client_name: str | None = Form(None, max_length=200),
    challenge: str | None = Form(None),
    solution: str | None = Form(None),
    results: str | None = Form(None),
    industry: str | None = Form(None, max_length=100),
    metrics: str | None = Form(None, description='JSON array string'),
    testimonial: str | None = Form(None),
    testimonial_author: str | None = Form(None, max_length=200),
    technologies: str | None = Form(None, description="JSON array string"),
    is_featured: bool | None = Form(None),
    status: ContentStatus | None = Form(None),
    status_reason: str | None = Form(None, max_length=500),
    cover_image: UploadFile | None = File(None),
    client_logo: UploadFile | None = File(None, description="New client logo"),
    gallery: list[UploadFile] | None = File(None),
    existing_gallery: str | None = Form(None),
    remove_cover_image: bool = Form(False),
    remove_client_logo: bool = Form(False),
):
    """
    Update an existing case study.

    - Admin-only endpoint
    - Partial update
    - Supports granular gallery updates
    """
    enforce_publish_permission(admin, status)
    storage = get_storage_service()

    existing = case_study_service.get_case_study_by_id(db, case_study_id, include_drafts=True)
    old_status = existing.status if existing else None
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case study with id {case_study_id} not found",
        )

    try:
        update_kwargs = {}
        
        # Handle file replacements
        if remove_cover_image and existing.cover_image:
            storage.delete_files([existing.cover_image])
            update_kwargs["cover_image"] = None
        elif cover_image and cover_image.filename:
            cover_image_url = storage.replace_image(existing.cover_image, cover_image, "case-studies")
            update_kwargs["cover_image"] = cover_image_url

        if remove_client_logo and existing.client_logo:
            storage.delete_files([existing.client_logo])
            update_kwargs["client_logo"] = None
        elif client_logo and client_logo.filename:
            client_logo_url = storage.replace_image(existing.client_logo, client_logo, "case-studies")
            update_kwargs["client_logo"] = client_logo_url

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

        # Find which old URLs were removed and delete them
        if existing.gallery:
            removed_urls = [url for url in existing.gallery if url not in retained_urls]
            if removed_urls:
                storage.delete_files(removed_urls)

        has_gallery_files = bool(gallery) and any(f.filename for f in gallery)
        new_urls = []
        if has_gallery_files:
            new_urls = storage.upload_images(gallery, "case-studies") or []

        # Deduplicate and set final gallery
        final_gallery = list(dict.fromkeys(retained_urls + new_urls))
        update_kwargs["gallery"] = final_gallery

        # Parse JSON fields
        if metrics is not None:
            if metrics == "null":
                update_kwargs["metrics"] = None
            elif metrics == "[]" or metrics.strip() == "":
                update_kwargs["metrics"] = []
            else:
                try:
                    parsed_metrics = json.loads(metrics)
                    update_kwargs["metrics"] = parsed_metrics
                except json.JSONDecodeError:
                    try:
                        parsed_metrics = json.loads(metrics.replace("'", '"'))
                        update_kwargs["metrics"] = parsed_metrics
                    except json.JSONDecodeError:
                        raise HTTPException(status_code=400, detail="metrics must be a valid JSON array")

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

        if title is not None:
            update_kwargs["title"] = parse_optional_string(title)
        if client_name is not None:
            update_kwargs["client_name"] = parse_optional_string(client_name)
        if challenge is not None:
            update_kwargs["challenge"] = parse_optional_string(challenge)
        if solution is not None:
            update_kwargs["solution"] = parse_optional_string(solution)
        if results is not None:
            update_kwargs["results"] = parse_optional_string(results)
        if industry is not None:
            update_kwargs["industry"] = parse_optional_string(industry)
        if testimonial is not None:
            update_kwargs["testimonial"] = parse_optional_string(testimonial)
        if testimonial_author is not None:
            update_kwargs["testimonial_author"] = parse_optional_string(testimonial_author)
            
        if is_featured is not None:
            update_kwargs["is_featured"] = is_featured
            
        if status is not None:
            update_kwargs["status"] = status

        data = CaseStudyUpdate(**update_kwargs)
        case_study = case_study_service.update_case_study(db, case_study_id, data, status_actor_id=admin.id, status_reason=status_reason)
        storage.clear_pending()

        # Fire webhook if transitioned to published
        if old_status != "published" and case_study.status == "published":
            background_tasks.add_task(
                dispatch_publish_event,
                content_type="case_study",
                content_id=case_study.id,
                payload=CaseStudyOut.model_validate(case_study).model_dump(mode="json")
            )

        return case_study

    except HTTPException:
        storage.rollback_uploads()
        raise
    except Exception as e:
        storage.rollback_uploads()
        logger.error("Case study update failed: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.delete("/{case_study_id}", status_code=status.HTTP_200_OK, dependencies=[Depends(CONTENT_DELETE_LIMIT)])
def delete_case_study(case_study_id: int, db: DbDep, admin: DeleteDep):
    """
    Delete a case study by ID.

    - Admin-only endpoint
    - Also deletes cover_image, client_logo, and gallery from storage
    """
    storage = get_storage_service()

    cs = case_study_service.get_case_study_by_id(db, case_study_id, include_drafts=True)
    if cs is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case study with id {case_study_id} not found",
        )

    # Delete attached resources first to avoid validate_content_exists 404
    resources = resource_service.list_resources(db, "case_study", case_study_id)
    for res in resources:
        storage.delete_file(res.file_url)
        resource_service.delete_resource(db, res.id)

    success = case_study_service.delete_case_study(db, case_study_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case study with id {case_study_id} not found",
        )

    # Cleanup files
    if cs.cover_image:
        storage.delete_file(cs.cover_image)
    if cs.client_logo:
        storage.delete_file(cs.client_logo)
    if cs.gallery:
        storage.delete_files(cs.gallery)

    return {"message": "Successfully deleted"}
