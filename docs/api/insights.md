# Insights API Reference

Base Path: `/api/v1/insights`

Insights endpoints handle data-driven reports, whitepapers, and market analysis articles.

---

## 1. List Insights

`GET /api/v1/insights`

Retrieve paginated market insights and whitepapers.

* **Authentication Required**: No (Optional `Bearer <access_token>`)
* **Rate Limit**: 120 requests per 60 seconds (`RATE_LIMIT_PUBLIC_GET`)

### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | `integer` | No | `1` | Page index |
| `per_page` | `integer` | No | `10` | Page size |
| `search` | `string` | No | `null` | Title or excerpt query |
| `category` | `string` | No | `null` | Category filter |
| `status` | `string` | No | `null` | `draft`, `published`, `archived` |

### Success Response (`200 OK`)

```json
{
  "items": [
    {
      "id": 1,
      "title": "2026 Enterprise Branding Tech Report",
      "slug": "2026-enterprise-branding-tech-report",
      "author": "Dr. Sarah Vance",
      "content": "<p>In-depth market analysis...</p>",
      "excerpt": "Key trends shaping AI-assisted brand automation.",
      "cover_image": "/media/insights/report_cover.webp",
      "category": "Market Trends",
      "tags": ["ai", "branding", "reports"],
      "status": "published",
      "is_featured": true,
      "read_time": "8 min read",
      "published_at": "2026-07-18T00:00:00Z",
      "created_at": "2026-07-18T00:00:00Z",
      "updated_at": "2026-07-18T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 10,
  "total_pages": 1
}
```

---

## 2. Get Insight by Slug

`GET /api/v1/insights/{slug}`

Get single insight item by slug.

---

## 3. Create Insight

`POST /api/v1/insights`

Create market insight article.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `create`
* **Content Type**: `multipart/form-data`

### Form-Data Fields
- `title` (string, required, max 200)
- `author` (string, required, max 150)
- `content` (string, required)
- `excerpt` (string, optional, max 300)
- `category` (string, optional, max 100)
- `tags` (string, optional JSON string or CSV)
- `read_time` (string, optional, max 50)
- `is_featured` (boolean, default false)
- `status` (string, default `draft`)
- `cover_image` (file, optional)
- `resource_ids` (string, optional JSON array)

---

## 4. Update Insight

`PUT /api/v1/insights/{insight_id}`

Update insight item by ID.

---

## 5. Delete Insight

`DELETE /api/v1/insights/{insight_id}`

Delete insight item and cleanup files.
