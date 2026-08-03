from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel
import jwt

from app.api.deps import CurrentUser, DbDep
from app.core.security import create_preview_token, decode_preview_token
from app.schemas.preview import PreviewRequest, PreviewResponse
from app.services import blog as blog_service
from app.services import news as news_service
from app.services import project as project_service
from app.services import insight as insight_service
from app.services import case_study as case_study_service

router = APIRouter(prefix="/preview", tags=["Preview"])

class TokenResponse(BaseModel):
    token: str

@router.post("/generate", response_model=TokenResponse)
def generate_preview_token(request: PreviewRequest, current_user: CurrentUser):
    """
    Generate a short-lived token for previewing draft content.
    Only authenticated users can generate preview tokens.
    """
    token = create_preview_token(
        data={"content_type": request.content_type, "content_id": request.content_id}
    )
    return {"token": token}

@router.get("/{content_type}", response_model=PreviewResponse)
def resolve_preview(content_type: str, token: str = Query(...), db: DbDep = None):
    """
    Resolve a preview token and return the draft content.
    Publicly accessible but requires a valid token.
    """
    try:
        payload = decode_preview_token(token)
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired preview token")

    token_content_type = payload.get("content_type")
    content_id = payload.get("content_id")

    if not token_content_type or not content_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token payload")

    if token_content_type != content_type:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token does not match requested content type")

    # Fetch the content dynamically, overriding role checks with include_drafts=True
    content = None
    if content_type == "blog":
        content = blog_service.get_blog_by_id(db, content_id, include_drafts=True)
    elif content_type == "news":
        content = news_service.get_news_by_id(db, content_id, include_drafts=True)
    elif content_type == "project":
        content = project_service.get_project_by_id(db, content_id, include_drafts=True)
    elif content_type == "insight":
        content = insight_service.get_insight_by_id(db, content_id, include_drafts=True)
    elif content_type == "case_study":
        content = case_study_service.get_case_study_by_id(db, content_id, include_drafts=True)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported content type")

    if not content:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found")

    from app.schemas.blog import BlogOut
    from app.schemas.news import NewsOut
    from app.schemas.project import ProjectOut
    from app.schemas.insight import InsightOut
    from app.schemas.case_study import CaseStudyOut

    if content_type == "blog":
        content_dict = BlogOut.model_validate(content).model_dump(mode="json")
    elif content_type == "news":
        content_dict = NewsOut.model_validate(content).model_dump(mode="json")
    elif content_type == "project":
        content_dict = ProjectOut.model_validate(content).model_dump(mode="json")
    elif content_type == "insight":
        content_dict = InsightOut.model_validate(content).model_dump(mode="json")
    elif content_type == "case_study":
        content_dict = CaseStudyOut.model_validate(content).model_dump(mode="json")

    return PreviewResponse(content_type=content_type, content=content_dict)
