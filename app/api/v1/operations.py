"""
Operations Console endpoints.
Provides aggregated workflow metrics and consolidated review queues across all content types.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, literal_column, union_all, desc

from app.api.deps import DbDep
from app.core.permissions import require_permission
from app.models.user import User
from app.models.blog import Blog
from app.models.news import News
from app.models.project import Project
from app.models.insight import Insight
from app.models.case_study import CaseStudy
from app.models.webhook_log import WebhookLog

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
            model.status_changed_at.label("status_changed_at")
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
    recent_activity_stmt = select(subq).order_by(desc(subq.c.status_changed_at)).limit(5)
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
        if author:
            author_col = getattr(model, "author", None)
            if author_col is not None:
                filters.append(author_col.ilike(f"%{author}%"))
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
