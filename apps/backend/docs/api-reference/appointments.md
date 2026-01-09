# Appointments

Appointments represent scheduled bookings between customers and tenants.

### Create Appointment

**Endpoint:** `POST /appointments`

```bash
curl -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "date": "2025-12-31T10:00:00Z",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "550e8400-e29b-41d4-a716-446655440001",
    "serviceId": "550e8400-e29b-41d4-a716-446655440002"
  }'
```

**Optional fields:**
- `status` - PENDING, CONFIRMED, CANCELED, COMPLETED (default: PENDING)
- `cancellationReason` - Reason for cancellation
- `price` - Price snapshot (auto-filled from service if not provided)
- `externalEventId` - External calendar event ID
- `usedSubscriptionId` - Subscription ID if using a plan
- `paymentId` - Associated payment ID

**Using a subscription instead of a service:**
```bash
curl -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "date": "2025-12-31T10:00:00Z",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "550e8400-e29b-41d4-a716-446655440001",
    "usedSubscriptionId": "550e8400-e29b-41d4-a716-446655440007"
  }'
```

### List All Appointments

**Endpoint:** `GET /appointments`

```bash
curl -X GET http://localhost:3000/appointments \
  -H "Authorization: Bearer <token>"
```

### Get Appointment by ID

**Endpoint:** `GET /appointments/:id`

```bash
curl -X GET http://localhost:3000/appointments/550e8400-e29b-41d4-a716-446655440003 \
  -H "Authorization: Bearer <token>"
```

### Update Appointment

**Endpoint:** `PATCH /appointments/:id`

```bash
curl -X PATCH http://localhost:3000/appointments/550e8400-e29b-41d4-a716-446655440003 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "CONFIRMED"
  }'
```

### Delete Appointment

**Endpoint:** `DELETE /appointments/:id`

```bash
curl -X DELETE http://localhost:3000/appointments/550e8400-e29b-41d4-a716-446655440003 \
  -H "Authorization: Bearer <token>"
```
