# Authentication

Most endpoints require a valid JWT token. The token must be included in the `Authorization` header as a Bearer token.

### Login

Obtain a JWT token by providing valid credentials.

**Endpoint:** `POST /auth/login`

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@waba-bot.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> **Note:** Use the returned `access_token` in all subsequent requests as:
> `-H "Authorization: Bearer <token>"`
