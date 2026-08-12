def test_workflow_overview(client):
    response = client.get("/api/v1/operations/workflow-overview")
    assert response.status_code == 200
    data = response.json()
    assert "stages" in data
    assert "total_content" in data
    assert "draft" in data["stages"]
    assert "published" in data["stages"]
    assert "by_type" in data["stages"]["draft"]

def test_workflow_items(client):
    response = client.get("/api/v1/operations/items")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)

def test_workflow_items_with_status_filter(client):
    response = client.get("/api/v1/operations/items?status=in_review,changes_requested")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    for item in data["items"]:
        assert item["status"] in ["in_review", "changes_requested"]

def test_workflow_items_with_type_filter(client):
    response = client.get("/api/v1/operations/items?content_type=blog")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    for item in data["items"]:
        assert item["content_type"] == "blog"
