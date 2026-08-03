"""
Shared schema components used across multiple content types.
"""
from datetime import datetime
from enum import Enum
from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ContentStatus(str, Enum):
    """Publication status for all content types."""
    draft = "draft"
    in_review = "in_review"
    changes_requested = "changes_requested"
    approved = "approved"
    scheduled = "scheduled"
    published = "published"
    unpublished = "unpublished"
    archived = "archived"


class MetricItem(BaseModel):
    """Single KPI metric for Case Studies — e.g. {"label": "Revenue Increase", "value": "40%"}."""
    label: str
    value: str


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated list wrapper returned by all list endpoints."""
    items: list[T]
    total: int
    page: int
    per_page: int


class ContentInteractionMixin(BaseModel):
    """Fields shared by all content output schemas."""
    likes_count: int = 0
    comments_count: int = 0
    is_liked: bool = False
    # These are null until a lifecycle transition is made after creation.
    status_changed_at: datetime | None = None
    status_changed_by_id: int | None = None
    status_change_reason: str | None = None
