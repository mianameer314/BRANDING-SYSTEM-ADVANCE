"""
News service — CRUD operations for news articles.
All database logic lives here; route handlers stay thin.
"""
from datetime import datetime, timezone

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.news import News
from app.schemas.news import NewsCreate, NewsUpdate
from app.utils.slug import ensure_unique_slug, generate_slug
from app.services.interactions_helper import apply_interaction_annotations, format_interaction_results
from app.services.content_lifecycle import apply_content_status_metadata, apply_content_status_transition, validate_initial_status
from app.services.revision_history import ensure_content_baseline, record_content_revision


def list_news(
    db: Session,
    *,
    page: int = 1,
    per_page: int = 10,
    search: str | None = None,
    status: str | None = None,
    is_featured: bool | None = None,
    sort_by: str | None = None,
    sort_order: str | None = None,
    user_id: int | None = None,
    include_drafts: bool = False,
) -> dict:
    """
    Paginated news listing with search, filtering, and sorting.
    """
    query = db.query(News)

    # ── Apply filters ─────────────────────────────────────────
    if search:
        search = search.strip()
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                News.headline.ilike(search_term),
                News.summary.ilike(search_term),
                News.slug.ilike(search_term)
            )
        )
        
    if status is not None:
        query = query.filter(News.status == status)
    if is_featured is not None:
        query = query.filter(News.is_featured == is_featured)
    if not include_drafts:
        query = query.filter(News.status == "published")

    # ── Total count (before pagination) ───────────────────────
    total = query.count()

    # ── Apply Interactions & Paginate ─────────────────────────
    query = apply_interaction_annotations(query, News, user_id)
    
    # ── Sorting ───────────────────────────────────────────────
    allowed_sort_fields = {"title": News.headline, "created_at": News.created_at, "updated_at": News.updated_at}
    sort_column = allowed_sort_fields.get(sort_by, News.updated_at)
    
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    offset = (page - 1) * per_page
    rows = query.offset(offset).limit(per_page).all()
    items = format_interaction_results(rows, has_user=bool(user_id))

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


def get_news_by_slug(db: Session, slug: str, user_id: int | None = None, include_drafts: bool = False) -> News | None:
    """Fetch a single news article by its URL slug. Returns None if not found."""
    query = apply_interaction_annotations(db.query(News), News, user_id)
    if not include_drafts:
        query = query.filter(News.status == "published")
    row = query.filter(News.slug == slug).first()
    if not row:
        return None
    return format_interaction_results([row], has_user=bool(user_id))[0]


def get_news_by_id(db: Session, news_id: int, user_id: int | None = None, include_drafts: bool = False) -> News | None:
    """Fetch a single news article by its ID. Returns None if not found."""
    query = apply_interaction_annotations(db.query(News), News, user_id)
    if not include_drafts:
        query = query.filter(News.status == "published")
    row = query.filter(News.id == news_id).first()
    if not row:
        return None
    return format_interaction_results([row], has_user=bool(user_id))[0]


def create_news(db: Session, data: NewsCreate, *, status_actor_id: int | None = None, status_reason: str | None = None) -> News:
    """
    Create a new news article.

    - Auto-generates a URL-safe slug from the headline
    - Ensures slug uniqueness via numeric suffix
    - Auto-sets published_at when status is 'published'
    """
    slug = generate_slug(data.headline)
    slug = ensure_unique_slug(db, News, slug)

    initial_status = validate_initial_status(data.status)

    news = News(
        **data.model_dump(exclude={"status"}),
        slug=slug,
        status=initial_status,
    )

    # Auto-set published_at if publishing immediately
    if initial_status == "published" and news.published_at is None:
        news.published_at = datetime.now(timezone.utc)
    apply_content_status_metadata(news, actor_id=status_actor_id, reason=status_reason)

    db.add(news)
    record_content_revision(
        db, news, action="created", actor_id=status_actor_id,
        changed_fields=["*"], status_reason=status_reason,
    )
    db.commit()
    db.refresh(news)
    
    news.likes_count = 0
    news.comments_count = 0
    news.is_liked = False
    return news


def update_news(db: Session, news_id: int, data: NewsUpdate, *, status_actor_id: int | None = None, status_reason: str | None = None) -> News | None:
    """
    Partial update of an existing news article.

    - Only fields explicitly sent in the request body are updated
    - Re-generates slug if the headline changes
    - Auto-sets published_at on first publish
    """
    news = db.query(News).filter(News.id == news_id).first()
    if news is None:
        return None

    ensure_content_baseline(db, news, actor_id=status_actor_id)

    update_data = data.model_dump(exclude_unset=True)
    revision_action = "updated"

    # Re-generate slug if headline changed
    if "headline" in update_data and update_data["headline"] != news.headline:
        new_slug = generate_slug(update_data["headline"])
        new_slug = ensure_unique_slug(db, News, new_slug, exclude_id=news.id)
        news.slug = new_slug

    # Convert enum to string value if status is present
    if "status" in update_data and update_data["status"] is not None:
        previous_status = news.status
        update_data["status"] = apply_content_status_transition(news, update_data["status"])
        if update_data["status"] != previous_status:
            apply_content_status_metadata(news, actor_id=status_actor_id, reason=status_reason)
            revision_action = "status_changed"

    changed_fields = []
    if "headline" in update_data and update_data["headline"] != getattr(news, "headline", None):
        changed_fields.append("slug")

    for field, value in update_data.items():
        if getattr(news, field) != value:
            changed_fields.append(field)
            setattr(news, field, value)
    record_content_revision(
        db, news, action=revision_action, actor_id=status_actor_id,
        changed_fields=changed_fields, status_reason=status_reason if revision_action == "status_changed" else None,
    )
    db.commit()
    return get_news_by_id(db, news_id, include_drafts=True)


def delete_news(db: Session, news_id: int, *, actor_id: int | None = None) -> bool:
    """
    Delete a news article by ID.

    Returns True if the article was found and deleted, False if not found.
    """
    news = db.query(News).filter(News.id == news_id).first()
    if news is None:
        return False

    ensure_content_baseline(db, news, actor_id=actor_id)
    record_content_revision(db, news, action="deleted", actor_id=actor_id, changed_fields=["*"])
    db.delete(news)
    db.commit()
    return True
