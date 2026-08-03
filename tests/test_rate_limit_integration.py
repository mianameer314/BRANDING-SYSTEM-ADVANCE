import pytest
from fastapi.testclient import TestClient
import fakeredis.aioredis
from unittest.mock import patch, AsyncMock
from app.main import app
from app.api.deps import get_current_user, get_db
from app.models.user import User
from fastapi_limiter.depends import RateLimiter
import time

# Mock Redis for FastAPILimiter
mock_redis = fakeredis.aioredis.FakeRedis()

# Simple Python implementation of token bucket for tests
_test_buckets = {}

async def mock_check(self, key):
    # Simple rate limit logic:
    # return 0 if allowed, otherwise pexpire (ms until retry)
    now = time.time()
    if key not in _test_buckets:
        _test_buckets[key] = []
    
    # Clean old requests
    window = self.milliseconds / 1000.0 if self.milliseconds > 0 else (
        self.seconds + self.minutes * 60 + self.hours * 3600 + self.times # fallback
    )
    if window == 0:
        window = 60 # Default
        
    _test_buckets[key] = [t for t in _test_buckets[key] if now - t < window]
    
    if len(_test_buckets[key]) >= self.times:
        oldest = _test_buckets[key][0]
        return int((window - (now - oldest)) * 1000)
        
    _test_buckets[key].append(now)
    return 0

@pytest.fixture(scope="module", autouse=True)
def setup_rate_limiter():
    """Mock Redis and initialize FastAPI Limiter for all tests in this module."""
    
    async def mock_init(redis, *args, **kwargs):
        from fastapi_limiter import FastAPILimiter
        FastAPILimiter.redis = redis
        FastAPILimiter.prefix = "fastapi-limiter"
        FastAPILimiter.identifier = mock_redis
        FastAPILimiter.http_callback = mock_redis
        FastAPILimiter.lua_sha = "mock_sha"
        
    with patch("redis.asyncio.from_url", return_value=mock_redis):
        with patch("fastapi_limiter.FastAPILimiter.init", new=mock_init):
            # We need to mock _check because fakeredis aioredis lacks full lua support
            with patch.object(RateLimiter, "_check", new=mock_check):
                # We need to explicitly call the startup event handler for the test client
                with TestClient(app) as client:
                    yield client

def test_login_rate_limit(setup_rate_limiter):
    client = setup_rate_limiter
    # LOGIN_LIMIT is usually something like 5/minute
    # We will hit it 6 times.
    for i in range(5):
        resp = client.post("/api/v1/auth/login", json={"email": "test@example.com", "password": "password"})
        # Should not be 429
        assert resp.status_code != 429
    
    # 6th request should be 429
    resp = client.post("/api/v1/auth/login", json={"email": "test@example.com", "password": "password"})
    assert resp.status_code == 429
    assert "Retry-After" in resp.headers

def test_register_rate_limit(setup_rate_limiter):
    client = setup_rate_limiter
    # REGISTER_LIMIT is usually 3/minute
    for i in range(3):
        resp = client.post("/api/v1/auth/register", json={
            "email": f"new{i}@example.com",
            "password": "password",
            "full_name": "Test"
        })
        assert resp.status_code != 429
        
    resp = client.post("/api/v1/auth/register", json={
        "email": "new4@example.com",
        "password": "password",
        "full_name": "Test"
    })
    assert resp.status_code == 429

def test_public_get_endpoints_rate_limit(setup_rate_limiter):
    client = setup_rate_limiter
    # PUBLIC_GET_LIMIT is usually 120/minute.
    # To save time, we will just simulate 120 requests.
    for i in range(120):
        resp = client.get("/api/v1/blogs")
        assert resp.status_code != 429
        
    resp = client.get("/api/v1/blogs")
    assert resp.status_code == 429

def test_fail_open_when_redis_is_down():
    """Test that when Redis fails, we can still make requests without limits."""
    # Create a fresh client where redis fails
    from unittest.mock import AsyncMock
    broken_redis = AsyncMock()
    broken_redis.ping.side_effect = ConnectionError("Redis is dead")
    
    with patch("redis.asyncio.from_url", return_value=broken_redis):
        with TestClient(app) as broken_client:
            # Send requests beyond the register limit (3/min)
            for i in range(5):
                resp = broken_client.post("/api/v1/auth/register", json={
                    "email": f"failopen{i}@example.com",
                    "password": "password",
                    "full_name": "Test"
                })
                # Should never hit 429 because rate limiter is failing open
                assert resp.status_code != 429
