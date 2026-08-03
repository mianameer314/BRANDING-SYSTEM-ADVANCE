# Projects API Reference

Base Path: `/api/v1/projects`

Project Showcase endpoints allow managing client work, portfolio items, gallery images, and technical specifications.

---

## 1. List Projects

`GET /api/v1/projects`

Fetch a paginated list of project portfolio items.

* **Authentication Required**: No (Optional `Bearer <access_token>`)
* **Rate Limit**: 120 requests per 60 seconds (`RATE_LIMIT_PUBLIC_GET`)

### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | `integer` | No | `1` | Page index (ge=1) |
| `per_page` | `integer` | No | `10` | Items per page (ge=1, le=100) |
| `search` | `string` | No | `null` | Title or short summary search |
| `status` | `string` | No | `null` | Filter by status (`draft`, `published`, `archived`) |
| `category` | `string` | No | `null` | Category filter |
| `is_featured` | `boolean` | No | `null` | Filter featured items |
| `sort_by` | `string` | No | `created_at` | Sort field |
| `sort_order` | `string` | No | `desc` | Sort direction (`asc`, `desc`) |

### Success Response (`200 OK`)

```json
{
  "items": [
    {
      "id": 5,
      "name": "Fintech Mobile Application Redesign",
      "slug": "fintech-mobile-application-redesign",
      "client": "Acme Capital",
      "description": "<p>End-to-end UX architecture and design system...</p>",
      "short_desc": "Modern mobile banking experience built with React Native.",
      "cover_image": "/media/projects/e5f6g7h8_cover.webp",
      "gallery": [
        "/media/projects/screen_1.webp",
        "/media/projects/screen_2.webp"
      ],
      "technologies": ["React Native", "TypeScript", "FastAPI"],
      "category": "Mobile App",
      "project_url": "https://client.acmecapital.com",
      "is_featured": true,
      "status": "published",
      "completed_at": "2026-06-01T00:00:00Z",
      "published_at": "2026-06-05T10:00:00Z",
      "created_at": "2026-05-15T09:00:00Z",
      "updated_at": "2026-06-05T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 10,
  "total_pages": 1
}
```

---

## 2. Get Project by Slug

`GET /api/v1/projects/{slug}`

Retrieve detailed information for a single project item by slug.

* **Authentication Required**: No (Optional `Bearer <access_token>`)

### Path Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `slug` | `string` | Project URL slug |

---

## 3. Create Project

`POST /api/v1/projects`

Create a new portfolio project with single cover image and multiple gallery image uploads.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `create`
* **Content Type**: `multipart/form-data`

### Form-Data Parameters

| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `string` | Yes | Max 200 chars | Project title |
| `description` | `string` | Yes | - | Detailed description HTML / Markdown |
| `client` | `string` | No | Max 200 chars | Client company name |
| `short_desc` | `string` | No | Max 300 chars | Brief summary |
| `technologies` | `string` | No | JSON string array | e.g. `["React","Python"]` |
| `category` | `string` | No | Max 100 chars | Category tag |
| `project_url` | `string` | No | Max 500 chars | Live project external link |
| `is_featured` | `boolean` | No | Default `false` | Highlight status |
| `status` | `string` | No | Default `draft` | Allowed: `draft`, `published`, `archived` |
| `completed_at` | `string` | No | ISO Datetime | Completion date |
| `cover_image` | `file` | No | Image file | Main thumbnail image |
| `gallery` | `files` | No | Array of files | Gallery showcase images |

---

## 4. Update Project

`PUT /api/v1/projects/{project_id}`

Update project data, replace cover image, or append/remove gallery items.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `update`
* **Content Type**: `multipart/form-data`

---

## 5. Delete Project

`DELETE /api/v1/projects/{project_id}`

Delete a project and remove all associated cover and gallery files from disk/S3.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `delete`
