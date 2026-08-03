# Case Studies API Reference

Base Path: `/api/v1/case-studies`

Case Studies endpoints manage detailed client success stories, including challenge/solution/result breakdowns, statistical metrics arrays, and client testimonial quotes.

---

## 1. List Case Studies

`GET /api/v1/case-studies`

Fetch a paginated list of client case studies.

* **Authentication Required**: No (Optional `Bearer <access_token>`)
* **Rate Limit**: 120 requests per 60 seconds (`RATE_LIMIT_PUBLIC_GET`)

### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | `integer` | No | `1` | Page number |
| `per_page` | `integer` | No | `10` | Page size |
| `search` | `string` | No | `null` | Title/client search |
| `status` | `string` | No | `null` | `draft`, `published`, `archived` |

### Success Response (`200 OK`)

```json
{
  "items": [
    {
      "id": 2,
      "title": "Scaling Enterprise Infrastructure by 300%",
      "slug": "scaling-enterprise-infrastructure-by-300",
      "client": "Global Logistics Corp",
      "client_logo": "/media/case_studies/logo_glogistics.webp",
      "challenge": "Legacy monolithic systems were bottlenecking high-frequency transactions.",
      "solution": "Decomposed monolith into containerized microservices running on FastAPI and Kubernetes.",
      "results": "Achieved 99.99% uptime and reduced response latency by 65%.",
      "metrics": [
        {"label": "Transaction Throughput", "value": "+300%"},
        {"label": "Latency Reduction", "value": "65ms"}
      ],
      "testimonial_quote": "The O2Geeks team completely transformed our digital core architecture.",
      "testimonial_author": "David Miller, CTO",
      "cover_image": "/media/case_studies/cs_cover_2.webp",
      "gallery": [
        "/media/case_studies/arch_diagram.webp"
      ],
      "status": "published",
      "published_at": "2026-07-10T00:00:00Z",
      "created_at": "2026-07-01T00:00:00Z",
      "updated_at": "2026-07-10T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 10,
  "total_pages": 1
}
```

---

## 2. Get Case Study by Slug

`GET /api/v1/case-studies/{slug}`

Get a single case study by slug.

---

## 3. Create Case Study

`POST /api/v1/case-studies`

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `create`
* **Content Type**: `multipart/form-data`

### Form-Data Fields
- `title` (string, required, max 200)
- `client` (string, required, max 200)
- `challenge` (string, required)
- `solution` (string, required)
- `results` (string, required)
- `metrics` (string, optional, JSON array string e.g. `[{"label":"Speed","value":"2x"}]`)
- `testimonial_quote` (string, optional)
- `testimonial_author` (string, optional)
- `status` (string, default `draft`)
- `cover_image` (file, optional)
- `client_logo` (file, optional)
- `gallery` (files, optional array)

---

## 4. Update Case Study

`PUT /api/v1/case-studies/{case_study_id}`

Update case study by ID.

---

## 5. Delete Case Study

`DELETE /api/v1/case-studies/{case_study_id}`

Delete case study and remove cover image, client logo, and gallery images from storage.
