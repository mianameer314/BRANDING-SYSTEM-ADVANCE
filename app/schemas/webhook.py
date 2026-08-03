"""
Pydantic schemas for Webhook management.
"""
from datetime import datetime
from pydantic import BaseModel, HttpUrl, Field

class WebhookCreate(BaseModel):
    url: HttpUrl = Field(..., description="Target endpoint URL (must be a valid HTTP/HTTPS URL)")
    event: str = Field(..., description="Event name, e.g. content.published")
    content_types: list[str] = Field(
        ..., 
        description='List of content types to trigger on, e.g. ["blog", "news"] or ["*"] for all'
    )
    description: str | None = Field(None, description="Human-readable label for this webhook")


class WebhookUpdate(BaseModel):
    url: HttpUrl | None = None
    event: str | None = None
    content_types: list[str] | None = None
    description: str | None = None
    is_active: bool | None = None


class WebhookOut(BaseModel):
    id: int
    url: str
    event: str
    content_types: list[str]
    description: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    # We don't expose the full secret in the list/get response for security
    # We will mask it in the service layer or keep it hidden. 
    # For now we'll include it for the UI if needed, but it's best to mask it.
    secret: str

    class Config:
        from_attributes = True


class WebhookLogOut(BaseModel):
    id: int
    webhook_id: int
    event: str
    content_type: str
    content_id: int
    request_url: str
    response_status: int | None
    success: bool
    error_message: str | None
    request_body: str | None
    response_body: str | None
    delivered_at: datetime

    class Config:
        from_attributes = True


class WebhookTestResponse(BaseModel):
    success: bool
    status_code: int | None = None
    message: str | None = None
