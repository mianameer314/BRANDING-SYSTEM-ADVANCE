"""
Like schemas.
"""
from datetime import datetime

from pydantic import BaseModel


class LikeCreate(BaseModel):
    content_type: str
    content_id: int


class LikeOut(BaseModel):
    id: int
    content_type: str
    content_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class LikeCheck(BaseModel):
    is_liked: bool
