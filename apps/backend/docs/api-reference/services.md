# Services

Services are offerings provided by tenants (e.g., haircuts, beard trims).

### Create Service

**Endpoint:** `POST /services`

```bash
curl -X POST http://localhost:3000/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Haircut",
    "price": 30.00,
    "duration": 30,
    "tenantId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### List All Services

**Endpoint:** `GET /services`

```bash
curl -X GET http://localhost:3000/services \
  -H "Authorization: Bearer <token>"
```

### Get Service by ID

**Endpoint:** `GET /services/:id`

```bash
curl -X GET "http://localhost:3000/services/550e8400-e29b-41d4-a716-446655440002?include=tenant,appointments,plans" \
  -H "Authorization: Bearer <token>"
```

### Update Service

**Endpoint:** `PATCH /services/:id`

```bash
curl -X PATCH http://localhost:3000/services/550e8400-e29b-41d4-a716-446655440002 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "price": 35.00
  }'
```

### Delete Service

**Endpoint:** `DELETE /services/:id`

```bash
curl -X DELETE http://localhost:3000/services/550e8400-e29b-41d4-a716-446655440002 \
  -H "Authorization: Bearer <token>"
```
