"""
Comment schemas.
"""
from datetime import datetime

from pydantic import BaseModel


class CommentCreate(BaseModel):
    content_type: str
    content_id: int
    body: str


class CommentUpdate(BaseModel):
    body: str


class CommentOut(BaseModel):
    id: int
    user_id: int
    content_type: str
    content_id: int
    body: str
    is_approved: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
