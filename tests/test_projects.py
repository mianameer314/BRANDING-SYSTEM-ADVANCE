def test_create_project(client):
    response = client.post("/api/v1/projects/", data={
        "name": "Test Project",
        "description": "Test description",
        "client": "Test Client",
        "technologies": '["tech1", "tech2"]',
        "status": "published"
    })
    assert response.status_code == 201
    assert response.json()["name"] == "Test Project"

def test_list_projects(client):
    response = client.get("/api/v1/projects/")
    assert response.status_code == 200
    assert len(response.json()["items"]) > 0

def test_update_project(client):
    # Get project by slug to get ID
    response = client.get("/api/v1/projects/test-project")
    project_id = response.json()["id"]

    response = client.put(f"/api/v1/projects/{project_id}", data={
        "name": "Updated Test Project",
        "technologies": '[]'
    })
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Test Project"
    assert len(response.json()["technologies"]) == 0
