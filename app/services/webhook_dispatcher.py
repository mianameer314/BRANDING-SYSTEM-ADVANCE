"""
Webhook Dispatcher — fires HTTP POST notifications to registered external URLs.
"""
import hmac
import hashlib
import json
import logging
import httpx
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.config import settings
from app.models.webhook import Webhook
from app.models.webhook_log import WebhookLog
from app.db.session import SessionLocal

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
        # Find matching webhooks: active, correct event, and matching content type (or "*")
        webhooks = db.query(Webhook).filter(
            Webhook.is_active == True,
            Webhook.event == "content.published",
            or_(
                Webhook.content_types.any(content_type),
                Webhook.content_types.any("*")
            )
        ).all()

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

                # Create log entry
                log_entry = WebhookLog(
                    webhook_id=hook.id,
                    event="content.published",
                    content_type=content_type,
                    content_id=content_id,
                    request_url=hook.url,
                    request_body=body_bytes.decode("utf-8"),
                )
                
                try:
                    response = await client.post(
                        hook.url, 
                        content=body_bytes, 
                        headers=headers, 
                        timeout=settings.WEBHOOK_TIMEOUT
                    )
                    log_entry.response_status = response.status_code
                    log_entry.response_body = response.text[:2000] if response.text else None
                    log_entry.success = 200 <= response.status_code < 300
                    if not log_entry.success:
                        log_entry.error_message = f"HTTP Error {response.status_code}"
                except Exception as e:
                    logger.error(f"Webhook {hook.id} delivery failed: {e}")
                    log_entry.success = False
                    log_entry.error_message = str(e)
                
                db.add(log_entry)
        
        db.commit()
