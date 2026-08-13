"""
Project schemas — Create / Update / Out pattern.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import ContentStatus, ContentInteractionMixin


class ProjectCreate(BaseModel):
    """Request body for creating a project showcase."""
    name: str = Field(..., max_length=200)
    client: Optional[str] = Field(None, max_length=200)
    description: str
    short_desc: Optional[str] = Field(None, max_length=300)
    cover_image: Optional[str] = None
    gallery: Optional[list[str]] = None
    technologies: Optional[list[str]] = None
    category: Optional[str] = Field(None, max_length=100)
    project_url: Optional[str] = Field(None, max_length=500)
    is_featured: bool = False
    status: ContentStatus = ContentStatus.draft
    published_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    ai_generated: bool = False


class ProjectUpdate(BaseModel):
    """Request body for updating a project — all fields optional."""
    name: Optional[str] = Field(None, max_length=200)
    client: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    short_desc: Optional[str] = Field(None, max_length=300)
    cover_image: Optional[str] = None
    gallery: Optional[list[str]] = None
    technologies: Optional[list[str]] = None
    category: Optional[str] = Field(None, max_length=100)
    project_url: Optional[str] = Field(None, max_length=500)
    is_featured: Optional[bool] = None
    status: Optional[ContentStatus] = None
    published_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    ai_generated: Optional[bool] = None


class ProjectOut(ContentInteractionMixin, BaseModel):
    """Response model for a project showcase."""
    id: int
    name: str
    slug: str
    client: Optional[str]
    description: str
    short_desc: Optional[str]
    cover_image: Optional[str]
    gallery: Optional[list[str]]
    technologies: Optional[list[str]]
    category: Optional[str]
    project_url: Optional[str]
    is_featured: bool
    status: str
    published_at: Optional[datetime] = None
    completed_at: Optional[datetime]
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    ai_generated: bool

    class Config:
        from_attributes = True
