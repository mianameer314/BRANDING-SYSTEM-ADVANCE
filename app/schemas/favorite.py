"""
Favorite schemas.
"""
from datetime import datetime

from pydantic import BaseModel


class FavoriteCreate(BaseModel):
    content_type: str
    content_id: int


class FavoriteOut(BaseModel):
    id: int
    content_type: str
    content_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class FavoriteCheck(BaseModel):
    is_favorited: bool
