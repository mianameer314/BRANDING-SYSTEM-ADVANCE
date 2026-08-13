"""
Operations Console endpoints.
Provides aggregated workflow metrics and consolidated review queues across all content types.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, literal_column, union_all, desc

from app.api.deps import DbDep, get_db
from app.core.permissions import require_permission
from app.models.user import User
from app.models.blog import Blog
from app.models.news import News
from app.models.project import Project
from app.models.insight import Insight
from app.models.case_study import CaseStudy
from app.models.webhook_log import WebhookLog


from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.api.deps import get_current_user

class ScheduleContentRequest(BaseModel):
    content_type: str = Field(..., description="Type of content (blog, news, etc)")
    content_id: int
    scheduled_at: datetime
    comment: Optional[str] = None

class RescheduleContentRequest(BaseModel):
    content_type: str
    content_id: int
    scheduled_at: datetime
    comment: Optional[str] = None

class CancelScheduleRequest(BaseModel):
    content_type: str
    content_id: int
    comment: Optional[str] = None

class PublishNowRequest(BaseModel):
    content_type: str
    content_id: int

class RetryPublishRequest(BaseModel):
    log_id: int

class ResolveFailureRequest(BaseModel):
    log_id: int
    comment: str


router = APIRouter(prefix="/operations", tags=["Operations Console"])

ReadDep = Annotated[User, Depends(require_permission("view_drafts"))]

def build_union_query(models_mapping, filters=None):
    selects = []
    for content_type, model in models_mapping.items():
        # Handle title column differences
        title_col = getattr(model, "title", None)
        if title_col is None:
            title_col = getattr(model, "headline", None)
        if title_col is None:
            title_col = getattr(model, "name", None)
            
        # Handle author column differences
        author_col = getattr(model, "author", None)
        if author_col is None:
            author_col = literal_column("''")
            
        stmt = select(
            model.id.label("id"),
            literal_column(f"'{content_type}'").label("content_type"),
            title_col.label("title"),
            model.slug.label("slug"),
            model.status.label("status"),
            author_col.label("author"),
            model.created_at.label("created_at"),
            model.updated_at.label("updated_at"),
            model.status_changed_at.label("status_changed_at"),
            model.cover_image.label("cover_image"),
            model.ai_generated.label("ai_generated")
        )
        if filters:
            stmt = stmt.where(*filters(model))
        selects.append(stmt)
    return union_all(*selects)

@router.get("/workflow-overview")
def get_workflow_overview(db: DbDep, user: ReadDep):
    """
    Aggregated workflow metrics across all content types.
    Returns counts per lifecycle stage per content type.
    """
    models = {
        "blog": Blog,
        "news": News,
        "project": Project,
        "insight": Insight,
        "case_study": CaseStudy,
    }
    
    stages = {
        "draft": {"total": 0, "by_type": {}},
        "in_review": {"total": 0, "by_type": {}},
        "changes_requested": {"total": 0, "by_type": {}},
        "approved": {"total": 0, "by_type": {}},
        "scheduled": {"total": 0, "by_type": {}},
        "published": {"total": 0, "by_type": {}},
        "unpublished": {"total": 0, "by_type": {}},
        "archived": {"total": 0, "by_type": {}},
    }
    
    total_content = 0
    
    for content_type, model in models.items():
        stmt = select(model.status, func.count(model.id)).group_by(model.status)
        results = db.execute(stmt).all()
        for status_val, count in results:
            if status_val not in stages:
                stages[status_val] = {"total": 0, "by_type": {}}
            stages[status_val]["total"] += count
            stages[status_val]["by_type"][content_type] = count
            total_content += count
            
    # Ensure all content types are present in by_type even if 0
    for stage_data in stages.values():
        for ct in models.keys():
            if ct not in stage_data["by_type"]:
                stage_data["by_type"][ct] = 0

    # Count failed webhooks
    failed_webhooks_count = db.scalar(
        select(func.count(WebhookLog.id)).where(WebhookLog.success == False)
    ) or 0

    # Get recent activity (last 5 status changes across all types)
    union_stmt = build_union_query(models)
    subq = union_stmt.subquery()
    recent_activity_stmt = select(subq).order_by(desc(subq.c.updated_at)).limit(5)
    recent_activity_results = db.execute(recent_activity_stmt).mappings().all()
    recent_activity = [dict(row) for row in recent_activity_results]

    return {
        "stages": stages,
        "total_content": total_content,
        "failed_webhooks": failed_webhooks_count,
        "recent_activity": recent_activity
    }

@router.get("/items")
def get_workflow_items(
    db: DbDep,
    user: ReadDep,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    content_type: str | None = Query(None),
    status: str | None = Query(None, description="Comma-separated list of statuses, e.g. 'in_review,changes_requested'"),
    search: str | None = Query(None, description="Search across titles"),
    author: str | None = Query(None, description="Filter by author"),
):
    """
    Paginated list of workflow items across all content types.
    Can filter by content_type and status.
    """
    models_mapping = {
        "blog": Blog,
        "news": News,
        "project": Project,
        "insight": Insight,
        "case_study": CaseStudy,
    }
    
    if content_type and content_type in models_mapping:
        models_mapping = {content_type: models_mapping[content_type]}
        
    def filter_builder(model):
        filters = []
        if status:
            status_list = [s.strip() for s in status.split(",")]
            filters.append(model.status.in_(status_list))
        if search:
            # Handle title column differences
            title_col = getattr(model, "title", None) or getattr(model, "headline", None) or getattr(model, "name", None)
            if title_col is not None:
                filters.append(title_col.ilike(f"%{search}%"))
            else:
                from sqlalchemy import false
                filters.append(false())
        if author:
            author_col = getattr(model, "author", None)
            if author_col is not None:
                filters.append(author_col.ilike(f"%{author}%"))
            else:
                from sqlalchemy import false
                filters.append(false())
        return filters
        
    union_stmt = build_union_query(models_mapping, filter_builder)
    subq = union_stmt.subquery()
    
    # Count total
    count_stmt = select(func.count()).select_from(subq)
    total = db.scalar(count_stmt) or 0
    
    # Paginate
    items_stmt = select(subq).order_by(desc(subq.c.updated_at)).offset((page - 1) * per_page).limit(per_page)
    results = db.execute(items_stmt).mappings().all()
    
    # Convert RowMapping to dict for JSON serialization
    items = [dict(row) for row in results]
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page
    }

# ─── Approval Workflow Endpoints ───

from app.api.idempotency import IdempotencyDep
from app.core.permissions import require_permission
from app.schemas.operations import (
    ApprovalAction,
    ChangeRequestAction,
    RejectionAction,
    ReviewQueueParams,
    ReviewQueueResponse,
)
from app.services.operations import (
    approve_content,
    get_review_queue,
    reject_content,
    request_changes,
)

ApproveDep = Annotated[User, Depends(require_permission("approve"))]


@router.get("/review-queue", response_model=ReviewQueueResponse)
def get_review_queue_endpoint(
    db: DbDep,
    user: ReadDep,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    content_type: str | None = Query(None),
    author: str | None = Query(None),
    search: str | None = Query(None),
    ai_generated: bool | None = Query(None),
):
    """Get paginated review queue (items with status in_review or changes_requested)."""
    return get_review_queue(
        db,
        page=page,
        per_page=per_page,
        content_type=content_type,
        author=author,
        search=search,
        ai_generated=ai_generated,
    )


@router.post("/approve")
def approve_content_endpoint(
    data: ApprovalAction,
    db: DbDep,
    reviewer: ApproveDep,
    idempotency: IdempotencyDep = None,
):
    """
    Approve content for publication.
    - Validates current status is 'in_review' or 'changes_requested'
    - Records audit event
    - Creates revision snapshot
    - Updates content status to 'approved'
    """
    content = approve_content(
        db,
        content_type=data.content_type,
        content_id=data.content_id,
        actor_id=reviewer.id,
        comment=data.comment,
        reason=data.reason,
    )
    response = {"content_type": data.content_type, "content_id": data.content_id, "status": content.status, "message": "Content approved"}
    
    if idempotency:
        idempotency.save(db, 200, response)
        
    return response


@router.post("/request-changes")
def request_changes_endpoint(
    data: ChangeRequestAction,
    db: DbDep,
    reviewer: ApproveDep,
    idempotency: IdempotencyDep = None,
):
    """
    Request changes on content.
    - Requires comment explaining what needs to change
    - Records audit event
    - Updates content status to 'changes_requested'
    """
    content = request_changes(
        db,
        content_type=data.content_type,
        content_id=data.content_id,
        actor_id=reviewer.id,
        comment=data.comment,
        reason=data.reason,
    )
    response = {"content_type": data.content_type, "content_id": data.content_id, "status": content.status, "message": "Changes requested"}
    
    if idempotency:
        idempotency.save(db, 200, response)
        
    return response


@router.post("/reject")
def reject_content_endpoint(
    data: RejectionAction,
    db: DbDep,
    reviewer: ApproveDep,
    idempotency: IdempotencyDep = None,
):
    """
    Reject content.
    - Requires comment explaining reason
    - Records audit event
    - Updates content status to 'archived'
    """
    content = reject_content(
        db,
        content_type=data.content_type,
        content_id=data.content_id,
        actor_id=reviewer.id,
        comment=data.comment,
        reason=data.reason,
    )
    response = {"content_type": data.content_type, "content_id": data.content_id, "status": content.status, "message": "Content rejected and archived"}
    
    if idempotency:
        idempotency.save(db, 200, response)
        
    return response


@router.post("/publish-now")
def publish_now_endpoint(
    data: PublishNowRequest,
    db: DbDep,
    current_user: User = Depends(require_permission("publish")),
    idempotency: IdempotencyDep = None,
):
    """
    Publish content immediately.
    - Transitions from approved/scheduled directly to published
    - Fires webhook instantly
    """
    from app.services.operations import publish_now
    content = publish_now(
        db,
        content_type=data.content_type,
        content_id=data.content_id,
        actor_id=current_user.id,
    )
    response = {"content_type": data.content_type, "content_id": data.content_id, "status": content.status, "message": "Content published successfully"}
    
    if idempotency:
        idempotency.save(db, 200, response)
        
    return response


@router.post("/schedule", response_model=dict)
def schedule_content(
    request: ScheduleContentRequest,
    current_user: User = Depends(require_permission("publish")),
    db: Session = Depends(get_db),
):
    """Schedule content for future publication."""
    try:
        from app.services.operations import schedule_content as s_schedule
        content = s_schedule(
            db,
            content_type=request.content_type,
            content_id=request.content_id,
            actor_id=current_user.id,
            scheduled_at=request.scheduled_at,
            comment=request.comment,
        )
        return {"message": "Content scheduled", "status": content.status, "scheduled_at": content.scheduled_at}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reschedule", response_model=dict)
def reschedule_content(
    request: RescheduleContentRequest,
    current_user: User = Depends(require_permission("publish")),
    db: Session = Depends(get_db),
):
    """Reschedule already scheduled content."""
    try:
        from app.services.operations import reschedule_content as s_reschedule
        content = s_reschedule(
            db,
            content_type=request.content_type,
            content_id=request.content_id,
            actor_id=current_user.id,
            new_scheduled_at=request.scheduled_at,
            comment=request.comment,
        )
        return {"message": "Content rescheduled", "status": content.status, "scheduled_at": content.scheduled_at}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/cancel-schedule", response_model=dict)
def cancel_schedule(
    request: CancelScheduleRequest,
    current_user: User = Depends(require_permission("publish")),
    db: Session = Depends(get_db),
):
    """Cancel scheduled content and revert to approved."""
    try:
        from app.services.operations import cancel_schedule as s_cancel
        content = s_cancel(
            db,
            content_type=request.content_type,
            content_id=request.content_id,
            actor_id=current_user.id,
            comment=request.comment,
        )
        return {"message": "Schedule cancelled", "status": content.status}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/publish-logs", response_model=dict)
def get_publish_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    event: Optional[str] = None,
    content_type: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(require_permission("manage_webhooks")),
    db: Session = Depends(get_db),
):
    """Get paginated webhook publish logs."""
    from app.services.operations import get_publish_logs as s_get_logs
    return s_get_logs(
        db,
        page=page,
        per_page=per_page,
        event=event,
        content_type=content_type,
        status=status,
    )


@router.post("/retry-publish", response_model=dict)
def retry_publish(
    request: RetryPublishRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_permission("manage_webhooks")),
    db: Session = Depends(get_db),
):
    """Retry a failed webhook delivery."""
    from app.services.operations import retry_publish as s_retry
    from app.services.webhook_dispatcher import dispatch_publish_event
    
    log_entry, payload = s_retry(db, log_id=request.log_id, actor_id=current_user.id)
    
    # We run the actual dispatch in background to not block the API
    background_tasks.add_task(
        dispatch_publish_event, 
        content_type=log_entry.content_type, 
        content_id=log_entry.content_id, 
        payload=payload
    )
    
    return {"message": "Retry dispatched", "retry_count": log_entry.retry_count}


@router.post("/resolve-failure", response_model=dict)
def resolve_failure(
    request: ResolveFailureRequest,
    current_user: User = Depends(require_permission("manage_webhooks")),
    db: Session = Depends(get_db),
):
    """Manually mark a failed webhook log as resolved."""
    from app.services.operations import resolve_failure as s_resolve
    
    log_entry = s_resolve(
        db,
        log_id=request.log_id,
        actor_id=current_user.id,
        comment=request.comment
    )
    
    return {"message": "Failure resolved", "resolved_at": log_entry.resolved_at}

@router.get("/schedule-queue", response_model=dict)
def get_schedule_queue(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    content_type: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(require_permission("publish")),
    db: Session = Depends(get_db),
):
    """Get paginated schedule queue (approved and scheduled items)."""
    from app.services.operations import get_schedule_queue as s_get_schedule
    return s_get_schedule(
        db,
        page=page,
        per_page=per_page,
        content_type=content_type,
        search=search,
    )
# trigger reload
