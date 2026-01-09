# SaaS Plans

SaaS Plans are subscription tiers for the platform itself (for tenants).

### Create SaaS Plan

**Endpoint:** `POST /saas-plans`

```bash
curl -X POST http://localhost:3000/saas-plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Pro",
    "price": 99.00,
    "description": "Full access to all features",
    "interval": "MONTHLY"
  }'
```

**Intervals:** `MONTHLY`, `QUARTERLY`, `YEARLY`

### List All SaaS Plans

**Endpoint:** `GET /saas-plans`

```bash
curl -X GET http://localhost:3000/saas-plans \
  -H "Authorization: Bearer <token>"
```

### Get SaaS Plan by ID

**Endpoint:** `GET /saas-plans/:id`

```bash
curl -X GET "http://localhost:3000/saas-plans/550e8400-e29b-41d4-a716-446655440009?include=tenants" \
  -H "Authorization: Bearer <token>"
```

### Update SaaS Plan

**Endpoint:** `PATCH /saas-plans/:id`

```bash
curl -X PATCH http://localhost:3000/saas-plans/550e8400-e29b-41d4-a716-446655440009 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "price": 119.00
  }'
```

### Delete SaaS Plan

**Endpoint:** `DELETE /saas-plans/:id`

```bash
curl -X DELETE http://localhost:3000/saas-plans/550e8400-e29b-41d4-a716-446655440009 \
  -H "Authorization: Bearer <token>"
```
