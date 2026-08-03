# Interactions API Reference (Favorites, Likes, Comments)

Base Path: `/api/v1`

Interactions endpoints enable user engagement features including bookmarking favorites, liking articles/projects, and posting/moderating comments across all content types (`blog`, `project`, `news`, `insight`, `case_study`).

---

## 1. Favorites

### Add Favorite
`POST /api/v1/favorites`

Bookmark a content item for the authenticated user.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `interact`
* **Request Body (`application/json`)**:
  - `content_type`: `string` (`blog`, `project`, `news`, `insight`, `case_study`)
  - `content_id`: `integer`

```json
{
  "content_type": "blog",
  "content_id": 12
}
```

* **Success Response (`201 Created`)**:
```json
{
  "id": 8,
  "user_id": 1,
  "content_type": "blog",
  "content_id": 12,
  "created_at": "2026-07-22T08:30:00Z"
}
```

### Remove Favorite
`DELETE /api/v1/favorites/{favorite_id}`

Remove a favorite entry.

* **Authentication Required**: Yes
* **Response**: `204 No Content`

### List User Favorites
`GET /api/v1/favorites`

List all items bookmarked by the current user.

* **Query Parameters**: `page` (default 1), `per_page` (default 20), `content_type` (optional filter)

### Check Favorite Status
`GET /api/v1/favorites/check?content_type=blog&content_id=12`

Returns `{"is_favorited": true|false}`.

---

## 2. Likes

### Add Like
`POST /api/v1/likes`

Like a content item.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Request Body**: `{"content_type": "blog", "content_id": 12}`
* **Response (`201 Created`)**: `{"id": 45, "user_id": 1, "content_type": "blog", "content_id": 12, "created_at": "..."}`

### Remove Like
`DELETE /api/v1/likes/{like_id}`

* **Response**: `204 No Content`

### Check Like Status
`GET /api/v1/likes/check?content_type=blog&content_id=12`

Returns `{"is_liked": true|false}`.

---

## 3. Comments

### List Comments
`GET /api/v1/comments`

Fetch public comments for a target content item.

* **Query Parameters**:
  - `content_type`: `string` (required)
  - `content_id`: `integer` (required)
  - `page`: `integer` (default 1)
  - `per_page`: `integer` (default 20)

* **Success Response (`200 OK`)**:
```json
{
  "items": [
    {
      "id": 101,
      "user_id": 2,
      "user_name": "Jane Editor",
      "content_type": "blog",
      "content_id": 12,
      "body": "Great insights on headless API architecture!",
      "created_at": "2026-07-22T09:00:00Z",
      "updated_at": "2026-07-22T09:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 20,
  "total_pages": 1
}
```

### Create Comment
`POST /api/v1/comments`

Post a new comment.

* **Authentication Required**: Yes
* **Request Body**:
```json
{
  "content_type": "blog",
  "content_id": 12,
  "body": "Great insights on headless API architecture!"
}
```

### Update Comment
`PUT /api/v1/comments/{comment_id}`

Update a comment body. Restricted to comment author or Admin/Super Admin.

### Delete Comment
`DELETE /api/v1/comments/{comment_id}`

Delete a comment. Restricted to author or Admin/Super Admin. `204 No Content`.
