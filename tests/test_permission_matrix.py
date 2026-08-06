import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timezone

from app.main import app
from app.api.deps import get_current_user
from app.models.user import User

def create_mock_user(role: str) -> User:
    return User(
        id=999,
        email=f"{role}@example.com",
        full_name=f"{role.capitalize()} User",
        hashed_password="fakehash",
        is_active=True,
        role=role,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

@pytest.fixture
def override_user(request):
    role = request.param
    user = create_mock_user(role)
    app.dependency_overrides[get_current_user] = lambda: user
    yield user
    app.dependency_overrides.pop(get_current_user, None)

@pytest.mark.parametrize("override_user", ["user", "editor", "admin"], indirect=True)
def test_webhook_creation_forbidden(override_user):
    with TestClient(app) as client:
        payload = {
            "url": "https://example.com/webhook",
            "event": "content.published",
            "content_types": ["*"]
        }
        response = client.post("/api/v1/webhooks", json=payload)
        assert response.status_code == 403

@pytest.mark.parametrize("override_user", ["super_admin"], indirect=True)
def test_webhook_creation_allowed(override_user):
    with TestClient(app) as client:
        payload = {
            "url": "https://example.com/webhook",
            "event": "content.published",
            "content_types": ["*"]
        }
        response = client.post("/api/v1/webhooks", json=payload)
        assert response.status_code == 201

@pytest.mark.parametrize("override_user", ["super_admin"], indirect=True)
def test_webhook_secret_masking(override_user):
    with TestClient(app) as client:
        payload = {
            "url": "https://example.com/webhook-mask",
            "event": "content.published",
            "content_types": ["*"]
        }
        
        # Create returns full secret
        response = client.post("/api/v1/webhooks", json=payload)
        assert response.status_code == 201
        webhook_id = response.json()["id"]
        secret_on_create = response.json()["secret"]
        assert "***" not in secret_on_create
        assert len(secret_on_create) > 10
        
        # Get returns masked secret
        get_response = client.get(f"/api/v1/webhooks/{webhook_id}")
        assert get_response.status_code == 200
        secret_on_get = get_response.json()["secret"]
        assert "..." in secret_on_get
        assert secret_on_get != secret_on_create
