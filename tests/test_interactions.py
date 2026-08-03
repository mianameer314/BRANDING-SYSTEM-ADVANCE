def test_like_content(client):
    # Get the blog created in test_blogs.py
    # Create dummy blog
    blog_res = client.post("/api/v1/blogs/", data={
        "title": "Interaction Blog",
        "author": "Author",
        "content": "Content",
        "status": "published"
    })
    blog_id = blog_res.json()["id"]
    response = client.post("/api/v1/likes", json={
        "content_type": "blog",
        "content_id": blog_id
    })
    assert response.status_code == 201, response.text
    assert "id" in response.json()

def test_comment_content(client):
    blogs_res = client.get("/api/v1/blogs/")
    blog_id = blogs_res.json()["items"][0]["id"]
    response = client.post("/api/v1/comments", json={
        "content_type": "blog",
        "content_id": blog_id,
        "body": "Nice post!"
    })
    assert response.status_code == 201, response.text
    assert response.json()["body"] == "Nice post!"
