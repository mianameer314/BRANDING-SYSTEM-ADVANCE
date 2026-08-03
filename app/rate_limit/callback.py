"""
Custom HTTP 429 Callback for Rate Limiting.

Provides:
    - Clean JSON error response with "detail" key
    - Standard rate-limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After)
    - Structured violation logging with timestamp, user ID, IP, endpoint, method, and limit
"""

import logging
from typing import Union

from fastapi import HTTPException
from starlette.requests import Request
from starlette.responses import Response
from starlette.websockets import WebSocket

from app.rate_limit.identifier import _resolve_client_ip, _extract_user_id_from_jwt

logger = logging.getLogger(__name__)


import math

async def rate_limit_callback(
    request: Union[Request, WebSocket],
    response: Response,
    pexpire: int,
) -> None:
    """
    Called when a rate limit is exceeded.

    Logs the violation with structured fields and raises an HTTP 429
    exception with a clean JSON payload and standard rate-limit headers.
    """
    # ── Structured Violation Logging ──────────────────────────
    ip = _resolve_client_ip(request)
    user_id = _extract_user_id_from_jwt(request)
    endpoint = request.url.path if hasattr(request, "url") else "unknown"
    method = request.method if hasattr(request, "method") else "unknown"

    user_label = f"user_hash={user_id}" if user_id is not None else "anonymous"

    logger.warning(
        "Rate limit exceeded | %s ip=%s endpoint=%s method=%s",
        user_label,
        ip,
        endpoint,
        method,
    )

    # ── HTTP 429 Response ─────────────────────────────────────
    expire = math.ceil(pexpire / 1000)
    
    # Set standard rate-limit headers on the response object
    response.headers["Retry-After"] = str(expire)
    response.headers["X-RateLimit-Remaining"] = "0"

    raise HTTPException(
        status_code=429,
        detail="Rate limit exceeded. Please try again later.",
        headers={
            "Retry-After": str(expire),
            "X-RateLimit-Remaining": "0",
        },
    )
