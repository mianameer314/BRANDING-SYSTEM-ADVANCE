"""
Operations service — business logic for approval workflow actions.
"""
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import false
from sqlalchemy import select, func, literal_column, union_all, desc, or_, and_
from sqlalchemy.orm import Session

from app.models.blog import Blog
from app.models.case_study import CaseStudy
from app.models.content_revision import ContentRevision
from app.models.insight import Insight
from app.models.news import News
from app.models.project import Project
from app.models.audit_event import AuditEvent
from app.models.user import User
from app.services.content_lifecycle import (
    apply_content_status_transition,
    apply_content_status_metadata,
    validate_status_transition,
)
from app.services.revision_history import (
    content_snapshot,
    content_type_for,
    record_audit_event,
    record_content_revision,
)


CONTENT_MODELS = {
    "blog": Blog,
    "news": News,
    "project": Project,
    "insight": Insight,
    "case_study": CaseStudy,
}


def get_content_model(content_type: str):
    model = CONTENT_MODELS.get(content_type)
    if model is None:
        allowed = ", ".join(CONTENT_MODELS)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported content_type '{content_type}'. Allowed: {allowed}.",
        )
    return model


def get_content_by_id(db: Session, content_type: str, content_id: int):
    """Load content by type and ID, or raise 404."""
    model = get_content_model(content_type)
    content = db.query(model).filter(model.id == content_id).first()
    if content is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{content_type.capitalize()} with ID {content_id} not found.",
        )
    return content


def record_approval_audit(
    db: Session,
    *,
    event_type: str,
    content_type: str,
    content_id: int,
    actor_id: int,
    details: dict | None = None,
) -> AuditEvent:
    """Record an audit event for approval actions."""
    return record_audit_event(
        db,
        event_type=event_type,
        subject_type=content_type,
        subject_id=content_id,
        actor_id=actor_id,
        details=details,
    )


def approve_content(
    db: Session,
    *,
    content_type: str,
    content_id: int,
    actor_id: int,
    comment: Optional[str] = None,
    reason: Optional[str] = None,
) -> object:
    """
    Approve content for publication.
    - Validates current status is "in_review" or "changes_requested"
    - Records audit event
    - Creates revision snapshot
    - Updates content status to "approved"
    """
    content = get_content_by_id(db, content_type, content_id)

    # Validate current status allows approval
    current_status = content.status.value if hasattr(content.status, "value") else content.status
    if str(current_status).lower() == "changes_requested":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Content is currently with the author for changes. It must be resubmitted for review before it can be approved.",
        )
    if str(current_status).lower() != "in_review":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve content in status '{current_status}'. Must be in_review.",
        )

    # Apply status transition to approved
    apply_content_status_transition(content, "approved")
    
    # Check if we should schedule or publish it immediately
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    
    if content.published_at and content.published_at > now:
        # Schedule it
        new_status = apply_content_status_transition(content, "scheduled")
        action_reason = comment or reason or "Approved and scheduled for future publication"
    else:
        # Publish it immediately
        new_status = apply_content_status_transition(content, "published")
        action_reason = comment or reason or "Approved and published immediately"

    apply_content_status_metadata(
        content,
        actor_id=actor_id,
        reason=action_reason,
    )

    # Record audit event
    record_approval_audit(
        db,
        event_type="content_approved",
        content_type=content_type,
        content_id=content_id,
        actor_id=actor_id,
        details={"comment": comment, "reason": reason, "previous_status": current_status},
    )

    # Create revision snapshot
    record_content_revision(
        db,
        content,
        action="workflow",
        actor_id=actor_id,
        changed_fields=["status", "status_changed_at", "status_changed_by_id", "status_change_reason"],
        source="approval_workflow",
        approval_reference=f"approved_by_{actor_id}",
        status_reason=content.status_change_reason,
    )

    db.commit()
    db.refresh(content)
    return content


def request_changes(
    db: Session,
    *,
    content_type: str,
    content_id: int,
    actor_id: int,
    comment: str,
    reason: Optional[str] = None,
) -> object:
    """
    Request changes on content.
    - Requires comment explaining what needs to change
    - Records audit event
    - Updates content status to "changes_requested"
    """
    content = get_content_by_id(db, content_type, content_id)

    # Validate current status
    current_status = content.status.value if hasattr(content.status, "value") else content.status
    if str(current_status).lower() not in ("in_review", "approved", "published"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot request changes for content in status '{current_status}'.",
        )

    # Apply status transition
    new_status = apply_content_status_transition(content, "changes_requested")
    apply_content_status_metadata(
        content,
        actor_id=actor_id,
        reason=comment,
    )

    # Record audit event
    record_approval_audit(
        db,
        event_type="content_changes_requested",
        content_type=content_type,
        content_id=content_id,
        actor_id=actor_id,
        details={"comment": comment, "reason": reason, "previous_status": current_status},
    )

    # Create revision snapshot
    record_content_revision(
        db,
        content,
        action="workflow",
        actor_id=actor_id,
        changed_fields=["status", "status_changed_at", "status_changed_by_id", "status_change_reason"],
        source="approval_workflow",
        approval_reference=f"changes_requested_by_{actor_id}",
        status_reason=content.status_change_reason,
    )

    db.commit()
    db.refresh(content)
    return content


