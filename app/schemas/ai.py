from typing import Literal, Any
from pydantic import BaseModel, Field

from app.services.ai.schemas import (
    BlogGeneratedContent,
    NewsGeneratedContent,
    ProjectGeneratedContent,
    InsightGeneratedContent,
    CaseStudyGeneratedContent,
)


class GenerateContentRequest(BaseModel):
    content_type: Literal["blog", "news", "project", "insight", "case_study"]
    topic: str = Field(..., min_length=1, max_length=200)
    keywords: list[str] | None = Field(None, max_length=20)
    audience: str | None = Field(None, max_length=200)
    tone: str | None = "Professional"
    length: str | None = "Medium"
    language: str | None = "English"
    goal: str | None = None
    cta: str | None = Field(None, max_length=500)
    custom_instructions: str | None = Field(None, max_length=2000)
    preset: str | None = None


class GenerateContentResponse(BaseModel):
    content_type: str
    generated: (
        BlogGeneratedContent
        | NewsGeneratedContent
        | ProjectGeneratedContent
        | InsightGeneratedContent
        | CaseStudyGeneratedContent
    )
    model: str
    generation_time_ms: int
