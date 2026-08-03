# Authentication API Reference

Base Path: `/api/v1/auth`

Authentication endpoints manage user registration, credential validation, JWT token issuance, session refresh, profile updates, and password rotation.

---

## 1. Register User

`POST /api/v1/auth/register`

Create a new consumer or editor account. First user registered defaults to role `user` unless configured.

* **Authentication Required**: No (Public)
* **Rate Limit**: 3 requests per 60 seconds (`RATE_LIMIT_REGISTER`)

### Request Body (`application/json`)

| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `email` | `string` | Yes | Valid email format | User's unique email address |
| `password` | `string` | Yes | Min length 8 | Plaintext user password |
| `full_name` | `string` | Yes | Min 1, Max 100 chars | Full name of the user |

#### Example Request
```json
{
  "email": "editor@o2geeks.com",
  "password": "SecurePassword123!",
  "full_name": "Jane Doe"
}
```

### Success Response (`201 Created`)

```json
{
  "id": 5,
  "email": "editor@o2geeks.com",
  "full_name": "Jane Doe",
  "role": "user",
  "is_active": true,
  "created_at": "2026-07-22T10:00:00Z",
  "updated_at": "2026-07-22T10:00:00Z"
}
```

### Error Responses

* `400 Bad Request`: Email already registered.
```json
{
  "detail": "Email already registered"
}
```
* `422 Unprocessable Entity`: Validation failure (e.g. password under 8 chars or invalid email format).
* `429 Too Many Requests`: Rate limit exceeded.

---

## 2. Login (Obtain Tokens)

`POST /api/v1/auth/login`

Authenticate credentials and receive a JWT Access Token and Refresh Token.

* **Authentication Required**: No (Public)
* **Rate Limit**: 5 requests per 60 seconds (`RATE_LIMIT_LOGIN`)

### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | Yes | Registered user email |
| `password` | `string` | Yes | Account password |

#### Example Request
```json
{
  "email": "admin@example.com",
  "password": "change_this_in_production"
}
```

### Success Response (`200 OK`)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Error Responses

* `401 Unauthorized`: Incorrect email or password, or account deactivated.
```json
{
  "detail": "Incorrect email or password"
}
```

---

## 3. Refresh Access Token

`POST /api/v1/auth/refresh`

Exchange a valid Refresh Token for a fresh Access Token & Refresh Token pair.

* **Authentication Required**: No (Bearer Refresh Token in request body)
* **Rate Limit**: 20 requests per 60 seconds (`RATE_LIMIT_REFRESH`)

### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `refresh_token` | `string` | Yes | Active JWT refresh token |

#### Example Request
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Success Response (`200 OK`)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Error Responses

* `401 Unauthorized`: Refresh token expired, revoked, or invalid.

---

## 4. Get Current User Profile

`GET /api/v1/auth/me`

Fetch profile data for the authenticated user based on the Bearer Access Token.

* **Authentication Required**: Yes (`Bearer <access_token>`)
* **Permissions**: Any active authenticated user

### Success Response (`200 OK`)

```json
{
  "id": 1,
  "email": "admin@example.com",
  "full_name": "Super Admin",
  "role": "super_admin",
  "is_active": true,
  "created_at": "2026-07-01T00:00:00Z",
  "updated_at": "2026-07-22T08:00:00Z"
}
```

### Error Responses

* `401 Unauthorized`: Missing or expired Bearer token.

---

## 5. Update Current User Profile

`PUT /api/v1/auth/me`

Update profile information (e.g. `full_name` or `email`) for the authenticated user.

* **Authentication Required**: Yes (`Bearer <access_token>`)

### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `full_name` | `string` | No | Updated full name |
| `email` | `string` | No | Updated email address |

#### Example Request
```json
{
  "full_name": "Super Administrator"
}
```

### Success Response (`200 OK`)

```json
{
  "id": 1,
  "email": "admin@example.com",
  "full_name": "Super Administrator",
  "role": "super_admin",
  "is_active": true,
  "created_at": "2026-07-01T00:00:00Z",
  "updated_at": "2026-07-22T10:15:00Z"
}
```

---

## 6. Change Password

`POST /api/v1/auth/change-password`

Safely rotate user password by validating old credentials.

* **Authentication Required**: Yes (`Bearer <access_token>`)

### Request Body (`application/json`)

| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `old_password` | `string` | Yes | - | Current active password |
| `new_password` | `string` | Yes | Min length 8 | New desired password |

#### Example Request
```json
{
  "old_password": "change_this_in_production",
  "new_password": "NewStrongPassword2026!"
}
```

### Success Response (`204 No Content`)

Empty body on successful password update.

### Error Responses

* `400 Bad Request`: Incorrect current password.
```json
{
  "detail": "Incorrect password"
}
```
