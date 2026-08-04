"""
Pydantic schemas for validating AI-generated content.
Ensures we never trust raw JSON output from the LLM.
"""
from typing import Optional
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Typed Output Schemas
# ---------------------------------------------------------------------------

class BlogGeneratedContent(BaseModel):
    title: str
    excerpt: str
    content: str
    tags: list[str]
    category: str
    meta_description: str
    seo_keywords: list[str]

class NewsGeneratedContent(BaseModel):
    headline: str
    summary: str
    meta_description: str

class ProjectGeneratedContent(BaseModel):
    name: str
    description: str
    short_desc: str
    technologies: list[str]
    category: str

class InsightGeneratedContent(BaseModel):
    title: str
    excerpt: str
    content: str
    tags: list[str]
    category: str
    meta_description: str

class MetricItem(BaseModel):
    label: str = ""
    value: str = ""

class CaseStudyGeneratedContent(BaseModel):
    title: str
    client_name: str
    industry: str
    challenge: str
    solution: str
    results: str
    technologies: list[str]
    metrics: list[MetricItem]
    testimonial: str
    testimonial_author: str
