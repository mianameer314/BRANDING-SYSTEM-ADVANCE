# Authentication API

The Authentication API handles user registration, login, token management, email verification, password reset, and profile operations.

---

## Base URL
`/api/v1/auth`

## Authentication
Most endpoints require a valid JWT access token in the `Authorization: Bearer <token>` header.
- **Public endpoints** (no auth): `register`, `verify-email`, `resend-otp`, `forgot-password`, `reset-password`, `login`
- **Protected endpoints**: `refresh`, `me`, `update-profile`, `change-password`

---

## Token Lifecycle
| Token Type | Expiry | Usage |
|------------|--------|-------|
| Access Token | 30 minutes | API authorization |
| Refresh Token | 7 days | Obtain new access tokens |

---

## Endpoints

### 1. Register User
Public user registration. Creates unverified user and sends OTP.

- **URL**: `/register`
- **Method**: `POST`
- **Rate Limit**: 5 requests/minute
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

#### Success Response (`201 Created`)
```json
{
  "message": "User created. Verification code sent."
}
```

#### Error Responses
- `400 Bad Request`: Email already registered (verified account)
- `422 Unprocessable Entity`: Validation error (invalid email, weak password)
- `429 Too Many Requests`: Rate limit exceeded

---

### 2. Verify Email
Verify email via OTP and return access + refresh tokens.

- **URL**: `/verify-email`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "email": "user@example.com",
  "otp_code": "123456"
}
```

#### Success Response (`200 OK`)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

#### Error Responses
- `400 Bad Request`: Invalid or expired OTP
- `404 Not Found`: User not found

---

### 3. Resend OTP
Resend OTP for signup or password reset.

- **URL**: `/resend-otp`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "email": "user@example.com",
  "purpose": "signup"  // or "reset"
}
```

#### Success Response (`200 OK`)
```json
{
  "message": "If the email is registered, a code has been sent."
}
```
*Note: Always returns success for security (prevents email enumeration).*

---

### 4. Forgot Password
Request password reset OTP.

- **URL**: `/forgot-password`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "email": "user@example.com"
}
```

#### Success Response (`200 OK`)
```json
{
  "message": "If the email is registered, a reset code has been sent."
}
```

---

### 5. Reset Password
Reset password using OTP.

- **URL**: `/reset-password`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "email": "user@example.com",
  "otp_code": "123456",
  "new_password": "NewSecurePass123!"
}
```

#### Success Response (`200 OK`)
```json
{
  "message": "Password reset successfully."
}
```

#### Error Responses
- `400 Bad Request`: Invalid or expired OTP
- `404 Not Found`: User not found

---

### 6. Login
Authenticate and get access + refresh tokens.

- **URL**: `/login`
- **Method**: `POST`
- **Rate Limit**: 10 requests/minute
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Success Response (`200 OK`)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

#### Error Responses
- `401 Unauthorized`: Invalid email or password
- `403 Forbidden`: Account deactivated
- `429 Too Many Requests`: Rate limit exceeded

---

### 7. Refresh Token
Get new access + refresh tokens using a valid refresh token.

- **URL**: `/refresh`
- **Method**: `POST`
- **Rate Limit**: 20 requests/minute
- **Header**: `Authorization: Bearer <refresh_token>`

#### Success Response (`200 OK`)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

#### Error Responses
- `401 Unauthorized`: Invalid or expired refresh token
- `429 Too Many Requests`: Rate limit exceeded

---

### 8. Get Current User Profile
Get authenticated user profile.

- **URL**: `/me`
- **Method**: `GET`
- **Header**: `Authorization: Bearer <access_token>`
- **Rate Limit**: 120 requests/minute

#### Success Response (`200 OK`)
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "editor",
  "is_active": true,
  "email_verified": true,
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-15T10:00:00Z"
}
```

---

### 9. Update Profile
Update current user full name.

- **URL**: `/me`
- **Method**: `PUT`
- **Header**: `Authorization: Bearer <access_token>`
- **Rate Limit**: 30 requests/minute
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "full_name": "John Smith"
}
```

#### Success Response (`200 OK`)
Returns updated `UserOut` object.

---

### 10. Change Password
Change own password (requires current password).

- **URL**: `/change-password`
- **Method**: `POST`
- **Header**: `Authorization: Bearer <access_token>`
- **Rate Limit**: 10 requests/minute
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "current_password": "SecurePass123!",
  "new_password": "NewSecurePass456!"
}
```

#### Success Response (`204 No Content`)

#### Error Responses
- `400 Bad Request`: Incorrect current password
- `422 Unprocessable Entity`: Validation error

---

## Token Schema (`Token`)

| Field | Type | Description |
|-------|------|-------------|
| `access_token` | string | Short-lived JWT for API calls |
| `refresh_token` | string | Long-lived token for refreshing |
| `token_type` | string | Always `"bearer"` |

---

## User Schema (`UserOut`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | User ID |
| `email` | string | Email address |
| `full_name` | string | Display name |
| `role` | string | `super_admin`, `admin`, `editor`, `user` |
| `is_active` | boolean | Account status |
| `email_verified` | boolean | Email verification status |
| `created_at` | datetime | Account creation timestamp |
| `updated_at` | datetime | Last update timestamp |

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `register` | 5 | 60 seconds |
| `login` | 10 | 60 seconds |
| `refresh` | 20 | 60 seconds |
| `me` (GET) | 120 | 60 seconds |
| `me` (PUT) | 30 | 60 seconds |
| `change-password` | 10 | 60 seconds |

---

## Security Notes

1. **Password Requirements**: Min 8 chars, uppercase, lowercase, number, special char
2. **OTP Expiry**: 10 minutes
3. **Tokens**: JWT HS256, signed with `JWT_SECRET` (min 32 chars)
4. **HTTPS Required**: In production, all auth endpoints must use HTTPS
5. **CORS**: Configured via `CORS_ORIGINS` env var

---

## Example Workflow

```bash
# 1. Register
curl -X POST -H "Content-Type: application/json" \
  -d '"'"'{"email":"user@test.com","password":"Pass123!","full_name":"Test User"}"'"' \
  https://api.o2geeks.com/api/v1/auth/register

# 2. Verify email (OTP sent to email)
curl -X POST -H "Content-Type: application/json" \
  -d '"'"'{"email":"user@test.com","otp_code":"123456"}"'"' \
  https://api.o2geeks.com/api/v1/auth/verify-email

# 3. Use access token
curl -H "Authorization: Bearer <access_token>" \
  https://api.o2geeks.com/api/v1/auth/me

# 4. Refresh tokens
curl -X POST -H "Authorization: Bearer <refresh_token>" \
  https://api.o2geeks.com/api/v1/auth/refresh
```