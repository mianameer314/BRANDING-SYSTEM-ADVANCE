# Blogs API Reference

Base Path: `/api/v1/blogs`

Blog Management endpoints allow listing, searching, creating, updating, and deleting blog posts. Supports image uploads (`multipart/form-data`) and attaching downloadable resources.

---

## 1. List Blogs

`GET /api/v1/blogs`

Retrieve a paginated list of blog articles. Public users receive published posts only. Authenticated staff (`editor`, `admin`, `super_admin`) receive both published and draft posts.

* **Authentication Required**: No (Optional `Bearer <access_token>`)
* **Rate Limit**: 120 requests per 60 seconds (`RATE_LIMIT_PUBLIC_GET`)

### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | `integer` | No | `1` | Page index (ge=1) |
| `per_page` | `integer` | No | `10` | Page size (ge=1, le=100) |
| `search` | `string` | No | `null` | Case-insensitive title/content search |
| `status` | `string` | No | `null` | Filter by status (`draft`, `published`, `archived`) |
| `category` | `string` | No | `null` | Filter by category |
| `sort_by` | `string` | No | `created_at` | Field to sort by (`title`, `created_at`, `views_count`) |
| `sort_order` | `string` | No | `desc` | Sort direction (`asc`, `desc`) |

### Success Response (`200 OK`)

```json
{
  "items": [
    {
      "id": 12,
      "title": "Headless CMS Architectures in 2026",
      "slug": "headless-cms-architectures-in-2026",
      "author": "Jane Doe",
      "content": "<p>Detailed breakdown of modern API-first CMS design...</p>",
      "excerpt": "Exploring modern API-first headless content architecture.",
      "cover_image": "/media/blogs/a8b9c1d2_cover.webp",
      "category": "Technology",
      "tags": ["cms", "fastapi", "nuxt"],
      "status": "published",
      "is_featured": true,
      "views_count": 1420,
      "likes_count": 89,
      "comments_count": 14,
      "published_at": "2026-07-20T12:00:00Z",
      "created_at": "2026-07-20T11:30:00Z",
      "updated_at": "2026-07-20T12:00:00Z",
      "user_has_liked": false,
      "user_has_favorited": false
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 10,
  "total_pages": 1
}
```

---

## 2. Get Blog by Slug

`GET /api/v1/blogs/{slug}`

Retrieve a single blog post by its URL slug. Increments `views_count`.

* **Authentication Required**: No (Optional `Bearer <access_token>` for like/favorite status)

### Path Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `slug` | `string` | Unique URL slug of the blog |

### Success Response (`200 OK`)

Returns the complete `BlogOut` JSON object.

### Error Responses
* `404 Not Found`: Blog slug not found or item is in `draft` state and requester is unauthenticated.

---

## 3. Create Blog

`POST /api/v1/blogs`

Create a new blog post. Requires `create` permission (`editor`, `admin`, `super_admin`).

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `create`
* **Content Type**: `multipart/form-data`

### Form-Data Parameters

| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `title` | `string` | Yes | Max 200 chars | Blog title |
| `author` | `string` | Yes | Max 150 chars | Author name |
| `content` | `string` | Yes | - | Main blog body HTML / Markdown |
| `excerpt` | `string` | No | Max 300 chars | Short preview summary |
| `category` | `string` | No | Max 100 chars | Category tag |
| `tags` | `string` | No | JSON array or CSV | e.g. `["tech","ai"]` or `tech,ai` |
| `status` | `string` | No | Default `draft` | Allowed: `draft`, `published`, `archived` |
| `is_featured` | `boolean` | No | Default `false` | Highlight post on homepage |
| `cover_image` | `file` | No | Image file | Allowed `.jpg, .jpeg, .png, .webp, .gif` (Max 5MB) |
| `resource_ids` | `string` | No | JSON array | e.g. `[1, 2]` to attach resources |

### Success Response (`201 Created`)

Returns the created `BlogOut` object.

### Error Responses
* `400 Bad Request`: Invalid tags format or invalid status choice.
* `403 Forbidden`: Insufficient user permissions or attempting to publish without `publish` permission.
* `413 Payload Too Large`: Upload file exceeds maximum size.

---

## 4. Update Blog

`PUT /api/v1/blogs/{blog_id}`

Update an existing blog post by ID.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `update`
* **Content Type**: `multipart/form-data`

### Path Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `blog_id` | `integer` | Blog ID to update |

### Form-Data Parameters

Accepts the same fields as Create Blog. All fields are optional.

---

## 5. Delete Blog

`DELETE /api/v1/blogs/{blog_id}`

Permanently delete a blog post and remove its associated cover image and resources from storage.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `delete` (`admin`, `super_admin`)

### Path Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `blog_id` | `integer` | Blog ID to delete |

### Success Response (`200 OK`)

```json
{
  "message": "Blog deleted successfully"
}
```
