import uuid

def test_register(client):
    unique_email = f"newuser_{uuid.uuid4().hex[:8]}@example.com"
    response = client.post("/api/v1/auth/register", json={
        "email": unique_email,
        "password": "Password123!",
        "full_name": "New User"
    })
    assert response.status_code == 201
    assert "Verification code sent" in response.json()["message"]

def test_login(client, db_session):
    from app.models.user import User
    email = f"login_{uuid.uuid4().hex[:8]}@example.com"
    client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": "Login User"
    })
    
    # Manually activate the user since they require OTP verification
    user = db_session.query(User).filter(User.email == email).first()
    user.is_active = True
    user.email_verified = True
    db_session.commit()

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
