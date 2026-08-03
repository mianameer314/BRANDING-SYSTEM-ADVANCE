import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from starlette.requests import Request
from starlette.datastructures import Headers, URL
from app.rate_limit.core import init_rate_limiter, close_rate_limiter, get_redis_client
import app.rate_limit.core as rate_limit_core
from app.rate_limit.identifier import _resolve_client_ip, _extract_user_id_from_jwt, smart_identifier
from app.rate_limit.callback import rate_limit_callback
from app.core.config import settings
from app.core.security import create_access_token

@pytest.mark.asyncio
async def test_init_rate_limiter_success():
    """Test successful Redis connection initialization."""
    mock_redis = AsyncMock()
    with patch("redis.asyncio.from_url", return_value=mock_redis):
        await init_rate_limiter()
        mock_redis.ping.assert_awaited_once()
        assert get_redis_client() == mock_redis
        
        await close_rate_limiter()
        mock_redis.aclose.assert_awaited_once()
        assert get_redis_client() is None

@pytest.mark.asyncio
async def test_init_rate_limiter_fail_open():
    """Test fail-open behavior when Redis connection fails."""
    mock_redis = AsyncMock()
    mock_redis.ping.side_effect = ConnectionError("Redis is down")
    
    with patch("redis.asyncio.from_url", return_value=mock_redis):
        await init_rate_limiter()
        # Should gracefully handle the error and set client to None
        assert get_redis_client() is None


def create_mock_request(headers=None, host="127.0.0.1", path="/", method="GET"):
    scope = {
        "type": "http",
        "headers": headers or [],
        "client": (host, 12345),
        "path": path,
        "method": method,
    }
    return Request(scope)

def test_resolve_client_ip():
    """Test proxy-aware IP resolution."""
    # 1. CF-Connecting-IP takes priority
    req = create_mock_request(headers=[(b"cf-connecting-ip", b"203.0.113.1")])
    assert _resolve_client_ip(req) == "203.0.113.1"
    
    # 2. X-Forwarded-For is second priority
    req = create_mock_request(headers=[
        (b"x-forwarded-for", b"198.51.100.1, 192.168.1.1")
    ])
    assert _resolve_client_ip(req) == "198.51.100.1"
    
    # 3. Both present -> CF takes priority
    req = create_mock_request(headers=[
        (b"cf-connecting-ip", b"203.0.113.1"),
        (b"x-forwarded-for", b"198.51.100.1")
    ])
    assert _resolve_client_ip(req) == "203.0.113.1"
    
    # 4. Direct connection fallback
    req = create_mock_request(host="10.0.0.5")
    assert _resolve_client_ip(req) == "10.0.0.5"

def test_extract_user_id_from_jwt():
    """Test extracting and hashing user ID from JWT."""
    # Valid token
    email = "testuser@example.com"
    token = create_access_token({"sub": email, "role": "user"})
    req = create_mock_request(headers=[(b"authorization", f"Bearer {token}".encode())])
    
    extracted_id = _extract_user_id_from_jwt(req)
    assert extracted_id == hash(email)
    
    # Invalid token
    req = create_mock_request(headers=[(b"authorization", b"Bearer invalidtoken")])
    assert _extract_user_id_from_jwt(req) is None
    
    # No token
    req = create_mock_request()
    assert _extract_user_id_from_jwt(req) is None

@pytest.mark.asyncio
async def test_smart_identifier():
    """Test smart identifier combines logic correctly."""
    # Authenticated
    email = "testuser@example.com"
    token = create_access_token({"sub": email, "role": "user"})
    req = create_mock_request(headers=[(b"authorization", f"Bearer {token}".encode())])
    
    ident = await smart_identifier(req)
    assert ident == f"user:{hash(email)}"
    
    # Anonymous (uses IP)
    req = create_mock_request(headers=[(b"cf-connecting-ip", b"203.0.113.1")])
    ident = await smart_identifier(req)
    assert ident == "ip:203.0.113.1"

@pytest.mark.asyncio
async def test_rate_limit_callback():
    """Test callback raises correct 429 Exception with headers."""
    req = create_mock_request()
    
    # Set up mock response
    class MockResponse:
        headers = {}
    
    response = MockResponse()
    
    with pytest.raises(HTTPException) as exc_info:
        await rate_limit_callback(req, response, pexpire=1000)
        
    assert exc_info.value.status_code == 429
    assert exc_info.value.detail == "Rate limit exceeded. Please try again later."
    assert "Retry-After" in exc_info.value.headers
    assert exc_info.value.headers["X-RateLimit-Remaining"] == "0"
