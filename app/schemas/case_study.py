"""
Case Study schemas — Create / Update / Out pattern.
Most complex content type with metrics, testimonials, and rich narrative sections.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import ContentStatus, MetricItem, ContentInteractionMixin


class CaseStudyCreate(BaseModel):
    """Request body for creating a case study."""
    title: str = Field(..., max_length=200)
    client_name: str = Field(..., max_length=200)
    client_logo: Optional[str] = None
    industry: Optional[str] = Field(None, max_length=100)
    challenge: str
    solution: str
    results: str
    metrics: Optional[list[MetricItem]] = None
    testimonial: Optional[str] = None
    testimonial_author: Optional[str] = Field(None, max_length=200)
    cover_image: Optional[str] = None
    gallery: Optional[list[str]] = None
    technologies: Optional[list[str]] = None
    is_featured: bool = False
    status: ContentStatus = ContentStatus.draft


class CaseStudyUpdate(BaseModel):
    """Request body for updating a case study — all fields optional."""
    title: Optional[str] = Field(None, max_length=200)
    client_name: Optional[str] = Field(None, max_length=200)
    client_logo: Optional[str] = None
    industry: Optional[str] = Field(None, max_length=100)
    challenge: Optional[str] = None
    solution: Optional[str] = None
    results: Optional[str] = None
    metrics: Optional[list[MetricItem]] = None
    testimonial: Optional[str] = None
    testimonial_author: Optional[str] = Field(None, max_length=200)
    cover_image: Optional[str] = None
    gallery: Optional[list[str]] = None
    technologies: Optional[list[str]] = None
    is_featured: Optional[bool] = None
    status: Optional[ContentStatus] = None


class CaseStudyOut(ContentInteractionMixin, BaseModel):
    """Response model for a case study."""
    id: int
    title: str
    slug: str
    client_name: str
    client_logo: Optional[str]
    industry: Optional[str]
    challenge: str
    solution: str
    results: str
    metrics: Optional[list[MetricItem]]
    testimonial: Optional[str]
    testimonial_author: Optional[str]
    cover_image: Optional[str]
    gallery: Optional[list[str]]
    technologies: Optional[list[str]]
    is_featured: bool
    status: str
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
