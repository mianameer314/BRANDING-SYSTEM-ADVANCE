"""
AI Response parsing and validation.
Safely extracts JSON from LLM output and validates it against Pydantic schemas.
"""
import json
import logging
from pydantic import BaseModel, ValidationError

from app.services.ai.schemas import (
    BlogGeneratedContent,
    NewsGeneratedContent,
    ProjectGeneratedContent,
    InsightGeneratedContent,
    CaseStudyGeneratedContent,
)

logger = logging.getLogger(__name__)

SCHEMA_MAP = {
    "blog": BlogGeneratedContent,
    "news": NewsGeneratedContent,
    "project": ProjectGeneratedContent,
    "insight": InsightGeneratedContent,
    "case_study": CaseStudyGeneratedContent,
}

def parse_ai_response(raw_text: str, content_type: str) -> BaseModel:
    """
    Strips markdown formatting, parses JSON, and validates it against the correct Pydantic schema.
    """
    text = raw_text.strip()
    
    # Strip markdown code blocks if the model wrapped it (e.g., ```json ... ```)
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
        
    if text.endswith("```"):
        text = text[:-3]
        
    text = text.strip()

    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from AI: {text}")
        raise ValueError(f"AI returned invalid JSON: {str(e)}")

    schema_class = SCHEMA_MAP.get(content_type)
    if not schema_class:
        raise ValueError(f"Unknown content type for validation: {content_type}")
        
    try:
        validated_data = schema_class.model_validate(data)
        return validated_data
    except ValidationError as e:
        logger.error(f"AI output failed schema validation: {e.errors()}")
        raise ValueError(f"AI generated content did not match expected structure: {str(e)}")
