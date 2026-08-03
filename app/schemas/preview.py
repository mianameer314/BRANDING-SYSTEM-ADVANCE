from pydantic import BaseModel, Field
from typing import Any

class PreviewRequest(BaseModel):
    content_type: str = Field(..., description="The type of content (e.g., blog, news, project)")
    content_id: int = Field(..., description="The ID of the content to preview")

class PreviewResponse(BaseModel):
    content_type: str
    content: dict[str, Any]
