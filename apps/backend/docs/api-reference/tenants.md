# Tenants

Tenants represent businesses using the WhatsApp Business API through this platform.

### Create Tenant

**Endpoint:** `POST /tenants`

```bash
curl -X POST http://localhost:3000/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "My Barber Shop",
    "email": "contact@barbershop.com",
    "phone": "+5511999999999",
    "saasPlanId": "550e8400-e29b-41d4-a716-446655440003"
  }'
```

**Optional fields:**
- `wabaId` - WhatsApp Business Account ID
- `phoneId` - WhatsApp phone number ID
- `accessToken` - Meta API access token
- `mpAccessToken` - Mercado Pago access token
- `mpPublicKey` - Mercado Pago public key
- `mpRefToken` - Mercado Pago refresh token
- `saasStatus` - SaaS subscription status (ACTIVE, PAST_DUE, CANCELED, EXPIRED)
- `saasNextBilling` - Next billing date (ISO 8601)
- `saasPaymentMethodId` - Payment method ID

### List All Tenants

**Endpoint:** `GET /tenants`

```bash
curl -X GET http://localhost:3000/tenants \
  -H "Authorization: Bearer <token>"
```

### Get Tenant by ID

**Endpoint:** `GET /tenants/:id`

```bash
curl -X GET http://localhost:3000/tenants/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <token>"
```

**With included relations:**

```bash
curl -X GET "http://localhost:3000/tenants/550e8400-e29b-41d4-a716-446655440000?include=services,customers,operatingHours,saasPlan,appointments,users" \
  -H "Authorization: Bearer <token>"
```

### Update Tenant

**Endpoint:** `PATCH /tenants/:id`

```bash
curl -X PATCH http://localhost:3000/tenants/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Updated Barber Shop Name"
  }'
```

### Delete Tenant

**Endpoint:** `DELETE /tenants/:id`

```bash
curl -X DELETE http://localhost:3000/tenants/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <token>"
```

### Create SaaS Subscription for Tenant

**Endpoint:** `POST /tenants/:id/subscribe`

```bash
curl -X POST http://localhost:3000/tenants/550e8400-e29b-41d4-a716-446655440000/subscribe \
  -H "Authorization: Bearer <token>"
```

### Get Mercado Pago OAuth URL

**Endpoint:** `GET /tenants/:id/auth/mercadopago`

```bash
curl -X GET http://localhost:3000/tenants/550e8400-e29b-41d4-a716-446655440000/auth/mercadopago \
  -H "Authorization: Bearer <token>"
```
