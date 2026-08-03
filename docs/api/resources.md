# Downloadable Resources API Reference

Base Path: `/api/v1/resources`

Resources endpoints manage downloadable attachments (PDFs, whitepapers, datasets) linked to content types. Supports gated downloads requiring authentication.

---

## 1. Upload & Create Resource

`POST /api/v1/resources`

Upload a downloadable file asset.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `create`
* **Content Type**: `multipart/form-data`

### Form-Data Parameters
- `title` (`string`, required, max 200)
- `description` (`string`, optional)
- `is_gated` (`boolean`, default false) — Require authentication to download
- `file` (`file`, required) — PDF, DOCX, ZIP, etc. (Max 20MB)

### Success Response (`201 Created`)

```json
{
  "id": 3,
  "title": "2026 Branding Tech PDF Report",
  "description": "Full downloadable whitepaper.",
  "file_url": "/media/resources/branding_tech_2026.pdf",
  "file_size": 2048500,
  "mime_type": "application/pdf",
  "is_gated": true,
  "download_count": 0,
  "created_at": "2026-07-22T08:00:00Z"
}
```

---

## 2. List Resources by Content

`GET /api/v1/resources/content/{content_type}/{content_id}`

Get all downloadable resources attached to a specific article or project.

---

## 3. Download Resource File

`GET /api/v1/resources/{resource_id}/download`

Download file binary stream. Increments `download_count`. If `is_gated` is true, requires active Bearer authentication.

* **Authentication Required**: Required if `is_gated` is true.

---

## 4. Update Resource

`PUT /api/v1/resources/{resource_id}`

Update title, description, or replacement file for a resource.

---

## 5. Delete Resource

`DELETE /api/v1/resources/{resource_id}`

Delete resource entry and remove file asset from storage. `204 No Content`.
