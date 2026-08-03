"""
Pre-built Rate Limit Dependencies for FastAPI Endpoints.

This module exposes reusable FastAPI Depends() objects for every rate-limit tier.
Endpoints only need to import and use these in their `dependencies=[...]` list.

Architecture:
    - Uses pyrate_limiter's Limiter + RedisBucket for Redis-backed rate limiting
    - Wraps fastapi-limiter's RateLimiter with graceful fail-open behavior
    - All limits are configurable via environment variables (format: "requests/seconds")

Usage in a route:
    from app.rate_limit import PUBLIC_GET_LIMIT
    from fastapi import Depends

    @router.get("", dependencies=[Depends(PUBLIC_GET_LIMIT)])
    def list_blogs(...):
        ...
"""

import logging
from typing import Callable, Union

from fastapi import Request, Response, HTTPException
from fastapi_limiter.depends import RateLimiter
from fastapi_limiter import FastAPILimiter

from app.core.config import settings
from app.rate_limit.identifier import smart_identifier
from app.rate_limit.callback import rate_limit_callback

logger = logging.getLogger(__name__)


# ── Limit String Parser ──────────────────────────────────────

def _parse_limit(value: str) -> tuple[int, int]:
    """
    Parse an environment variable rate limit string into (times, seconds).

    Format: "requests/seconds"
    Example: "5/60" → (5, 60) — 5 requests per 60 seconds
    """
    parts = value.split("/")
    if len(parts) != 2:
        raise ValueError(f"Invalid rate limit format: '{value}'. Expected 'requests/seconds'.")
    return int(parts[0]), int(parts[1])


# ── Graceful RateLimiter ─────────────────────────────────────

class GracefulRateLimiter(RateLimiter):
    """
    A FastAPI dependency that enforces rate limits with graceful Redis failure handling.

    If Redis is unavailable (either at startup or mid-operation), requests are
    allowed through ("fail-open") and a warning is logged. This prevents a Redis
    outage from taking down the entire API.
    """

    def __init__(self, times: int, seconds: int):
        super().__init__(
            times=times,
            seconds=seconds,
            identifier=smart_identifier,
            callback=rate_limit_callback,
        )

    async def __call__(self, request: Request, response: Response) -> None:
        """
        FastAPI dependency callable. Enforces the rate limit on the request.
        """
        if getattr(FastAPILimiter, "redis", None) is None:
            print("DEBUG: FastAPILimiter.redis is None!")
            return

        try:
            rate_key = await self.identifier(request)
            prefix = getattr(FastAPILimiter, "prefix", "fastapi-limiter")
            key = f"{prefix}:{rate_key}:{request.url.path}:{request.method}"
            print(f"DEBUG: Checking key {key}")

            try:
                pexpire = await self._check(key)
                print(f"DEBUG: pexpire is {pexpire}")
            except Exception as e:
                print(f"DEBUG: Exception in _check: {e}")
                if "NOSCRIPT" in str(e) or e.__class__.__name__ == "NoScriptError":
                    FastAPILimiter.lua_sha = await FastAPILimiter.redis.script_load(FastAPILimiter.lua_script)
                    pexpire = await self._check(key)
                else:
                    raise e
                    
            if pexpire != 0:
                print(f"DEBUG: Returning callback for pexpire {pexpire}")
                return await self.callback(request, response, pexpire)

        except Exception as e:
            print(f"DEBUG: Exception caught in __call__: {repr(e)}")
            if isinstance(e, HTTPException) and getattr(e, "status_code", None) == 429:
                print("DEBUG: Re-raising 429 HTTPException")
                raise e
            
            logger.warning(
                "Rate Limiter: Error during rate check — fail-open. Error: %s",
                e,
            )
            return


# ── Pre-built Limit Dependencies ─────────────────────────────
# Import these in your route files and use as:
#     dependencies=[Depends(LOGIN_LIMIT)]


def _make_limiter(config_value: str) -> GracefulRateLimiter:
    """Create a GracefulRateLimiter from a config string like '5/60'."""
    times, seconds = _parse_limit(config_value)
    return GracefulRateLimiter(times=times, seconds=seconds)


# Authentication endpoints
LOGIN_LIMIT = _make_limiter(settings.RATE_LIMIT_LOGIN)
REGISTER_LIMIT = _make_limiter(settings.RATE_LIMIT_REGISTER)
REFRESH_LIMIT = _make_limiter(settings.RATE_LIMIT_REFRESH)

# Content read endpoints
PUBLIC_GET_LIMIT = _make_limiter(settings.RATE_LIMIT_PUBLIC_GET)
AUTH_GET_LIMIT = _make_limiter(settings.RATE_LIMIT_AUTH_GET)

# Content mutation endpoints
CONTENT_CREATE_LIMIT = _make_limiter(settings.RATE_LIMIT_CREATE)
CONTENT_UPDATE_LIMIT = _make_limiter(settings.RATE_LIMIT_UPDATE)
CONTENT_DELETE_LIMIT = _make_limiter(settings.RATE_LIMIT_DELETE)

# Upload endpoints (stricter — heavy resource usage)
UPLOAD_LIMIT = _make_limiter(settings.RATE_LIMIT_UPLOAD)

# Interaction endpoints
COMMENT_LIMIT = _make_limiter(settings.RATE_LIMIT_COMMENT)
LIKE_LIMIT = _make_limiter(settings.RATE_LIMIT_LIKE)

# User management (admin-only, strictest)
USER_MANAGEMENT_LIMIT = _make_limiter(settings.RATE_LIMIT_USER_MGT)

# AI Features
AI_GENERATION_LIMIT = _make_limiter(settings.RATE_LIMIT_AI_GENERATE)
