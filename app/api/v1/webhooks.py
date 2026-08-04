"""
Webhook CRUD routes — manage webhook registrations and view delivery logs.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import DbDep
from app.core.permissions import require_permission
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.webhook import (
    WebhookCreate,
    WebhookOut,
    WebhookUpdate,
    WebhookLogOut,
    WebhookTestResponse
)
from app.services import webhook as webhook_service
from app.services.webhook_dispatcher import dispatch_publish_event

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

# Webhooks can only be managed by users with 'manage_users' permission (super_admin) 
# or we can use a generic 'create' permission if admins are allowed.
# Given the DB has "super_admin" and "admin", we'll restrict to super_admin or admin.
# 'manage_users' is super_admin only. 'publish' is admin and super_admin.
# Let's use 'publish' to allow admins, or a dedicated permission. We'll use 'publish' as proxy for admin,
# but 'create' + 'update' + 'delete' + 'manage_users' are available. We'll use 'create', 'update', 'delete'.

AdminDep = Annotated[User, Depends(require_permission("publish"))]


@router.post("", response_model=WebhookOut, status_code=status.HTTP_201_CREATED)
def create_webhook(
    data: WebhookCreate,
    db: DbDep,
    admin: AdminDep
):
    """Register a new webhook."""
    return webhook_service.create_webhook(db, data, actor_id=admin.id)


@router.get("", response_model=PaginatedResponse[WebhookOut])
def list_webhooks(
    db: DbDep,
    admin: AdminDep,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    is_active: bool | None = Query(None)
):
    """List all registered webhooks."""
    return webhook_service.list_webhooks(db, page, per_page, is_active)


@router.get("/{webhook_id}", response_model=WebhookOut)
def get_webhook(
    webhook_id: int,
    db: DbDep,
    admin: AdminDep
):
    """Get a specific webhook by ID."""
    webhook = webhook_service.get_webhook(db, webhook_id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return webhook


@router.put("/{webhook_id}", response_model=WebhookOut)
def update_webhook(
    webhook_id: int,
    data: WebhookUpdate,
    db: DbDep,
    admin: AdminDep
):
    """Update a webhook."""
    webhook = webhook_service.update_webhook(db, webhook_id, data, actor_id=admin.id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return webhook


@router.delete("/{webhook_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_webhook(
    webhook_id: int,
    db: DbDep,
    admin: AdminDep
):
    """Delete a webhook."""
    success = webhook_service.delete_webhook(db, webhook_id, actor_id=admin.id)
    if not success:
        raise HTTPException(status_code=404, detail="Webhook not found")


@router.get("/{webhook_id}/logs", response_model=PaginatedResponse[WebhookLogOut])
def get_webhook_logs(
    webhook_id: int,
    db: DbDep,
    admin: AdminDep,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    """View delivery logs for a specific webhook."""
    # Ensure webhook exists
    webhook = webhook_service.get_webhook(db, webhook_id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
        
    return webhook_service.list_webhook_logs(db, webhook_id, page, per_page)


@router.post("/{webhook_id}/test", response_model=WebhookTestResponse)
async def test_webhook(
    webhook_id: int,
    db: DbDep,
    admin: AdminDep
):
    """Send a test ping to the webhook endpoint."""
    webhook = webhook_service.get_webhook(db, webhook_id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")

    # Dispatch a dummy event directly (awaiting it since we're in async router or we can use background task)
    # The dispatcher is an async function, we can await it directly.
    # We pass a dummy payload.
    test_payload = {"message": "This is a test webhook delivery."}
    
    # We'll call the dispatcher manually for a fake item
    try:
        await dispatch_publish_event(
            content_type="test",
            content_id=0,
            payload=test_payload
        )
        # We assume success if no exception was raised by dispatch_publish_event itself,
        # although dispatch_publish_event catches HTTPErrors and logs them to DB.
        # For a truly synchronous test response, we might need a separate ping function, 
        # but dispatching the background task is sufficient for testing the flow.
        return WebhookTestResponse(success=True, message="Test event dispatched. Check logs for result.")
    except Exception as e:
        return WebhookTestResponse(success=False, message=str(e))
