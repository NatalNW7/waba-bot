# Payments

Payments track all financial transactions in the system.

### Create Payment

**Endpoint:** `POST /payments`

```bash
curl -X POST http://localhost:8081/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "amount": 30.00,
    "type": "APPOINTMENT",
    "method": "PIX",
    "tenantId": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

**Payment types:** `APPOINTMENT`, `SUBSCRIPTION`, `SAAS_FEE`

**Payment methods:** `PIX`, `CREDIT_CARD`

**Optional fields:**
- `externalId` - External payment gateway ID
- `netAmount` - Net amount after fees
- `fee` - Gateway fee
- `status` - PENDING, APPROVED, REFUNDED, etc.
- `subscriptionId` - Associated subscription ID

### Create Payment Link for Appointment

**Endpoint:** `POST /payments/appointment/:id`

Generates a Mercado Pago payment link for an existing appointment.

```bash
curl -X POST http://localhost:8081/payments/appointment/550e8400-e29b-41d4-a716-446655440003 \
  -H "Authorization: Bearer <token>"
```

### List All Payments

**Endpoint:** `GET /payments`

```bash
curl -X GET http://localhost:8081/payments \
  -H "Authorization: Bearer <token>"
```

### Get Payment by ID

**Endpoint:** `GET /payments/:id`

```bash
curl -X GET http://localhost:8081/payments/550e8400-e29b-41d4-a716-446655440008 \
  -H "Authorization: Bearer <token>"
```

### Update Payment

**Endpoint:** `PATCH /payments/:id`

```bash
curl -X PATCH http://localhost:8081/payments/550e8400-e29b-41d4-a716-446655440008 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "APPROVED"
  }'
```

### Delete Payment

**Endpoint:** `DELETE /payments/:id`

```bash
curl -X DELETE http://localhost:8081/payments/550e8400-e29b-41d4-a716-446655440008 \
  -H "Authorization: Bearer <token>"
```
