"""
Case Study service — CRUD operations for client success stories.
All database logic lives here; route handlers stay thin.
"""
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.case_study import CaseStudy
from app.schemas.case_study import CaseStudyCreate, CaseStudyUpdate
from app.utils.slug import ensure_unique_slug, generate_slug
from app.services.interactions_helper import apply_interaction_annotations, format_interaction_results
from app.services.content_lifecycle import apply_content_status_metadata, apply_content_status_transition, validate_initial_status


def list_case_studies(
    db: Session,
    *,
    page: int = 1,
    per_page: int = 10,
    search: str | None = None,
    status: str | None = None,
    industry: str | None = None,
    is_featured: bool | None = None,
    sort_by: str | None = None,
    sort_order: str | None = None,
    user_id: int | None = None,
    include_drafts: bool = False,
) -> dict:
    """Paginated case study listing with search, filtering, and sorting."""
    query = db.query(CaseStudy)

    if search:
        search = search.strip()
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                CaseStudy.title.ilike(search_term),
                CaseStudy.client_name.ilike(search_term),
                CaseStudy.slug.ilike(search_term)
            )
        )

    if status is not None:
        query = query.filter(CaseStudy.status == status)
    if industry is not None:
        query = query.filter(CaseStudy.industry == industry)
    if is_featured is not None:
        query = query.filter(CaseStudy.is_featured == is_featured)
    if not include_drafts:
        query = query.filter(CaseStudy.status == "published")

    total = query.count()
    query = apply_interaction_annotations(query, CaseStudy, user_id)
    
    # ── Sorting ───────────────────────────────────────────────
    allowed_sort_fields = {"title": CaseStudy.title, "created_at": CaseStudy.created_at, "updated_at": CaseStudy.updated_at}
    sort_column = allowed_sort_fields.get(sort_by, CaseStudy.updated_at)
    
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    offset = (page - 1) * per_page
    rows = query.offset(offset).limit(per_page).all()
    items = format_interaction_results(rows, has_user=bool(user_id))

    return {"items": items, "total": total, "page": page, "per_page": per_page}


def get_case_study_by_slug(db: Session, slug: str, user_id: int | None = None, include_drafts: bool = False) -> CaseStudy | None:
    """Fetch a single case study by its URL slug."""
    query = apply_interaction_annotations(db.query(CaseStudy), CaseStudy, user_id)
    if not include_drafts:
        query = query.filter(CaseStudy.status == "published")
    row = query.filter(CaseStudy.slug == slug).first()
    if not row:
        return None
    return format_interaction_results([row], has_user=bool(user_id))[0]


def get_case_study_by_id(db: Session, case_study_id: int, user_id: int | None = None, include_drafts: bool = False) -> CaseStudy | None:
    """Fetch a single case study by its ID. Returns None if not found."""
    query = apply_interaction_annotations(db.query(CaseStudy), CaseStudy, user_id)
    if not include_drafts:
        query = query.filter(CaseStudy.status == "published")
    row = query.filter(CaseStudy.id == case_study_id).first()
    if not row:
        return None
    return format_interaction_results([row], has_user=bool(user_id))[0]


def create_case_study(db: Session, data: CaseStudyCreate, *, status_actor_id: int | None = None, status_reason: str | None = None) -> CaseStudy:
    """
    Create a new case study with auto-generated slug from title.
    Metrics are stored as JSON array of {label, value} objects.
    """
    slug = generate_slug(data.title)
    slug = ensure_unique_slug(db, CaseStudy, slug)

    # Convert metrics from Pydantic models to dicts for JSON storage
    dump = data.model_dump(exclude={"status"})
    if dump.get("metrics"):
        dump["metrics"] = [m if isinstance(m, dict) else m for m in dump["metrics"]]

    initial_status = validate_initial_status(data.status)

    case_study = CaseStudy(
        **dump,
        slug=slug,
        status=initial_status,
    )

    if initial_status == "published" and case_study.published_at is None:
        case_study.published_at = datetime.now(timezone.utc)
    apply_content_status_metadata(case_study, actor_id=status_actor_id, reason=status_reason)

    db.add(case_study)
    db.commit()
    db.refresh(case_study)
    
    case_study.likes_count = 0
    case_study.comments_count = 0
    case_study.is_liked = False
    return case_study


def update_case_study(db: Session, case_study_id: int, data: CaseStudyUpdate, *, status_actor_id: int | None = None, status_reason: str | None = None) -> CaseStudy | None:
    """Partial update of an existing case study."""
    case_study = db.query(CaseStudy).filter(CaseStudy.id == case_study_id).first()
    if case_study is None:
        return None

    update_data = data.model_dump(exclude_unset=True)

    if "title" in update_data and update_data["title"] != case_study.title:
        new_slug = generate_slug(update_data["title"])
        new_slug = ensure_unique_slug(db, CaseStudy, new_slug, exclude_id=case_study.id)
        case_study.slug = new_slug

    if "status" in update_data and update_data["status"] is not None:
        previous_status = case_study.status
        update_data["status"] = apply_content_status_transition(case_study, update_data["status"])
        if update_data["status"] != previous_status:
            apply_content_status_metadata(case_study, actor_id=status_actor_id, reason=status_reason)

    # Convert metrics Pydantic models to dicts if present
    if "metrics" in update_data and update_data["metrics"] is not None:
        update_data["metrics"] = [
            m if isinstance(m, dict) else m for m in update_data["metrics"]
        ]

    for field, value in update_data.items():
        setattr(case_study, field, value)

    db.commit()
    return get_case_study_by_id(db, case_study_id, include_drafts=True)


def delete_case_study(db: Session, case_study_id: int) -> bool:
    """Delete a case study by ID. Returns True if found and deleted."""
    case_study = db.query(CaseStudy).filter(CaseStudy.id == case_study_id).first()
    if case_study is None:
        return False
    db.delete(case_study)
    db.commit()
    return True
