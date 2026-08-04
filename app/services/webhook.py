"""
Webhook Service — CRUD operations for webhooks.
"""
import secrets
from sqlalchemy.orm import Session

from app.models.webhook import Webhook
from app.models.webhook_log import WebhookLog
from app.schemas.webhook import WebhookCreate, WebhookUpdate
from app.schemas.common import PaginatedResponse
from app.services.revision_history import record_audit_event


def create_webhook(db: Session, data: WebhookCreate, *, actor_id: int | None = None) -> Webhook:
    # Auto-generate a secure random secret for HMAC signing
    new_secret = secrets.token_hex(32)
    
    webhook = Webhook(
        url=str(data.url),
        event=data.event,
        content_types=data.content_types,
        description=data.description,
        secret=new_secret
    )
    db.add(webhook)
    db.flush()
    record_audit_event(
        db, event_type="integration.webhook_created", subject_type="webhook", subject_id=webhook.id,
        actor_id=actor_id, details={"event": webhook.event, "content_types": webhook.content_types},
    )
    db.commit()
    db.refresh(webhook)
    return webhook


def get_webhook(db: Session, webhook_id: int) -> Webhook | None:
    return db.query(Webhook).filter(Webhook.id == webhook_id).first()


def list_webhooks(
    db: Session,
    page: int = 1,
    per_page: int = 20,
    is_active: bool | None = None
) -> PaginatedResponse:
    query = db.query(Webhook)
    
    if is_active is not None:
        query = query.filter(Webhook.is_active == is_active)
        
    total = query.count()
    
    items = query.order_by(Webhook.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    
    return PaginatedResponse(
        total=total,
        page=page,
        per_page=per_page,
        items=items
    )


def update_webhook(db: Session, webhook_id: int, data: WebhookUpdate, *, actor_id: int | None = None) -> Webhook | None:
    webhook = get_webhook(db, webhook_id)
    if not webhook:
        return None
        
    update_data = data.model_dump(exclude_unset=True)
    
    # URL needs to be cast to str if updated
    if "url" in update_data and update_data["url"] is not None:
        update_data["url"] = str(update_data["url"])
        
    for field, value in update_data.items():
        setattr(webhook, field, value)

    record_audit_event(
        db, event_type="integration.webhook_updated", subject_type="webhook", subject_id=webhook.id,
        actor_id=actor_id, details={"changed_fields": sorted(update_data)},
    )
    db.commit()
    db.refresh(webhook)
    return webhook


def delete_webhook(db: Session, webhook_id: int, *, actor_id: int | None = None) -> bool:
    webhook = get_webhook(db, webhook_id)
    if not webhook:
        return False
        
    record_audit_event(
        db, event_type="integration.webhook_deleted", subject_type="webhook", subject_id=webhook.id,
        actor_id=actor_id, details={"event": webhook.event},
    )
    db.delete(webhook)
    db.commit()
    return True


def list_webhook_logs(
    db: Session,
    webhook_id: int,
    page: int = 1,
    per_page: int = 20
) -> PaginatedResponse:
    query = db.query(WebhookLog).filter(WebhookLog.webhook_id == webhook_id)
    total = query.count()
    
    items = query.order_by(WebhookLog.delivered_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    
    return PaginatedResponse(
        total=total,
        page=page,
        per_page=per_page,
        items=items
    )
