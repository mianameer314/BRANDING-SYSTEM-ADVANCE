def test_create_news(client):
    response = client.post("/api/v1/news/", data={
        "headline": "Test News",
        "summary": "News summary",
        "source": "News source",
        "status": "published"
    })
    assert response.status_code == 201
    assert response.json()["headline"] == "Test News"

def test_list_news(client):
    response = client.get("/api/v1/news/")
    assert response.status_code == 200
    assert len(response.json()["items"]) > 0

def test_update_news(client):
    response = client.get("/api/v1/news/test-news")
    news_id = response.json()["id"]

    response = client.put(f"/api/v1/news/{news_id}", data={
        "headline": "Updated News"
    })
    assert response.status_code == 200
    assert response.json()["headline"] == "Updated News"
