# Subscriptions

Subscriptions are recurring plans purchased by customers from tenants.

### Create Subscription

**Endpoint:** `POST /subscriptions`

```bash
curl -X POST http://localhost:8081/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "cardTokenId": "card_123...",
    "planId": "550e8400-e29b-41d4-a716-446655440006",
    "customerId": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

**Optional fields:**
- `status` - ACTIVE, PAST_DUE, CANCELED, EXPIRED (default: ACTIVE)
- `startDate` - Start date (default: now)
- `nextBilling` - Next billing date (auto-calculated)

### List All Subscriptions

**Endpoint:** `GET /subscriptions`

```bash
curl -X GET http://localhost:8081/subscriptions \
  -H "Authorization: Bearer <token>"
```

### Get Subscription by ID

**Endpoint:** `GET /subscriptions/:id`

```bash
curl -X GET "http://localhost:8081/subscriptions/550e8400-e29b-41d4-a716-446655440007?include=plan,appointments,payments" \
  -H "Authorization: Bearer <token>"
```

### Update Subscription

**Endpoint:** `PATCH /subscriptions/:id`

```bash
curl -X PATCH http://localhost:8081/subscriptions/550e8400-e29b-41d4-a716-446655440007 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "CANCELED"
  }'
```

### Delete Subscription

**Endpoint:** `DELETE /subscriptions/:id`

```bash
curl -X DELETE http://localhost:8081/subscriptions/550e8400-e29b-41d4-a716-446655440007 \
  -H "Authorization: Bearer <token>"
```
