# Preview System API Reference

Base Path: `/api/v1/preview`

Preview endpoints enable **Secure Previews** (short-lived JWT token URLs for unreleased draft posts) and support **Live Previews** inside the Admin Dashboard iframe bridge.

---

## 1. Generate Secure Preview Token

`POST /api/v1/preview/generate`

Generate a secure, short-lived (15-minute) preview token to view an unpublished draft without exposing it publicly.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `create` or `update`

### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `content_type` | `string` | Yes | `blog`, `project`, `news`, `insight`, `case_study` |
| `content_id` | `integer` | Yes | Database ID of the target draft item |

#### Example Request
```json
{
  "content_type": "blog",
  "content_id": 12
}
```

### Success Response (`200 OK`)

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "preview_url": "https://o2geeks-website-v2-black.vercel.app/preview/blogs?token=eyJhb...",
  "expires_in": 900
}
```

---

## 2. Consume Secure Preview Draft

`GET /api/v1/preview/{content_type}`

Retrieve draft content payload by validating a preview JWT token. Used by the Nuxt Website `/preview/*` routes.

* **Authentication Required**: No (Token provided via query string)

### Path Parameters
- `content_type`: `string` (`blog`, `project`, `news`, `insight`, `case_study`)

### Query Parameters
- `token`: `string` (required short-lived preview JWT)

### Success Response (`200 OK`)

Returns the raw draft content object regardless of publication status.

### Error Responses
* `401 Unauthorized`: Token expired or invalid signature.
* `404 Not Found`: Draft content no longer exists.
