import json
import os
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_openapi_schema_generation():
    """
    Verify OpenAPI schema can be generated and doesn't contain leaked schemas.
    """
    schema = app.openapi()
    
    assert "openapi" in schema
    assert "info" in schema
    assert "paths" in schema

    # Verify no raw ORM objects leaked into the schema
    schema_str = json.dumps(schema)
    assert "SQLAlchemy" not in schema_str
    
    # Dump the frozen snapshot as required by Day 4
    os.makedirs("docs/api", exist_ok=True)
    with open("docs/api/openapi.json", "w") as f:
        json.dump(schema, f, indent=2)

def test_error_contract():
    """
    Verify error responses are the standard FastAPI {"detail": "..."} shape.
    """
    # 404 test
    response = client.get("/api/v1/blogs/this-slug-does-not-exist")
    assert response.status_code == 404
    assert "detail" in response.json()

    # 401 test
    response = client.post("/api/v1/blogs", data={"title": "Test"})
    assert response.status_code in (401, 422)
    assert "detail" in response.json()

def test_pagination_contract():
    """
    Verify list endpoints return the PaginatedResponse shape.
    """
    response = client.get("/api/v1/blogs")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "per_page" in data
