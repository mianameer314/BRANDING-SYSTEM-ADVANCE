"""
Project service — CRUD operations for project showcases.
All database logic lives here; route handlers stay thin.
"""
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.utils.slug import ensure_unique_slug, generate_slug
from app.services.interactions_helper import apply_interaction_annotations, format_interaction_results
from app.services.content_lifecycle import apply_content_status_metadata, apply_content_status_transition, validate_initial_status


def list_projects(
    db: Session,
    *,
    page: int = 1,
    per_page: int = 10,
    search: str | None = None,
    status: str | None = None,
    category: str | None = None,
    is_featured: bool | None = None,
    sort_by: str | None = None,
    sort_order: str | None = None,
    user_id: int | None = None,
    include_drafts: bool = False,
) -> dict:
    """Paginated project listing with search, filtering, and sorting."""
    query = db.query(Project)

    if search:
        search = search.strip()
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Project.name.ilike(search_term),
                Project.short_desc.ilike(search_term),
                Project.slug.ilike(search_term)
            )
        )

    if status is not None:
        query = query.filter(Project.status == status)
    if category is not None:
        query = query.filter(Project.category == category)
    if not include_drafts:
        query = query.filter(Project.status == "published")
    if is_featured is not None:
        query = query.filter(Project.is_featured == is_featured)

    total = query.count()
    query = apply_interaction_annotations(query, Project, user_id)
    
    # ── Sorting ───────────────────────────────────────────────
    allowed_sort_fields = {"title": Project.name, "created_at": Project.created_at, "updated_at": Project.updated_at}
    sort_column = allowed_sort_fields.get(sort_by, Project.updated_at)
    
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    offset = (page - 1) * per_page
    rows = query.offset(offset).limit(per_page).all()
    items = format_interaction_results(rows, has_user=bool(user_id))

    return {"items": items, "total": total, "page": page, "per_page": per_page}


def get_project_by_slug(db: Session, slug: str, user_id: int | None = None, include_drafts: bool = False) -> Project | None:
    """Fetch a single project by its URL slug. Returns None if not found."""
    query = apply_interaction_annotations(db.query(Project), Project, user_id)
    if not include_drafts:
        query = query.filter(Project.status == "published")
    row = query.filter(Project.slug == slug).first()
    if not row:
        return None
    return format_interaction_results([row], has_user=bool(user_id))[0]


def get_project_by_id(db: Session, project_id: int, user_id: int | None = None, include_drafts: bool = False) -> Project | None:
    """Fetch a single project by its ID. Returns None if not found."""
    query = apply_interaction_annotations(db.query(Project), Project, user_id)
    if not include_drafts:
        query = query.filter(Project.status == "published")
    row = query.filter(Project.id == project_id).first()
    if not row:
        return None
    return format_interaction_results([row], has_user=bool(user_id))[0]


def create_project(db: Session, data: ProjectCreate, *, status_actor_id: int | None = None, status_reason: str | None = None) -> Project:
    """Create a new project showcase with auto-generated slug from name."""
    slug = generate_slug(data.name)
    slug = ensure_unique_slug(db, Project, slug)

    initial_status = validate_initial_status(data.status)

    project = Project(
        **data.model_dump(exclude={"status"}),
        slug=slug,
        status=initial_status,
    )

    if initial_status == "published" and project.published_at is None:
        project.published_at = datetime.now(timezone.utc)
    apply_content_status_metadata(project, actor_id=status_actor_id, reason=status_reason)

    db.add(project)
    db.commit()
    db.refresh(project)
    
    project.likes_count = 0
    project.comments_count = 0
    project.is_liked = False
    return project


def update_project(db: Session, project_id: int, data: ProjectUpdate, *, status_actor_id: int | None = None, status_reason: str | None = None) -> Project | None:
    """Partial update of an existing project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        return None

    update_data = data.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"] != project.name:
        new_slug = generate_slug(update_data["name"])
        new_slug = ensure_unique_slug(db, Project, new_slug, exclude_id=project.id)
        project.slug = new_slug

    if "status" in update_data and update_data["status"] is not None:
        previous_status = project.status
        update_data["status"] = apply_content_status_transition(project, update_data["status"])
        if update_data["status"] != previous_status:
            apply_content_status_metadata(project, actor_id=status_actor_id, reason=status_reason)

    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    return get_project_by_id(db, project_id, include_drafts=True)


def delete_project(db: Session, project_id: int) -> bool:
    """Delete a project by ID. Returns True if found and deleted."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        return False
    db.delete(project)
    db.commit()
    return True
