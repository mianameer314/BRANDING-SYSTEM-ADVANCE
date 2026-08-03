"""
AI Content Generation API Routes.
"""
from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import CurrentUser
from app.core.permissions import require_permission
from app.rate_limit.dependencies import AI_GENERATION_LIMIT
from app.schemas.ai import GenerateContentRequest, GenerateContentResponse
from app.services.ai.service import generate_content

# We use the require_permission("create") dependency, which means editors, admins, and super_admins can use this.
router = APIRouter(prefix="/ai", tags=["AI Content Assistant"])

@router.post(
    "/generate",
    response_model=GenerateContentResponse,
    dependencies=[Depends(AI_GENERATION_LIMIT)]
)
async def api_generate_content(
    request: GenerateContentRequest,
    current_user = Depends(require_permission("create"))
):
    """
    Generates structured content drafts using AI.
    Requires 'create' permission.
    """
    return await generate_content(request, current_user.id)
