# Customers

Customers are end-users who interact with tenants via WhatsApp.

### Create Customer

**Endpoint:** `POST /customers`

```bash
curl -X POST "http://localhost:8081/customers?tenantId=550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "phone": "+5511999999999",
    "name": "João Silva",
    "email": "joao@email.com"
  }'
```

### List All Customers

**Endpoint:** `GET /customers`

```bash
curl -X GET http://localhost:8081/customers \
  -H "Authorization: Bearer <token>"
```

### Get Customer by ID

**Endpoint:** `GET /customers/:id`

```bash
curl -X GET "http://localhost:8081/customers/550e8400-e29b-41d4-a716-446655440001?include=tenants,appointments,payments" \
  -H "Authorization: Bearer <token>"
```

### Update Customer

**Endpoint:** `PATCH /customers/:id`

```bash
curl -X PATCH http://localhost:8081/customers/550e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "João Silva Updated"
  }'
```

### Delete Customer

**Endpoint:** `DELETE /customers/:id`

```bash
curl -X DELETE http://localhost:8081/customers/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer <token>"
```
