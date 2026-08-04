"""Schemas for immutable revision history and audit-event queries."""
from datetime import datetime

from pydantic import BaseModel, Field


class ContentRevisionOut(BaseModel):
    id: int
    content_type: str
    content_id: int
    version: int
    action: str
    snapshot: dict
    changed_fields: list[str] | None
    actor_id: int | None
    source: str
    approval_reference: str | None
    status_reason: str | None
    restored_from_revision_id: int | None
    created_at: datetime

    class Config:
        from_attributes = True


class RestoreRevisionRequest(BaseModel):
    reason: str | None = Field(None, max_length=500)


class RestoreRevisionOut(BaseModel):
    content_type: str
    content_id: int
    restored_version: int
    status: str
    message: str


class AuditEventOut(BaseModel):
    id: int
    event_type: str
    subject_type: str
    subject_id: int | None
    actor_id: int | None
    details: dict | None
    created_at: datetime

    class Config:
        from_attributes = True
