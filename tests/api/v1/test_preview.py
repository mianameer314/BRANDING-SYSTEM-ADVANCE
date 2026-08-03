import pytest
from fastapi.testclient import TestClient
import jwt
from app.main import app
from app.api.deps import get_current_user
from app.core.security import create_preview_token, decode_preview_token, create_access_token

def test_preview_token_generation_unauthorized():
    # Simulate an unauthenticated request without dropping DB/storage test overrides.
    original_overrides = app.dependency_overrides.copy()
    try:
        app.dependency_overrides.pop(get_current_user, None)
        with TestClient(app) as local_client:
            response = local_client.post("/api/v1/preview/generate", json={"content_type": "blog", "content_id": 1})
            assert response.status_code == 401
    finally:
        app.dependency_overrides = original_overrides

def test_preview_token_generation_authorized(client):
    response = client.post("/api/v1/preview/generate", json={"content_type": "blog", "content_id": 1})
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    
    payload = decode_preview_token(data["token"])
    assert payload["content_type"] == "blog"
    assert payload["content_id"] == 1
    assert payload["type"] == "preview"

def test_preview_token_invalid_type(client):
    access_token = create_access_token(data={"sub": "test@test.com"})
    with pytest.raises(jwt.InvalidTokenError):
        decode_preview_token(access_token)
    
    response = client.get("/api/v1/preview/blog?token=" + access_token)
    assert response.status_code == 401
    assert "Invalid or expired preview token" in response.json()["detail"]

def test_resolve_preview_invalid_token(client):
    response = client.get("/api/v1/preview/blog?token=invalid.token.here")
    assert response.status_code == 401

def test_resolve_preview_not_found(client):
    token = create_preview_token(data={"content_type": "blog", "content_id": 99999})
    response = client.get("/api/v1/preview/blog?token=" + token)
    assert response.status_code == 404

def test_resolve_preview_mismatched_type(client):
    token = create_preview_token(data={"content_type": "news", "content_id": 1})
    response = client.get("/api/v1/preview/blog?token=" + token)
    assert response.status_code == 400
    assert "Token does not match requested content type" in response.json()["detail"]
