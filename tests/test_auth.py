import uuid

def test_register(client):
    unique_email = f"newuser_{uuid.uuid4().hex[:8]}@example.com"
    response = client.post("/api/v1/auth/register", json={
        "email": unique_email,
        "password": "Password123!",
        "full_name": "New User"
    })
    assert response.status_code == 201
    assert response.json()["email"] == unique_email

def test_login(client):
    # We must register a user before logging in, or use a known user.
    # Since DB might be wiped between modules, let's use the normal_user from fixtures?
    # No, fixtures don't insert to DB automatically. Let's register one here.
    email = f"login_{uuid.uuid4().hex[:8]}@example.com"
    client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": "Login User"
    })
    response = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password123!"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_get_me(client):
    # client is already authenticated as admin_user via override
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == "superadmin@example.com"
