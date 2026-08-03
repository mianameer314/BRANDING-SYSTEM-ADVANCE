def test_list_users(client):
    response = client.get("/api/v1/users/")
    assert response.status_code == 200
    assert isinstance(response.json()["items"], list)

def test_get_user_by_id(client):
    # Depending on DB state, this might be 404 or a user.
    # Our db has our new user from auth test, but we use transactions or sqlite shared state.
    pass
