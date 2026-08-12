"""Shared transactional revision-history and audit-event helpers."""
from datetime import date, datetime
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import DateTime, func
from sqlalchemy.inspection import inspect
from sqlalchemy.orm import Session

from app.models.audit_event import AuditEvent
from app.models.blog import Blog
from app.models.case_study import CaseStudy
from app.models.content_revision import ContentRevision
from app.models.insight import Insight
from app.models.news import News
from app.models.project import Project
from app.services.content_lifecycle import apply_content_status_metadata


CONTENT_MODELS = {
    "blog": Blog,
    "news": News,
    "project": Project,
    "insight": Insight,
    "case_study": CaseStudy,
}

MODEL_CONTENT_TYPES = {model: content_type for content_type, model in CONTENT_MODELS.items()}


def _json_value(value: Any) -> Any:
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value


def content_snapshot(content) -> dict[str, Any]:
    """Return a JSON-safe snapshot of persisted model columns only."""
    return {
        column.key: _json_value(getattr(content, column.key))
        for column in inspect(content).mapper.columns
    }


def content_type_for(content) -> str:
    try:
        return MODEL_CONTENT_TYPES[type(content)]
    except KeyError as exc:
        raise ValueError(f"Unsupported revision content model: {type(content)!r}") from exc


def get_revision_referenced_urls(
    db: Session,
    content_type: str,
    content_id: int,
) -> set[str]:
    """Collect all image/file URLs stored in any revision snapshot for this content.

    The update endpoints must NOT delete files from storage if they appear
    in a historical snapshot — otherwise restoring that version would show
    broken images.

    Scans snapshot fields that are known to contain URLs:
      - cover_image (str)
      - client_logo (str)
      - gallery (list[str])
      - _resources[].file_url (list[dict])
    """
    revisions = (
        db.query(ContentRevision.snapshot)
        .filter(
            ContentRevision.content_type == content_type,
            ContentRevision.content_id == content_id,
        )
        .all()
    )
    urls: set[str] = set()
    for (snapshot,) in revisions:
        if not snapshot:
            continue
        # Single-value URL fields
        for field in ("cover_image", "client_logo"):
            val = snapshot.get(field)
            if val:
                urls.add(val)
        # List-of-URL field (gallery)
        gallery = snapshot.get("gallery")
        if gallery and isinstance(gallery, list):
            for url in gallery:
                if url:
                    urls.add(url)
        # Resource snapshots
        resources = snapshot.get("_resources")
        if resources and isinstance(resources, list):
            for r in resources:
                fu = r.get("file_url") if isinstance(r, dict) else None
                if fu:
                    urls.add(fu)
    return urls


def get_content_model(content_type: str):
    model = CONTENT_MODELS.get(content_type)
    if model is None:
        allowed = ", ".join(CONTENT_MODELS)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported content_type '{content_type}'. Allowed: {allowed}.",
        )
    return model


def record_audit_event(
    db: Session,
    *,
    event_type: str,
    subject_type: str,
    subject_id: int | None,
    actor_id: int | None,
    details: dict | None = None,
) -> AuditEvent:
    """Stage an append-only audit event in the caller's current transaction."""
    event = AuditEvent(
        event_type=event_type,
        subject_type=subject_type,
        subject_id=subject_id,
        actor_id=actor_id,
        details=details,
    )
    db.add(event)
    return event


def record_content_revision(
    db: Session,
    content,
    *,
    action: str,
    actor_id: int | None,
    changed_fields: list[str] | None = None,
    source: str = "cms_api",
    approval_reference: str | None = None,
    status_reason: str | None = None,
    restored_from_revision_id: int | None = None,
) -> ContentRevision:
    """Stage the next immutable version and its audit event in one transaction."""
    db.flush()
    content_type = content_type_for(content)
    next_version = (
        db.query(func.coalesce(func.max(ContentRevision.version), 0))
        .filter(
            ContentRevision.content_type == content_type,
            ContentRevision.content_id == content.id,
        )
        .scalar()
        + 1
    )
    snapshot = content_snapshot(content)
    
    # Snapshot associated resources
    from app.models.resource import Resource
    resources = db.query(Resource).filter(
        Resource.content_type == content_type,
        Resource.content_id == content.id
    ).all()
    snapshot["_resources"] = [
        {"file_url": r.file_url, "file_name": r.file_name, "created_at": r.created_at.isoformat()}
        for r in resources
    ]

    # Dynamically compute changed fields by diffing with the previous revision
    previous_revision = (
        db.query(ContentRevision)
        .filter(
            ContentRevision.content_type == content_type,
            ContentRevision.content_id == content.id,
        )
        .order_by(ContentRevision.version.desc())
        .first()
    )
    
    computed_changed_fields = []
    if previous_revision:
        for key, new_val in snapshot.items():
            if key in {"updated_at", "status_changed_at", "status_changed_by_id", "status_change_reason"}:
                continue
            old_val = previous_revision.snapshot.get(key)
            if key == "_resources" and old_val is None:
                old_val = [] # Treat untracked legacy resources as empty
            if new_val != old_val:
                computed_changed_fields.append(key)
    else:
        computed_changed_fields = [k for k in snapshot.keys() if k not in {"updated_at", "status_changed_at", "status_changed_by_id"}]

    if changed_fields is None:
        changed_fields = computed_changed_fields
    else:
        changed_fields = list(set(changed_fields + computed_changed_fields))

    # A transition to approved receives an immutable reference which ties the
    # approval to this exact content version and actor. Other actions leave it
    # blank because they are not approval decisions.
    if approval_reference is None and getattr(content, "status", None) == "approved":
        approval_reference = (
            f"approval:{content_type}:{content.id}:v{next_version}:actor:{actor_id or 'system'}"
        )

    revision = ContentRevision(
        content_type=content_type,
        content_id=content.id,
        version=next_version,
        action=action,
        snapshot=snapshot,
        changed_fields=sorted(changed_fields) if changed_fields else None,
        actor_id=actor_id,
        source=source,
        approval_reference=approval_reference,
        status_reason=status_reason,
        restored_from_revision_id=restored_from_revision_id,
    )
    db.add(revision)
    record_audit_event(
        db,
        event_type=f"content.{action}",
        subject_type=content_type,
        subject_id=content.id,
        actor_id=actor_id,
        details={"version": next_version, "changed_fields": revision.changed_fields},
    )
    return revision


