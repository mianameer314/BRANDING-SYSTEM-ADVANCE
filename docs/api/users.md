# User Management API Reference

Base Path: `/api/v1/users`

User Management endpoints handle user account lifecycle, role assignment, and soft deactivation. Restricted strictly to accounts with the `manage_users` permission (Super Admin).

---

## 1. List Users

`GET /api/v1/users`

Fetch a paginated list of registered system users with optional role filtering.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `manage_users` (Super Admin)
* **Rate Limit**: 10 requests per 60 seconds (`RATE_LIMIT_USER_MGT`)

### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `page` | `integer` | No | `1` | Page number (ge=1) |
| `per_page` | `integer` | No | `20` | Items per page (ge=1, le=100) |
| `role` | `string` | No | `null` | Filter by role (`super_admin`, `admin`, `editor`, `user`) |

### Success Response (`200 OK`)

```json
{
  "items": [
    {
      "id": 1,
      "email": "admin@example.com",
      "full_name": "Super Admin",
      "role": "super_admin",
      "is_active": true,
      "created_at": "2026-07-01T00:00:00Z",
      "updated_at": "2026-07-22T08:00:00Z"
    },
    {
      "id": 2,
      "email": "editor@o2geeks.com",
      "full_name": "Jane Editor",
      "role": "editor",
      "is_active": true,
      "created_at": "2026-07-15T12:00:00Z",
      "updated_at": "2026-07-15T12:00:00Z"
    }
  ],
  "total": 2,
  "page": 1,
  "per_page": 20,
  "total_pages": 1
}
```

---

## 2. Create User

`POST /api/v1/users`

Create a new user with a specific role assignment.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `manage_users` (Super Admin)

### Request Body (`application/json`)

| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `email` | `string` | Yes | Valid email | User email address |
| `password` | `string` | Yes | Min length 8 | Initial password |
| `full_name` | `string` | Yes | Min 1, Max 100 | Full name |
| `role` | `string` | No | Default `user` | Allowed: `super_admin`, `admin`, `editor`, `user` |

#### Example Request
```json
{
  "email": "new.admin@o2geeks.com",
  "password": "SecureAdminPassword2026!",
  "full_name": "Alex Smith",
  "role": "admin"
}
```

### Success Response (`201 Created`)

```json
{
  "id": 3,
  "email": "new.admin@o2geeks.com",
  "full_name": "Alex Smith",
  "role": "admin",
  "is_active": true,
  "created_at": "2026-07-22T11:00:00Z",
  "updated_at": "2026-07-22T11:00:00Z"
}
```

---

## 3. Get User by ID

`GET /api/v1/users/{user_id}`

Retrieve full profile details for a specific user ID.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `manage_users`

### Path Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `user_id` | `integer` | Target user ID |

### Success Response (`200 OK`)

```json
{
  "id": 3,
  "email": "new.admin@o2geeks.com",
  "full_name": "Alex Smith",
  "role": "admin",
  "is_active": true,
  "created_at": "2026-07-22T11:00:00Z",
  "updated_at": "2026-07-22T11:00:00Z"
}
```

### Error Responses
* `404 Not Found`: User ID does not exist.

---

## 4. Update User

`PUT /api/v1/users/{user_id}`

Update user profile information, role, or active state.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `manage_users`

### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `full_name` | `string` | No | Updated full name |
| `role` | `string` | No | Updated role (`super_admin`, `admin`, `editor`, `user`) |
| `is_active` | `boolean` | No | Enable/disable user account |

#### Example Request
```json
{
  "role": "editor",
  "is_active": true
}
```

### Success Response (`200 OK`)

```json
{
  "id": 3,
  "email": "new.admin@o2geeks.com",
  "full_name": "Alex Smith",
  "role": "editor",
  "is_active": true,
  "created_at": "2026-07-22T11:00:00Z",
  "updated_at": "2026-07-22T11:30:00Z"
}
```

---

## 5. Deactivate User

`DELETE /api/v1/users/{user_id}`

Soft delete (deactivate) a user account. Deactivated users cannot authenticate or refresh sessions. Self-deactivation is strictly forbidden.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permission Required**: `manage_users`

### Path Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `user_id` | `integer` | Target user ID |

### Success Response (`204 No Content`)

### Error Responses

* `400 Bad Request`: Super admin attempted to deactivate their own account.
```json
{
  "detail": "You cannot deactivate your own account."
}
```
* `404 Not Found`: User ID does not exist.
