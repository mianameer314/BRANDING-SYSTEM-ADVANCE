"""
Operations schemas — request/response models for approval workflow.
"""
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class ApprovalAction(BaseModel):
    content_type: str = Field(..., description="Content type (blog, news, project, insight, case_study)")
    content_id: int = Field(..., ge=1, description="Content ID")
    comment: Optional[str] = Field(None, description="Optional comment for approval")
    reason: Optional[str] = Field(None, description="Optional reason for approval")


class ChangeRequestAction(BaseModel):
    content_type: str = Field(..., description="Content type (blog, news, project, insight, case_study)")
    content_id: int = Field(..., ge=1, description="Content ID")
    comment: str = Field(..., min_length=1, description="Required comment explaining what needs to change")
    reason: Optional[str] = Field(None, description="Optional predefined reason")


class RejectionAction(BaseModel):
    content_type: str = Field(..., description="Content type (blog, news, project, insight, case_study)")
    content_id: int = Field(..., ge=1, description="Content ID")
    comment: str = Field(..., min_length=1, description="Required comment explaining rejection reason")
    reason: Optional[str] = Field(None, description="Optional predefined reason")

from datetime import datetime

class ReviewQueueItem(BaseModel):
    id: int
    content_type: str
    slug: str
    title: str
    status: str
    author: str
    created_at: datetime
    updated_at: datetime
    status_changed_at: datetime | None = None
    cover_image: str | None = None
    ai_generated: bool
    validation_warnings: list[str] = Field(default_factory=list)
    content_preview: str | None = None
    media_status: dict | None = None
    project_url: str | None = None


class ReviewQueueParams(BaseModel):
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)
    content_type: Optional[str] = None
    author: Optional[str] = None
    ai_generated: Optional[bool] = None


class ReviewQueueResponse(BaseModel):
    items: list[ReviewQueueItem]
    total: int
    page: int
    per_page: int
