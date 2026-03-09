# Auth API Documentation

**Base URL:** `http://localhost:3000`  
**Interactive Docs (Swagger):** `http://localhost:3000/api/docs`

---

## 1. Register

**`POST /auth/register`**

Creates a new tenant and owner account. A verification email is sent after registration.

### Request Body

| Field        | Type   | Required | Rules                                         |
| ------------ | ------ | -------- | --------------------------------------------- |
| `tenantName` | string | Yes      | 3–100 characters                              |
| `email`      | string | Yes      | Valid email                                   |
| `password`   | string | Yes      | Min 8 characters                              |
| `planType`   | string | Yes      | One of: `LYMON_ONE`, `PLUS`, `PRIME`, `TRIAL` |

```json
{
  "tenantName": "Mi Hotel Paradise",
  "email": "owner@hotel.com",
  "password": "SecurePass123!",
  "planType": "TRIAL"
}
```

### Response `201`

```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "tenantId": "abc123",
    "userId": "xyz456",
    "email": "owner@hotel.com",
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

### Error Responses

| Status            | Cause                                                                                |
| ----------------- | ------------------------------------------------------------------------------------ |
| `409 Conflict`    | A tenant with this email already exists                                              |
| `400 Bad Request` | Validation failure (missing fields, invalid email, short password, unknown planType) |

---

## 2. Login

**`POST /auth/login`**

### Request Body

```json
{
  "email": "owner@hotel.com",
  "password": "SecurePass123!"
}
```

### Response `200`

```json
{
  "message": "Login successful",
  "data": {
    "userId": "xyz456",
    "email": "owner@hotel.com",
    "tenantId": "abc123",
    "role": "OWNER",
    "emailVerified": false,
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

### Error Responses

| Status             | Cause                   |
| ------------------ | ----------------------- |
| `401 Unauthorized` | Wrong email or password |
| `400 Bad Request`  | Validation failure      |

---

## 3. Email Verification

**`GET /auth/verify-email?token=<token>`**

The verification link is sent to the user's email after registration. The `token` is a JWT embedded in that link — the frontend just needs to pass it as a query param when the user clicks the link.

### Response `200`

```json
{
  "message": "Email verified successfully. You can now access all features."
}
```

---

## 4. Using JWT Tokens

Both register and login return two tokens:

| Token         | Field          | Expiry         | Purpose                                       |
| ------------- | -------------- | -------------- | --------------------------------------------- |
| Access Token  | `accessToken`  | **15 minutes** | Include in every authenticated request        |
| Refresh Token | `refreshToken` | **7 days**     | Use to get a new access token when it expires |

**Authenticated requests** must include the access token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

### JWT Payload (decoded from the token)

```json
{
  "userId": "xyz456",
  "email": "owner@hotel.com",
  "tenantId": "abc123",
  "activePlan": "TRIAL",
  "role": "OWNER",
  "emailVerified": false
}
```

---

## 5. Suggested Auth Flow

```
Register → store tokens → redirect to app (show "verify email" banner if emailVerified: false)
Login    → store tokens → redirect to app
Any 401  → use refreshToken to get new accessToken (endpoint TBD) → retry request
```

> **Note:** A token refresh endpoint is not yet implemented. For now, redirect the user to login when the access token expires.
