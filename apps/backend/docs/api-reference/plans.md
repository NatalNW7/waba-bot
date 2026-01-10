# Plans (Customer Plans)

Plans are subscription packages created by tenants for their customers.

### Create Plan

**Endpoint:** `POST /plans`

```bash
curl -X POST http://localhost:8081/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Mensal Barba",
    "description": "Acesso ilimitado a barba por um mês",
    "price": 80.00,
    "interval": "MONTHLY",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "maxAppointments": 4
  }'
```

**Note:** Use `-1` for `maxAppointments` for unlimited appointments.

### List All Plans

**Endpoint:** `GET /plans`

```bash
curl -X GET http://localhost:8081/plans \
  -H "Authorization: Bearer <token>"
```

### Get Plan by ID

**Endpoint:** `GET /plans/:id`

```bash
curl -X GET "http://localhost:8081/plans/550e8400-e29b-41d4-a716-446655440006?include=tenant,subscriptions,services" \
  -H "Authorization: Bearer <token>"
```

### Update Plan

**Endpoint:** `PATCH /plans/:id`

```bash
curl -X PATCH http://localhost:8081/plans/550e8400-e29b-41d4-a716-446655440006 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "price": 90.00
  }'
```

### Delete Plan

**Endpoint:** `DELETE /plans/:id`

```bash
curl -X DELETE http://localhost:8081/plans/550e8400-e29b-41d4-a716-446655440006 \
  -H "Authorization: Bearer <token>"
```
