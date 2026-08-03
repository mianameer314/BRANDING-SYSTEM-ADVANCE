"""
Blog service — CRUD operations for blog posts.
All database logic lives here; route handlers stay thin.
"""
from datetime import datetime, timezone

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.blog import Blog
from app.schemas.blog import BlogCreate, BlogUpdate
from app.utils.slug import ensure_unique_slug, generate_slug
from app.services.interactions_helper import apply_interaction_annotations, format_interaction_results
from app.services.content_lifecycle import apply_content_status_metadata, apply_content_status_transition, validate_initial_status


def list_blogs(
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
    """
    Paginated blog listing with search, filtering, and sorting.
    """
    query = db.query(Blog)

    # ── Apply filters ─────────────────────────────────────────
    if search:
        search = search.strip()
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Blog.title.ilike(search_term),
                Blog.excerpt.ilike(search_term),
                Blog.slug.ilike(search_term)
            )
        )
        
    if status is not None:
        query = query.filter(Blog.status == status)
    if category is not None:
        query = query.filter(Blog.category == category)
    if not include_drafts:
        query = query.filter(Blog.status == "published")

    # ── Total count (before pagination) ───────────────────────
    total = query.count()

    # ── Apply Interactions & Paginate ─────────────────────────
    query = apply_interaction_annotations(query, Blog, user_id)
    
    # ── Sorting ───────────────────────────────────────────────
    allowed_sort_fields = {"title": Blog.title, "created_at": Blog.created_at, "updated_at": Blog.updated_at}
    sort_column = allowed_sort_fields.get(sort_by, Blog.updated_at)
    
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


def get_blog_by_slug(db: Session, slug: str, user_id: int | None = None, include_drafts: bool = False) -> Blog | None:
    """Fetch a single blog post by its URL slug. Returns None if not found."""
    query = apply_interaction_annotations(db.query(Blog), Blog, user_id)
    if not include_drafts:
        query = query.filter(Blog.status == "published")
    row = query.filter(Blog.slug == slug).first()
    if not row:
        return None
    return format_interaction_results([row], has_user=bool(user_id))[0]


def get_blog_by_id(db: Session, blog_id: int, user_id: int | None = None, include_drafts: bool = False) -> Blog | None:
    """Fetch a single blog post by its ID. Returns None if not found."""
    query = apply_interaction_annotations(db.query(Blog), Blog, user_id)
    if not include_drafts:
        query = query.filter(Blog.status == "published")
    row = query.filter(Blog.id == blog_id).first()
    if not row:
        return None
    return format_interaction_results([row], has_user=bool(user_id))[0]


def create_blog(db: Session, data: BlogCreate, *, status_actor_id: int | None = None, status_reason: str | None = None) -> Blog:
    """
    Create a new blog post.

    - Auto-generates a URL-safe slug from the title
    - Ensures slug uniqueness via numeric suffix
    - Auto-sets published_at when status is 'published'
    """
    slug = generate_slug(data.title)
    slug = ensure_unique_slug(db, Blog, slug)

    initial_status = validate_initial_status(data.status)

    blog = Blog(
        **data.model_dump(exclude={"status"}),
        slug=slug,
        status=initial_status,
    )

    # Auto-set published_at if publishing immediately
    if initial_status == "published" and blog.published_at is None:
        blog.published_at = datetime.now(timezone.utc)
    apply_content_status_metadata(blog, actor_id=status_actor_id, reason=status_reason)

    db.add(blog)
    db.commit()
    db.refresh(blog)
    
    # New blogs have 0 interactions
    blog.likes_count = 0
    blog.comments_count = 0
    blog.is_liked = False
    return blog


def update_blog(db: Session, blog_id: int, data: BlogUpdate, *, status_actor_id: int | None = None, status_reason: str | None = None) -> Blog | None:
    """
    Partial update of an existing blog post.

    - Only fields explicitly sent in the request body are updated
    - Re-generates slug if the title changes
    - Auto-sets published_at on first publish
    """
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if blog is None:
        return None

    update_data = data.model_dump(exclude_unset=True)

    # Re-generate slug if title changed
    if "title" in update_data and update_data["title"] != blog.title:
        new_slug = generate_slug(update_data["title"])
        new_slug = ensure_unique_slug(db, Blog, new_slug, exclude_id=blog.id)
        blog.slug = new_slug

    # Convert enum to string value if status is present
    if "status" in update_data and update_data["status"] is not None:
        previous_status = blog.status
        update_data["status"] = apply_content_status_transition(blog, update_data["status"])
        if update_data["status"] != previous_status:
            apply_content_status_metadata(blog, actor_id=status_actor_id, reason=status_reason)

    for field, value in update_data.items():
        setattr(blog, field, value)

    db.commit()
    
    # Re-fetch to get correct interaction counts for response
    return get_blog_by_id(db, blog_id, include_drafts=True)


def delete_blog(db: Session, blog_id: int) -> bool:
    """
    Delete a blog post by ID.

    Returns True if the blog was found and deleted, False if not found.
    """
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if blog is None:
        return False

    db.delete(blog)
    db.commit()
    return True