def reject_content(
    db: Session,
    *,
    content_type: str,
    content_id: int,
    actor_id: int,
    comment: str,
    reason: Optional[str] = None,
) -> object:
    """
    Reject content.
    - Requires comment explaining reason
    - Records audit event
    - Updates content status to "archived"
    """
    content = get_content_by_id(db, content_type, content_id)

    # Validate current status
    current_status = content.status.value if hasattr(content.status, "value") else content.status
    if str(current_status).lower() in ("archived", "published"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject content in status '{current_status}'.",
        )

    # Apply status transition
    new_status = apply_content_status_transition(content, "archived")
    apply_content_status_metadata(
        content,
        actor_id=actor_id,
        reason=comment,
    )

    # Record audit event
    record_approval_audit(
        db,
        event_type="content_rejected",
        content_type=content_type,
        content_id=content_id,
        actor_id=actor_id,
        details={"comment": comment, "reason": reason, "previous_status": current_status},
    )

    # Create revision snapshot
    record_content_revision(
        db,
        content,
        action="workflow",
        actor_id=actor_id,
        changed_fields=["status", "status_changed_at", "status_changed_by_id", "status_change_reason"],
        source="approval_workflow",
        approval_reference=f"rejected_by_{actor_id}",
        status_reason=content.status_change_reason,
    )

    db.commit()
    db.refresh(content)
    return content


def get_review_queue(
    db: Session,
    *,
    page: int = 1,
    per_page: int = 20,
    content_type: Optional[str] = None,
    author: Optional[str] = None,
    search: Optional[str] = None,
    ai_generated: Optional[bool] = None,
) -> dict:
    """
    Get paginated review queue (items with status in_review or changes_requested).
    """
   

    models_mapping = CONTENT_MODELS

    if content_type and content_type in models_mapping:
        models_mapping = {content_type: models_mapping[content_type]}

    def filter_builder(model):
        filters = []
        # Only items in review or changes_requested
        filters.append(model.status.in_(["in_review", "changes_requested"]))
        if author:
            author_col = getattr(model, "author", None)
            if author_col is not None:
                filters.append(author_col.ilike(f"%{author}%"))
            else:
                
                filters.append(false())
        if ai_generated is not None:
            filters.append(model.ai_generated == ai_generated)
        if search:
            title_col_for_search = getattr(model, "title", None)
            if title_col_for_search is None:
                title_col_for_search = getattr(model, "headline", None)
            if title_col_for_search is None:
                title_col_for_search = getattr(model, "name", None)
            
            if title_col_for_search is not None:
                filters.append(title_col_for_search.ilike(f"%{search}%"))
        return filters

    # Build union query
    selects = []
    for ct, model in models_mapping.items():
        title_col = getattr(model, "title", None)
        if title_col is None:
            title_col = getattr(model, "headline", None)
        if title_col is None:
            title_col = getattr(model, "name", None)

        author_col = getattr(model, "author", None)
        if author_col is None:
            author_col = literal_column("''")

        stmt = select(
            model.id.label("id"),
            literal_column(f"'{ct}'").label("content_type"),
            title_col.label("title"),
            model.slug.label("slug"),
            model.status.label("status"),
            author_col.label("author"),
            model.created_at.label("created_at"),
            model.updated_at.label("updated_at"),
            model.status_changed_at.label("status_changed_at"),
            model.published_at.label("published_at"),
            model.cover_image.label("cover_image"),
            model.ai_generated.label("ai_generated"),
        )
        if filter_builder(model):
            stmt = stmt.where(*filter_builder(model))
        selects.append(stmt)

    union_stmt = union_all(*selects)
    subq = union_stmt.subquery()

    # Count total
    count_stmt = select(func.count()).select_from(subq)
    total = db.scalar(count_stmt) or 0

    # Paginate - order by status_changed_at (oldest first = longest waiting)
    items_stmt = select(subq).order_by(subq.c.status_changed_at.asc().nulls_last(), subq.c.updated_at.asc()).offset((page - 1) * per_page).limit(per_page)
    results = db.execute(items_stmt).mappings().all()
    items = [dict(row) for row in results]

    # Dynamically fetch full models to calculate validation warnings
    for item in items:
        ct = item["content_type"]
        cid = item["id"]
        model = CONTENT_MODELS[ct]
        instance = db.query(model).filter(model.id == cid).first()
        warnings = []
        if instance:
            from sqlalchemy.inspection import inspect
            mapper = inspect(model)
            
            ignore_fields = {
                "id", "slug", "status", "ai_generated", 
                "published_at", "status_changed_at", 
                "status_changed_by_id", "status_change_reason", 
                "created_at", "updated_at"
            }
            
            for column in mapper.columns:
                if column.name in ignore_fields:
                    continue
                
                val = getattr(instance, column.name, None)
                is_missing = val is None or (isinstance(val, (str, list, dict)) and not val)
                
                if is_missing:
                    field_name = column.name.replace("_", " ")
                    if column.nullable:
                        warnings.append(f"Missing {field_name} (optional)")
                    else:
                        warnings.append(f"Missing {field_name}")

            # Extra preview fields for UI
            preview = ""
            if ct in ("blog", "insight") and getattr(instance, "excerpt", None):
                preview = getattr(instance, "excerpt")
            elif ct == "news" and getattr(instance, "summary", None):
                preview = getattr(instance, "summary")
            elif ct == "project" and getattr(instance, "short_desc", None):
                preview = getattr(instance, "short_desc")
            elif ct == "case_study" and getattr(instance, "challenge", None):
                challenge = getattr(instance, "challenge")
                preview = f"Challenge: {challenge[:100]}..." if challenge else ""
            item["content_preview"] = preview

            media_count = 0
            if getattr(instance, "cover_image", None): media_count += 1
            if getattr(instance, "client_logo", None): media_count += 1
            gallery = getattr(instance, "gallery", None) or []
            item["media_status"] = {"media_count": media_count + len(gallery), "gallery_count": len(gallery)}
        
        item["validation_warnings"] = warnings

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
    }