def ensure_content_baseline(db: Session, content, *, actor_id: int | None = None) -> ContentRevision | None:
    """Snapshot legacy content before its first Day 3 mutation."""
    db.flush()
    content_type = content_type_for(content)
    exists = (
        db.query(ContentRevision.id)
        .filter(
            ContentRevision.content_type == content_type,
            ContentRevision.content_id == content.id,
        )
        .first()
    )
    if exists is None:
        return record_content_revision(db, content, action="baseline", actor_id=actor_id)
    return None


def list_content_revisions(
    db: Session, content_type: str, content_id: int, *, page: int = 1, per_page: int = 20
) -> dict:
    from app.models.user import User

    model = get_content_model(content_type)
    if db.query(model.id).filter(model.id == content_id).first() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")
    query = (
        db.query(ContentRevision)
        .filter(
            ContentRevision.content_type == content_type,
            ContentRevision.content_id == content_id,
        )
        .order_by(ContentRevision.version.desc())
    )
    total = query.count()
    revisions = query.offset((page - 1) * per_page).limit(per_page).all()

    # Resolve actor IDs to names
    actor_ids = {r.actor_id for r in revisions if r.actor_id is not None}
    actor_map: dict[int, str] = {}
    if actor_ids:
        users = db.query(User.id, User.full_name).filter(User.id.in_(actor_ids)).all()
        actor_map = {u.id: u.full_name for u in users}

    # Attach actor_name to each revision
    items = []
    for rev in revisions:
        rev.actor_name = actor_map.get(rev.actor_id, "System") if rev.actor_id else "System"
        items.append(rev)

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


def restore_content_revision(
    db: Session,
    *,
    content_type: str,
    content_id: int,
    version: int,
    actor_id: int,
    reason: str | None = None,
):
    """Restore a prior snapshot and record the restore as a new immutable revision."""
    model = get_content_model(content_type)
    content = db.query(model).filter(model.id == content_id).first()
    if content is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")

    revision = (
        db.query(ContentRevision)
        .filter(
            ContentRevision.content_type == content_type,
            ContentRevision.content_id == content_id,
            ContentRevision.version == version,
        )
        .first()
    )
    if revision is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Revision not found")

    protected = {"id", "slug", "created_at", "updated_at", "status_changed_at", "status_changed_by_id", "status_change_reason"}
    from app.models.resource import Resource
    from sqlalchemy.orm.attributes import flag_modified
    
    # If the snapshot tracked resources, replace current resources with the snapshotted ones
    if "_resources" in revision.snapshot:
        db.query(Resource).filter(
            Resource.content_type == content_type,
            Resource.content_id == content_id
        ).delete()
        for r_data in revision.snapshot["_resources"]:
            new_r = Resource(
                content_type=content_type,
                content_id=content_id,
                file_url=r_data["file_url"],
                file_name=r_data.get("file_name"),
            )
            db.add(new_r)

    for column in model.__table__.columns:
        field = column.name
        if field == "_resources" or field in protected:
            continue
            
        if field in revision.snapshot:
            value = revision.snapshot[field]
            if value is not None and isinstance(column.type, DateTime):
                value = datetime.fromisoformat(value)
        else:
            # Field didn't exist in the snapshot (added in later migration).
            # Its value at the time was effectively None.
            value = None
            
        setattr(content, field, value)
        
        # Explicitly flag JSON columns as modified to ensure SQLAlchemy detects the change
        if field in revision.snapshot and value is not None:
            # If we assign a list/dict, SQLAlchemy might need a hint
            try:
                flag_modified(content, field)
            except Exception:
                pass

    apply_content_status_metadata(
        content,
        actor_id=actor_id,
        reason=reason or f"Restored revision {version}",
    )
    record_content_revision(
        db,
        content,
        action="restored",
        actor_id=actor_id,
        changed_fields=[field for field in revision.snapshot if field not in protected],
        source="revision_restore",
        status_reason=content.status_change_reason,
        restored_from_revision_id=revision.id,
    )
    db.commit()
    db.refresh(content)
    return content
