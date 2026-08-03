"""
Central model registry — re-exports all models for easy imports.
Follows the campus_exchange __init__.py pattern.
"""
from app.models.blog import Blog
from app.models.case_study import CaseStudy
from app.models.insight import Insight
from app.models.news import News
from app.models.project import Project
from app.models.user import User
from app.models.favorite import Favorite
from app.models.like import Like
from app.models.comment import Comment
from app.models.resource import Resource
from app.models.webhook import Webhook
from app.models.webhook_log import WebhookLog

__all__ = [
    "User",
    "Blog",
    "News",
    "Project",
    "Insight",
    "CaseStudy",
    "Favorite",
    "Like",
    "Comment",
    "Resource",
    "Webhook",
    "WebhookLog",
]
