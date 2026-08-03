"""
News schemas — Create / Update / Out pattern.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import ContentStatus, ContentInteractionMixin


class NewsCreate(BaseModel):
    """Request body for creating a news article."""
    headline: str = Field(..., max_length=150)
    summary: str
    cover_image: Optional[str] = None
    source: Optional[str] = Field(None, max_length=255)
    is_featured: bool = False
    status: ContentStatus = ContentStatus.draft


class NewsUpdate(BaseModel):
    """Request body for updating a news article — all fields optional."""
    headline: Optional[str] = Field(None, max_length=150)
    summary: Optional[str] = None
    cover_image: Optional[str] = None
    source: Optional[str] = Field(None, max_length=255)
    is_featured: Optional[bool] = None
    status: Optional[ContentStatus] = None


class NewsOut(ContentInteractionMixin, BaseModel):
    """Response model for a news article."""
    id: int
    headline: str
    slug: str
    summary: str
    cover_image: Optional[str]
    source: Optional[str]
    is_featured: bool
    status: str
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
