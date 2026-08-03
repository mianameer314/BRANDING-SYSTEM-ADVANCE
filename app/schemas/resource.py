"""
Resource schemas.
"""
from datetime import datetime

from pydantic import BaseModel


class ResourceCreate(BaseModel):
    content_type: str
    content_id: int
    file_url: str
    file_name: str | None = None


class ResourceUpdate(BaseModel):
    file_url: str | None = None
    file_name: str | None = None


class ResourceOut(BaseModel):
    id: int
    content_type: str
    content_id: int
    file_url: str
    file_name: str | None
    created_at: datetime

    class Config:
        from_attributes = True
