"""Revision history and audit-event API."""
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.deps import DbDep
from app.core.permissions import require_permission
from app.models.audit_event import AuditEvent
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.revision import AuditEventOut, ContentRevisionOut, RestoreRevisionOut, RestoreRevisionRequest
from app.services import revision_history


router = APIRouter(prefix="/audit", tags=["Audit & Revisions"])

HistoryDep = Annotated[User, Depends(require_permission("view_drafts"))]
RestoreDep = Annotated[User, Depends(require_permission("publish"))]
AuditDep = Annotated[User, Depends(require_permission("manage_users"))]


@router.get("/content/{content_type}/{content_id}/revisions", response_model=PaginatedResponse[ContentRevisionOut])
def list_revisions(
    content_type: str,
    content_id: int,
    db: DbDep,
    user: HistoryDep,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    """List immutable snapshots for one content item, newest version first."""
    return revision_history.list_content_revisions(
        db, content_type, content_id, page=page, per_page=per_page
    )


@router.post(
    "/content/{content_type}/{content_id}/revisions/{version}/restore",
    response_model=RestoreRevisionOut,
)
def restore_revision(
    content_type: str,
    content_id: int,
    version: int,
    data: RestoreRevisionRequest,
    db: DbDep,
    user: RestoreDep,
):
    """Restore a prior snapshot; the restore itself becomes the next revision."""
    content = revision_history.restore_content_revision(
        db,
        content_type=content_type,
        content_id=content_id,
        version=version,
        actor_id=user.id,
        reason=data.reason,
    )
    return RestoreRevisionOut(
        content_type=content_type,
        content_id=content_id,
        restored_version=version,
        status=content.status,
        message=f"Restored revision {version}; a new restore revision was recorded.",
    )


@router.get("/events", response_model=PaginatedResponse[AuditEventOut])
def list_audit_events(
    db: DbDep,
    user: AuditDep,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    subject_type: str | None = Query(None),
    subject_id: int | None = Query(None),
):
    """Super-admin operational audit stream across content, media, users, and webhooks."""
    query = db.query(AuditEvent)
    if subject_type:
        query = query.filter(AuditEvent.subject_type == subject_type)
    if subject_id is not None:
        query = query.filter(AuditEvent.subject_id == subject_id)
    total = query.count()
    return {
        "items": query.order_by(AuditEvent.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all(),
        "total": total,
        "page": page,
        "per_page": per_page,
    }
