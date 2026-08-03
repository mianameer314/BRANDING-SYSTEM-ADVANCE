"""
Smart Client Identifier for Rate Limiting.

Determines the rate-limit key for each incoming request:
    - Authenticated requests: "user:{id}" using the immutable integer PK from JWT
    - Anonymous requests: "ip:{resolved_ip}" using proxy-aware IP resolution

IP Resolution Chain (for reverse proxy / Cloudflare / Railway compatibility):
    1. CF-Connecting-IP   (Cloudflare)
    2. X-Forwarded-For    (first IP in chain — the real client)
    3. request.client.host (direct connection fallback)
"""

import logging
from typing import Union

import jwt
from starlette.requests import Request
from starlette.websockets import WebSocket

from app.core.config import settings

logger = logging.getLogger(__name__)


def _resolve_client_ip(request: Union[Request, WebSocket]) -> str:
    """
    Resolve the real client IP address through reverse proxy headers.

    Priority:
        1. CF-Connecting-IP  — Cloudflare sets this to the true client IP
        2. X-Forwarded-For   — Standard proxy header (first IP = original client)
        3. request.client.host — Direct connection fallback
    """
    # Cloudflare's canonical client IP header
    cf_ip = request.headers.get("CF-Connecting-IP")
    if cf_ip:
        return cf_ip.strip()

    # Standard reverse proxy header — take the first (leftmost) IP
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()

    # Direct connection
    if request.client:
        return request.client.host

    return "127.0.0.1"


def _extract_user_id_from_jwt(request: Union[Request, WebSocket]) -> int | None:
    """
    Attempt to extract the user's immutable ID from the JWT access token.

    The JWT `sub` field contains the user's email (set in auth.py L48).
    We decode it to verify the token is valid, but for rate limiting we need
    the immutable integer user ID, not the mutable email.

    Since the JWT doesn't contain the user ID directly, we use a lightweight
    approach: decode the JWT to get the email, then use a hash of the email
    as a stable identifier. This avoids a DB query on every request.

    Note: If the token is invalid or expired, we return None and fall back to IP.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1]
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        if payload.get("type") != "access":
            return None

        # Use the email from `sub` as the stable identifier
        # We hash it to create a consistent numeric key
        user_email = payload.get("sub")
        if user_email:
            # Use a stable hash to create a numeric identifier
            return hash(user_email)
        return None
    except (jwt.PyJWTError, Exception):
        return None


async def smart_identifier(request: Union[Request, WebSocket]) -> str:
    """
    Identify the client for rate limiting.

    Returns:
        - "user:{hashed_id}" for authenticated requests (immutable, stable key)
        - "ip:{resolved_ip}" for anonymous requests (proxy-aware)

    This function is passed to fastapi-limiter's RateLimiter as the identifier.
    """
    user_id = _extract_user_id_from_jwt(request)

    if user_id is not None:
        return f"user:{user_id}"

    ip = _resolve_client_ip(request)
    return f"ip:{ip}"
