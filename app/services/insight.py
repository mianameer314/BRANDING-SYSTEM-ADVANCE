"""
Insight service — CRUD operations for insight articles.
All database logic lives here; route handlers stay thin.
"""
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.insight import Insight
from app.schemas.insight import InsightCreate, InsightUpdate
from app.utils.slug import ensure_unique_slug, generate_slug
from app.services.interactions_helper import apply_interaction_annotations, format_interaction_results
from app.services.content_lifecycle import apply_content_status_metadata, apply_content_status_transition, validate_initial_status
from app.services.revision_history import ensure_content_baseline, record_content_revision


def list_insights(
    db: Session,
    *,
    page: int = 1,
    per_page: int = 10,
    search: str | None = None,
    status: str | None = None,
    category: str | None = None,
    sort_by: str | None = None,
    sort_order: str | None = None,
    user_id: int | None = None,
    include_drafts: bool = False,
) -> dict:
    """Paginated insight listing with search, filtering, and sorting."""
    query = db.query(Insight)

    if search:
        search = search.strip()
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Insight.title.ilike(search_term),
                Insight.excerpt.ilike(search_term),
                Insight.slug.ilike(search_term)
            )
        )

    if status is not None:
        query = query.filter(Insight.status == status)
    if category is not None:
        query = query.filter(Insight.category == category)
    if not include_drafts:
        query = query.filter(Insight.status == "published")

    total = query.count()
    query = apply_interaction_annotations(query, Insight, user_id)
    
    # ── Sorting ───────────────────────────────────────────────
    allowed_sort_fields = {"title": Insight.title, "created_at": Insight.created_at, "updated_at": Insight.updated_at}
    sort_column = allowed_sort_fields.get(sort_by, Insight.updated_at)
    
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    offset = (page - 1) * per_page
    rows = query.offset(offset).limit(per_page).all()
    items = format_interaction_results(rows, has_user=bool(user_id))

    return {"items": items, "total": total, "page": page, "per_page": per_page}


def get_insight_by_slug(db: Session, slug: str, user_id: int | None = None, include_drafts: bool = False) -> Insight | None:
    """Fetch a single insight article by its URL slug."""
    query = apply_interaction_annotations(db.query(Insight), Insight, user_id)
    if not include_drafts:
        query = query.filter(Insight.status == "published")
    row = query.filter(Insight.slug == slug).first()
    if not row:
        return None
    return format_interaction_results([row], has_user=bool(user_id))[0]


def get_insight_by_id(db: Session, insight_id: int, user_id: int | None = None, include_drafts: bool = False) -> Insight | None:
    """Fetch a single insight article by its ID. Returns None if not found."""
    query = apply_interaction_annotations(db.query(Insight), Insight, user_id)
    if not include_drafts:
        query = query.filter(Insight.status == "published")
    row = query.filter(Insight.id == insight_id).first()
    if not row:
        return None
    return format_interaction_results([row], has_user=bool(user_id))[0]


def create_insight(db: Session, data: InsightCreate, *, status_actor_id: int | None = None, status_reason: str | None = None) -> Insight:
    """Create a new insight article with auto-generated slug from title."""
    slug = generate_slug(data.title)
    slug = ensure_unique_slug(db, Insight, slug)

    initial_status = validate_initial_status(data.status)

    insight = Insight(
        **data.model_dump(exclude={"status"}),
        slug=slug,
        status=initial_status,
    )

    if initial_status == "published" and insight.published_at is None:
        insight.published_at = datetime.now(timezone.utc)
    apply_content_status_metadata(insight, actor_id=status_actor_id, reason=status_reason)

    db.add(insight)
    record_content_revision(
        db, insight, action="created", actor_id=status_actor_id,
        changed_fields=["*"], status_reason=status_reason,
    )
    db.commit()
    db.refresh(insight)
    
    insight.likes_count = 0
    insight.comments_count = 0
    insight.is_liked = False
    return insight


def update_insight(db: Session, insight_id: int, data: InsightUpdate, *, status_actor_id: int | None = None, status_reason: str | None = None) -> Insight | None:
    """Partial update of an existing insight article."""
    insight = db.query(Insight).filter(Insight.id == insight_id).first()
    if insight is None:
        return None

    ensure_content_baseline(db, insight, actor_id=status_actor_id)

    update_data = data.model_dump(exclude_unset=True)
    revision_action = "updated"

    if "title" in update_data and update_data["title"] != insight.title:
        new_slug = generate_slug(update_data["title"])
        new_slug = ensure_unique_slug(db, Insight, new_slug, exclude_id=insight.id)
        insight.slug = new_slug

    if "status" in update_data and update_data["status"] is not None:
        previous_status = insight.status
        update_data["status"] = apply_content_status_transition(insight, update_data["status"])
        if update_data["status"] != previous_status:
            apply_content_status_metadata(insight, actor_id=status_actor_id, reason=status_reason)
            revision_action = "status_changed"

    changed_fields = []
    if "title" in update_data and update_data["title"] != getattr(insight, "title", None):
        changed_fields.append("slug")

    for field, value in update_data.items():
        if getattr(insight, field) != value:
            changed_fields.append(field)
            setattr(insight, field, value)
    record_content_revision(
        db, insight, action=revision_action, actor_id=status_actor_id,
        changed_fields=changed_fields, status_reason=status_reason if revision_action == "status_changed" else None,
    )
    db.commit()
    return get_insight_by_id(db, insight_id, include_drafts=True)


def delete_insight(db: Session, insight_id: int, *, actor_id: int | None = None) -> bool:
    """Delete an insight article by ID. Returns True if found and deleted."""
    insight = db.query(Insight).filter(Insight.id == insight_id).first()
    if insight is None:
        return False
    ensure_content_baseline(db, insight, actor_id=actor_id)
    record_content_revision(db, insight, action="deleted", actor_id=actor_id, changed_fields=["*"])
    db.delete(insight)
    db.commit()
    return True
