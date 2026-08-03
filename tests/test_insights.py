def test_create_insight(client):
    response = client.post("/api/v1/insights/", data={
        "title": "Test Insight",
        "author": "Test Author",
        "content": "Insight content",
        "excerpt": "Insight excerpt",
        "category": "Technology",
        "tags": '["tech"]',
        "status": "published"
    })
    assert response.status_code == 201
    assert response.json()["title"] == "Test Insight"

def test_list_insights(client):
    response = client.get("/api/v1/insights/")
    assert response.status_code == 200
    assert len(response.json()["items"]) > 0

def test_update_insight(client):
    response = client.get("/api/v1/insights/test-insight")
    insight_id = response.json()["id"]

    response = client.put(f"/api/v1/insights/{insight_id}", data={
        "title": "Updated Insight"
    })
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Insight"
