"""
Insight schemas — Create / Update / Out pattern.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import ContentStatus, ContentInteractionMixin


class InsightCreate(BaseModel):
    """Request body for creating an insight article."""
    title: str = Field(..., max_length=200)
    author: str = Field(..., max_length=150)
    content: str
    excerpt: Optional[str] = Field(None, max_length=300)
    cover_image: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    tags: Optional[list[str]] = None
    status: ContentStatus = ContentStatus.draft


class InsightUpdate(BaseModel):
    """Request body for updating an insight — all fields optional."""
    title: Optional[str] = Field(None, max_length=200)
    author: Optional[str] = Field(None, max_length=150)
    content: Optional[str] = None
    excerpt: Optional[str] = Field(None, max_length=300)
    cover_image: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    tags: Optional[list[str]] = None
    status: Optional[ContentStatus] = None


class InsightOut(ContentInteractionMixin, BaseModel):
    """Response model for an insight article."""
    id: int
    title: str
    slug: str
    author: str
    content: str
    excerpt: Optional[str]
    cover_image: Optional[str]
    category: Optional[str]
    tags: Optional[list[str]]
    status: str
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
