# News API Reference

Base Path: `/api/v1/news`

News management endpoints handle press releases, company announcements, and external news coverage.

---

## 1. List News

`GET /api/v1/news`

Fetch a paginated list of news items.

* **Authentication Required**: No (Optional `Bearer <access_token>`)
* **Rate Limit**: 120 requests per 60 seconds (`RATE_LIMIT_PUBLIC_GET`)

### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | `integer` | No | `1` | Page index (ge=1) |
| `per_page` | `integer` | No | `10` | Page size (ge=1, le=100) |
| `search` | `string` | No | `null` | Search query for title or summary |
| `status` | `string` | No | `null` | Filter by `draft`, `published`, `archived` |
| `is_featured` | `boolean` | No | `null` | Filter featured items |

### Success Response (`200 OK`)

```json
{
  "items": [
    {
      "id": 4,
      "title": "O2Geeks Announces Next-Gen Branding Engine",
      "slug": "o2geeks-announces-next-gen-branding-engine",
      "content": "<p>Press Release details...</p>",
      "summary": "Official announcement of our enterprise branding system release.",
      "source": "https://techcrunch.com/press-release",
      "cover_image": "/media/news/n1_cover.webp",
      "is_featured": true,
      "status": "published",
      "published_at": "2026-07-21T00:00:00Z",
      "created_at": "2026-07-21T00:00:00Z",
      "updated_at": "2026-07-21T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 10,
  "total_pages": 1
}
```

---

## 2. Get News by Slug

`GET /api/v1/news/{slug}`

Get single news article by URL slug.

---

## 3. Create News

`POST /api/v1/news`

Create news announcement.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `create`
* **Content Type**: `multipart/form-data`

### Form-Data Fields
- `title` (string, required, max 200)
- `content` (string, required)
- `summary` (string, optional, max 300)
- `source` (string, optional, max 500)
- `is_featured` (boolean, default false)
- `status` (string, default `draft`)
- `cover_image` (file, optional)

---

## 4. Update News

`PUT /api/v1/news/{news_id}`

Update news article by ID.

---

## 5. Delete News

`DELETE /api/v1/news/{news_id}`

Delete news item and clean up stored media files.
