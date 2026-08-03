def test_create_case_study(client):
    response = client.post("/api/v1/case-studies/", data={
        "title": "Test Case Study",
        "client_name": "Test Client",
        "challenge": "Hard challenge",
        "solution": "Good solution",
        "results": "Great results",
        "industry": "Tech",
        "metrics": '[{"label": "ROI", "value": "200%"}]',
        "technologies": '["tech1"]',
        "status": "published"
    })
    assert response.status_code == 201
    assert response.json()["title"] == "Test Case Study"

def test_list_case_studies(client):
    response = client.get("/api/v1/case-studies/")
    assert response.status_code == 200
    assert len(response.json()["items"]) > 0

def test_update_case_study(client):
    response = client.get("/api/v1/case-studies/test-case-study")
    cs_id = response.json()["id"]

    response = client.put(f"/api/v1/case-studies/{cs_id}", data={
        "title": "Updated Case Study",
        "metrics": '[]'
    })
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Case Study"
    assert len(response.json()["metrics"]) == 0
