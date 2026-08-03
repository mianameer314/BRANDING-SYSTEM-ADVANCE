"""
AI Generation Service Orchestrator.
Coordinates prompt building, provider execution, and response parsing.
"""
import time
import logging
from fastapi import HTTPException

from app.schemas.ai import GenerateContentRequest, GenerateContentResponse
from app.services.ai.prompts import build_prompts
from app.services.ai.openrouter import OpenRouterProvider
from app.services.ai.provider import AIProviderError
from app.services.ai.parsers import parse_ai_response
# To be implemented when ai_generations table is added
# from app.db.session import SessionLocal

logger = logging.getLogger(__name__)

async def generate_content(request: GenerateContentRequest, user_id: int) -> GenerateContentResponse:
    """
    Orchestrates the AI content generation flow.
    """
    start_time = time.time()
    
    # 1. Build prompts
    system_prompt, user_prompt = build_prompts(request)
    
    # 2. Instantiate provider
    provider = OpenRouterProvider()
    
    try:
        # 3. Generate raw response
        raw_response = await provider.generate(system_prompt, user_prompt)
        
        # 4. Parse and validate
        validated_data = parse_ai_response(raw_response, request.content_type)
        
        generation_time_ms = int((time.time() - start_time) * 1000)
        
        # 5. Log success
        logger.info(
            f"AI Generation Success: user={user_id}, type={request.content_type}, "
            f"model={provider.model}, time={generation_time_ms}ms"
        )
        
        # Note: In the future, we can easily add database logging here:
        # db = SessionLocal()
        # db.add(AIGenerationLog(user_id=user_id, model=provider.model, ...))
        # db.commit()
        
        return GenerateContentResponse(
            content_type=request.content_type,
            generated=validated_data,
            model=provider.model,
            generation_time_ms=generation_time_ms
        )
        
    except AIProviderError as e:
        generation_time_ms = int((time.time() - start_time) * 1000)
        logger.error(f"AI Provider Error: user={user_id}, type={request.content_type}, time={generation_time_ms}ms, error={e}")
        status_code = e.status_code or 500
        if status_code == 429:
            detail = "AI Provider rate limit exceeded. Please try again later."
        elif status_code == 503:
            detail = "AI Service is currently unavailable (check API key configuration)."
        else:
            detail = f"AI Provider Error: {str(e)}"
        raise HTTPException(status_code=status_code, detail=detail)
        
    except ValueError as e:
        generation_time_ms = int((time.time() - start_time) * 1000)
        logger.error(f"AI Parse/Validation Error: user={user_id}, type={request.content_type}, time={generation_time_ms}ms, error={e}")
        raise HTTPException(status_code=422, detail=f"AI generated invalid format: {str(e)}")
    except Exception as e:
        generation_time_ms = int((time.time() - start_time) * 1000)
        logger.exception(f"Unexpected AI Error: user={user_id}, type={request.content_type}, time={generation_time_ms}ms, error={e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during AI generation.")
