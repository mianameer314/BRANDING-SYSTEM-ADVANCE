from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy import select, func

from app.api.deps import DbDep
from app.core.permissions import require_permission
from app.models.user import User
from app.models.blog import Blog
from app.models.news import News
from app.models.project import Project
from app.models.insight import Insight
from app.models.case_study import CaseStudy

router = APIRouter(prefix="/stats", tags=["Stats"])

ReadDep = Annotated[User, Depends(require_permission("read_content"))]

def get_status_counts(db, model):
    stmt = select(model.status, func.count(model.id)).group_by(model.status)
    results = db.execute(stmt).all()
    return {status: count for status, count in results}

@router.get("/dashboard")
def get_dashboard_stats(db: DbDep, user: ReadDep):
    """
    Get aggregated counts by status for all content types.
    """
    return {
        "blogs": get_status_counts(db, Blog),
        "news": get_status_counts(db, News),
        "projects": get_status_counts(db, Project),
        "insights": get_status_counts(db, Insight),
        "case_studies": get_status_counts(db, CaseStudy),
    }
