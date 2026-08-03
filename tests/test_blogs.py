def test_create_blog(client):
    response = client.post("/api/v1/blogs/", data={
        "title": "Test Blog",
        "author": "Test Author",
        "content": "This is a test blog content.",
        "excerpt": "Test excerpt",
        "category": "Technology",
        "tags": '["tech", "test"]',
        "status": "published"
    })
    assert response.status_code == 201
    assert response.json()["title"] == "Test Blog"

def test_list_blogs(client):
    response = client.get("/api/v1/blogs/")
    assert response.status_code == 200
    assert len(response.json()["items"]) > 0

def test_get_blog_by_slug(client):
    response = client.get("/api/v1/blogs/test-blog")
    assert response.status_code == 200
    assert response.json()["title"] == "Test Blog"

def test_update_blog(client):
    # First get the blog ID
    response = client.get("/api/v1/blogs/test-blog")
    blog_id = response.json()["id"]

    response = client.put(f"/api/v1/blogs/{blog_id}", data={
        "title": "Updated Test Blog",
        "tags": '["tech", "updated"]'
    })
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Test Blog"
    assert "updated" in response.json()["tags"]
