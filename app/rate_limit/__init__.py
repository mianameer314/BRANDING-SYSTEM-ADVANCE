"""
Rate Limiting Module for the O2geeks Headless CMS.

This package provides production-ready, Redis-backed rate limiting using
fastapi-limiter v0.2 + pyrate-limiter with RedisBucket.

Architecture:
    core.py         — Redis connection lifecycle (init / close)
    identifier.py   — Smart client identification (User ID from JWT / proxy-aware IP)
    callback.py     — Custom HTTP 429 response with headers + structured violation logging
    dependencies.py — Pre-built FastAPI Depends() objects for every endpoint tier
"""

from app.rate_limit.core import init_rate_limiter, close_rate_limiter  # noqa: F401
from app.rate_limit.dependencies import (  # noqa: F401
    LOGIN_LIMIT,
    REGISTER_LIMIT,
    REFRESH_LIMIT,
    PUBLIC_GET_LIMIT,
    AUTH_GET_LIMIT,
    CONTENT_CREATE_LIMIT,
    CONTENT_UPDATE_LIMIT,
    CONTENT_DELETE_LIMIT,
    UPLOAD_LIMIT,
    COMMENT_LIMIT,
    LIKE_LIMIT,
    USER_MANAGEMENT_LIMIT,
    AI_GENERATION_LIMIT,
)
