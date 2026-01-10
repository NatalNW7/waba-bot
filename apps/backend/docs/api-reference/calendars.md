# Calendars

Calendar integrations for syncing appointments with external calendars.

### Create Calendar

**Endpoint:** `POST /calendars`

```bash
curl -X POST http://localhost:8081/calendars \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "provider": "GOOGLE",
    "email": "owner@barbershop.com",
    "accessToken": "ya29...",
    "refreshToken": "1//...",
    "tokenExpiry": "2025-12-31T23:59:59Z",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Providers:** `GOOGLE`, `APPLE`

### List All Calendars

**Endpoint:** `GET /calendars`

```bash
curl -X GET http://localhost:8081/calendars \
  -H "Authorization: Bearer <token>"
```

### Get Calendar by ID

**Endpoint:** `GET /calendars/:id`

```bash
curl -X GET http://localhost:8081/calendars/550e8400-e29b-41d4-a716-446655440010 \
  -H "Authorization: Bearer <token>"
```

### Update Calendar

**Endpoint:** `PATCH /calendars/:id`

```bash
curl -X PATCH http://localhost:8081/calendars/550e8400-e29b-41d4-a716-446655440010 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "accessToken": "ya29_new..."
  }'
```

### Delete Calendar

**Endpoint:** `DELETE /calendars/:id`

```bash
curl -X DELETE http://localhost:8081/calendars/550e8400-e29b-41d4-a716-446655440010 \
  -H "Authorization: Bearer <token>"
```
