import io

def test_create_resource(client):
    # Create dummy blog
    blog_res = client.post("/api/v1/blogs/", data={
        "title": "Resource Blog",
        "author": "Author",
        "content": "Content",
        "status": "published"
    })
    blog_id = blog_res.json()["id"]

    file_content = b"fake pdf content"
    file = io.BytesIO(file_content)
    file.name = "test.pdf"

    response = client.post("/api/v1/resources/", data={
        "content_type": "blog",
        "content_id": blog_id,
    }, files={"file": ("test.pdf", file, "application/pdf")})
    assert response.status_code == 201
    assert response.json()["file_name"] == "test.pdf"

def test_list_resources(client):
    # The blog ID from previous test is not guaranteed if tests run randomly,
    # but with sequential execution, we could fetch it. Better to fetch blogs list:
    blogs_res = client.get("/api/v1/blogs/")
    blog_id = blogs_res.json()["items"][0]["id"]
    response = client.get(f"/api/v1/resources/content/blog/{blog_id}")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_update_resource(client):
    # Get resource list
    blogs_res = client.get("/api/v1/blogs/")
    blog_id = blogs_res.json()["items"][0]["id"]
    response = client.get(f"/api/v1/resources/content/blog/{blog_id}")
    res_list = response.json()
    if not res_list:
        return
    res_id = res_list[0]["id"]

    file_content = b"fake new pdf content"
    file = io.BytesIO(file_content)
    file.name = "new_test.pdf"

    response = client.put(f"/api/v1/resources/{res_id}", files={"file": ("new_test.pdf", file, "application/pdf")})
    assert response.status_code == 200
    assert response.json()["file_name"] == "new_test.pdf"
