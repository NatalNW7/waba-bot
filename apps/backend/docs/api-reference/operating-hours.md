# Operating Hours

Operating hours define when a tenant is available for appointments.

### Create Operating Hour

**Endpoint:** `POST /operating-hours`

```bash
curl -X POST http://localhost:3000/operating-hours \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "day": "MONDAY",
    "startTime": "08:00",
    "endTime": "18:00",
    "isClosed": false,
    "onlyForSubscribers": false,
    "tenantId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Days:** `SUNDAY`, `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`

### List All Operating Hours

**Endpoint:** `GET /operating-hours`

```bash
curl -X GET http://localhost:3000/operating-hours \
  -H "Authorization: Bearer <token>"
```

### Get Operating Hour by ID

**Endpoint:** `GET /operating-hours/:id`

```bash
curl -X GET http://localhost:3000/operating-hours/550e8400-e29b-41d4-a716-446655440011 \
  -H "Authorization: Bearer <token>"
```

### Update Operating Hour

**Endpoint:** `PATCH /operating-hours/:id`

```bash
curl -X PATCH http://localhost:3000/operating-hours/550e8400-e29b-41d4-a716-446655440011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "startTime": "09:00",
    "endTime": "17:00"
  }'
```

### Delete Operating Hour

**Endpoint:** `DELETE /operating-hours/:id`

```bash
curl -X DELETE http://localhost:3000/operating-hours/550e8400-e29b-41d4-a716-446655440011 \
  -H "Authorization: Bearer <token>"
```
