"""
Webhook Dispatcher — fires HTTP POST notifications to registered external URLs.
"""
import hmac
import hashlib
import json
import logging
import uuid
import time
import httpx
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.models.webhook import Webhook
from app.models.webhook_log import WebhookLog
from app.db.session import SessionLocal
from app.services.revision_history import record_audit_event

logger = logging.getLogger(__name__)

async def dispatch_publish_event(
    content_type: str,
    content_id: int,
    payload: dict
) -> None:
    """
    Background task to dispatch webhooks for a publish event.
    Runs after the DB transaction is committed.
    """
    if not settings.WEBHOOK_ENABLED:
        return

    # We need a new DB session since this runs in a background task after the original session is closed
    with SessionLocal() as db:
        # Find matching webhooks: active and correct event
        # Find matching webhooks: fetch ALL (even inactive) to log skipped deliveries
        webhooks_all = db.query(Webhook).filter(
            Webhook.event == "content.published"
        ).all()
        
        # Filter array in python to support SQLite test db
        webhooks = [
            w for w in webhooks_all
            if content_type in w.content_types or "*" in w.content_types
        ]

        if not webhooks:
            return

        # Prepare versioned payload
        body_dict = {
            "version": "1.0",
            "event": "content.published",
            "content_type": content_type,
            "content_id": content_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": payload
        }
        body_bytes = json.dumps(body_dict).encode("utf-8")

        async with httpx.AsyncClient() as client:
            for hook in webhooks:
                if not hook.is_active:
                    delivery_id = str(uuid.uuid4())
                    dedup_key = hashlib.sha256(f"content.published|{content_type}|{content_id}|{time.time()}".encode("utf-8")).hexdigest()
                    log_entry = WebhookLog(
                        webhook_id=hook.id,
                        event="content.published",
                        content_type=content_type,
                        content_id=content_id,
                        request_url=hook.url,
                        request_body="<SKIPPED>",
                        delivery_id=delivery_id,
                        dedup_key=dedup_key,
                        success=False,
                        error_message="Skipped: Webhook is currently set to Inactive. Go to System > Webhooks to enable it.",
                        duration_ms=0,
                        response_status=0
                    )
                    db.add(log_entry)
                    try:
                        db.commit()
                    except IntegrityError:
                        db.rollback()
                    continue

                headers = {
                    "Content-Type": "application/json",
                    "X-Webhook-Event": "content.published",
                    "User-Agent": settings.WEBHOOK_USER_AGENT
                }

                if settings.WEBHOOK_SIGNING_ENABLED:
                    signature = hmac.new(
                        hook.secret.encode("utf-8"), 
                        body_bytes, 
                        hashlib.sha256
                    ).hexdigest()
                    headers["X-Webhook-Signature"] = f"sha256={signature}"

                window = int(time.time() / 10)
                dedup_key = hashlib.sha256(f"content.published|{content_type}|{content_id}|{window}".encode("utf-8")).hexdigest()
                delivery_id = str(uuid.uuid4())

                # Create log entry
                log_entry = WebhookLog(
                    webhook_id=hook.id,
                    event="content.published",
                    content_type=content_type,
                    content_id=content_id,
                    request_url=hook.url,
                    request_body=body_bytes.decode("utf-8"),
                    delivery_id=delivery_id,
                    dedup_key=dedup_key,
                )
                
                start_time = time.time()
                try:
                    response = await client.post(
                        hook.url, 
                        content=body_bytes, 
                        headers=headers, 
                        timeout=settings.WEBHOOK_TIMEOUT
                    )
                    end_time = time.time()
                    log_entry.duration_ms = int((end_time - start_time) * 1000)
                    log_entry.response_status = response.status_code
                    log_entry.response_body = response.text[:2000] if response.text else None
                    log_entry.success = 200 <= response.status_code < 300

                    if not log_entry.success:
                        log_entry.error_message = f"HTTP Error {response.status_code}"
                except Exception as e:
                    end_time = time.time()
                    log_entry.duration_ms = int((end_time - start_time) * 1000)
                    logger.error(f"Webhook {hook.id} delivery failed: {e}")
                    log_entry.success = False
                    log_entry.error_message = str(e)
                
                db.add(log_entry)
                
                try:
                    # Flush to catch unique constraint violations immediately
                    db.flush()
                except IntegrityError as e:
                    db.rollback()
                    if "uq_webhook_log_webhook_dedup" in str(e.orig) or "23505" in str(e.orig):
                        logger.info(f"Webhook {hook.id} deduplicated for event content.published, type {content_type}, id {content_id}. Skipped.")
                        continue
                    else:
                        raise e
                
                record_audit_event(
                    db,
                    event_type="integration.webhook_delivered" if log_entry.success else "integration.webhook_failed",
                    subject_type="webhook",
                    subject_id=hook.id,
                    actor_id=None,
                    details={"content_type": content_type, "content_id": content_id, "status_code": log_entry.response_status},
                )
        
        db.commit()
