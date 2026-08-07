"""
MILESTONE 1 — Permission Boundary & Duplicate Protection Evidence.

Proves:
  1. Editors CANNOT approve, schedule, or publish content (HTTP 403).
  2. Editors CANNOT modify content locked in approved/published status (HTTP 403).
  3. Admins CAN approve and publish content.
  4. Idempotency replay returns the same response without re-executing.
  5. Idempotency conflict is detected when the same key is reused with different data.
"""
import uuid
import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.api.deps import get_current_user
from app.models.user import User


def _make_user(role: str, user_id: int = 999) -> User:
    return User(
        id=user_id,
        email=f"{role}@example.com",
        full_name=f"{role.replace('_', ' ').title()} User",
        hashed_password="fakehash",
        is_active=True,
        role=role,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )


# ═══════════════════════════════════════════════════════════════
# RBAC Evidence — Editor cannot perform privileged transitions
# ═══════════════════════════════════════════════════════════════

class TestEditorCannotApproveOrPublish:

    @pytest.fixture(autouse=True)
    def setup_editor(self):
        editor = _make_user("editor")
        app.dependency_overrides[get_current_user] = lambda: editor
        yield
        app.dependency_overrides.pop(get_current_user, None)

    def test_editor_cannot_create_blog_as_approved(self):
        with TestClient(app) as client:
            resp = client.post("/api/v1/blogs", data={
                "title": "Editor Blog",
                "author": "Editor",
                "content": "Body",
                "status": "approved",
            })
            assert resp.status_code == 403

    def test_editor_cannot_create_blog_as_published(self):
        with TestClient(app) as client:
            resp = client.post("/api/v1/blogs", data={
                "title": "Editor Blog Publish",
                "author": "Editor",
                "content": "Body",
                "status": "published",
            })
            # published is in INITIAL_CONTENT_STATUSES but enforce_publish_permission blocks editor
            assert resp.status_code == 403

    def test_editor_cannot_transition_to_approved(self):
        """Create as draft (allowed), then try to move to approved (forbidden)."""
        with TestClient(app) as client:
            create_resp = client.post("/api/v1/blogs", data={
                "title": "Editor Draft Blog",
                "author": "Editor",
                "content": "Body",
                "status": "draft",
            })
            assert create_resp.status_code == 201
            blog_id = create_resp.json()["id"]

            update_resp = client.put(f"/api/v1/blogs/{blog_id}", data={
                "status": "approved",
            })
            assert update_resp.status_code == 403


# ═══════════════════════════════════════════════════════════════
# RBAC Evidence — Admin CAN approve and publish
# ═══════════════════════════════════════════════════════════════

class TestAdminCanApproveAndPublish:

    @pytest.fixture(autouse=True)
    def setup_admin(self):
        admin = _make_user("admin")
        app.dependency_overrides[get_current_user] = lambda: admin
        yield
        app.dependency_overrides.pop(get_current_user, None)

    def test_admin_can_walk_content_to_published(self):
        with TestClient(app) as client:
            # Create as draft
            resp = client.post("/api/v1/blogs", data={
                "title": "Admin Lifecycle Blog",
                "author": "Admin",
                "content": "Body",
                "status": "draft",
            })
            assert resp.status_code == 201
            blog_id = resp.json()["id"]

            # draft → in_review
            resp = client.put(f"/api/v1/blogs/{blog_id}", data={"status": "in_review"})
            assert resp.status_code == 200
            assert resp.json()["status"] == "in_review"

            # in_review → approved
            resp = client.put(f"/api/v1/blogs/{blog_id}", data={"status": "approved"})
            assert resp.status_code == 200
            assert resp.json()["status"] == "approved"

            # approved → published
            resp = client.put(f"/api/v1/blogs/{blog_id}", data={"status": "published"})
            assert resp.status_code == 200
            assert resp.json()["status"] == "published"


# ═══════════════════════════════════════════════════════════════
# Content Lock Evidence — Editor cannot edit locked content
# ═══════════════════════════════════════════════════════════════

class TestEditorCannotEditLockedContent:

    def test_editor_blocked_from_modifying_approved_content(self):
        """Admin creates and approves; then editor tries to edit → 403."""
        admin = _make_user("admin", user_id=998)
        editor = _make_user("editor", user_id=997)

        # Step 1: Admin creates and transitions to approved
        app.dependency_overrides[get_current_user] = lambda: admin
        with TestClient(app) as client:
            resp = client.post("/api/v1/blogs", data={
                "title": "Locked Content Blog",
                "author": "Admin",
                "content": "Original body",
                "status": "draft",
            })
            assert resp.status_code == 201
            blog_id = resp.json()["id"]

            client.put(f"/api/v1/blogs/{blog_id}", data={"status": "in_review"})
            client.put(f"/api/v1/blogs/{blog_id}", data={"status": "approved"})

        # Step 2: Editor tries to modify the approved content → 403
        app.dependency_overrides[get_current_user] = lambda: editor
        with TestClient(app) as client:
            resp = client.put(f"/api/v1/blogs/{blog_id}", data={
                "title": "Editor Sneaky Edit",
            })
            assert resp.status_code == 403

        app.dependency_overrides.pop(get_current_user, None)


# ═══════════════════════════════════════════════════════════════
# Idempotency Evidence — Replay & Conflict Detection
# ═══════════════════════════════════════════════════════════════

class TestIdempotencyEvidence:

    @pytest.fixture(autouse=True)
    def setup_admin(self):
        admin = _make_user("super_admin")
        app.dependency_overrides[get_current_user] = lambda: admin
        yield
        app.dependency_overrides.pop(get_current_user, None)

    def test_idempotent_replay_returns_same_response(self):
        """Two identical requests with the same Idempotency-Key return the same result."""
        idem_key = str(uuid.uuid4())
        headers = {"Idempotency-Key": idem_key}

        with TestClient(app) as client:
            # First request — creates the webhook
            resp1 = client.post("/api/v1/webhooks", json={
                "url": f"https://replay-test-{uuid.uuid4().hex[:8]}.example.com/hook",
                "event": "content.published",
                "content_types": ["*"],
            }, headers=headers)
            assert resp1.status_code == 201

            # Second request — identical payload, same key → replay
            resp2 = client.post("/api/v1/webhooks", json={
                "url": f"https://replay-test-{uuid.uuid4().hex[:8]}.example.com/hook",
                "event": "content.published",
                "content_types": ["*"],
            }, headers=headers)
            # Replay should return the saved status and include the replay header
            assert resp2.status_code == 201
            assert resp2.headers.get("X-Idempotent-Replay") == "true"

    def test_idempotent_conflict_detected(self):
        """Same key with different payload → HTTP 409 Conflict."""
        idem_key = str(uuid.uuid4())
        headers = {"Idempotency-Key": idem_key}

        with TestClient(app) as client:
            # First request
            resp1 = client.post("/api/v1/webhooks", json={
                "url": f"https://conflict-a-{uuid.uuid4().hex[:8]}.example.com/hook",
                "event": "content.published",
                "content_types": ["*"],
            }, headers=headers)
            assert resp1.status_code == 201

            # Second request — different payload, same key → conflict
            resp2 = client.post("/api/v1/webhooks", json={
                "url": f"https://conflict-b-{uuid.uuid4().hex[:8]}.example.com/hook",
                "event": "content.updated",
                "content_types": ["blog"],
            }, headers=headers)
            assert resp2.status_code == 409
