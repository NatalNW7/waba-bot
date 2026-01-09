# Webhooks

### WhatsApp Webhook

Receives WhatsApp messages from Meta's webhook.

**Endpoint:** `POST /webhook/whatsapp`

This endpoint is typically called by Meta when WhatsApp messages are received.

```bash
curl -X POST http://localhost:3000/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [...]
  }'
```

### Mercado Pago Webhook

Receives payment notifications from Mercado Pago.

**Endpoint:** `POST /webhooks/mercadopago/:id`

The `:id` can be `platform` for SaaS payments or a tenant ID for tenant-specific payments.

```bash
# Platform webhook
curl -X POST "http://localhost:3000/webhooks/mercadopago/platform?topic=payment&id=123456789" \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=1234567890,v1=abc123..." \
  -H "x-request-id: req_123" \
  -d '{
    "type": "payment",
    "data": {
      "id": "123456789"
    }
  }'

# Tenant-specific webhook
curl -X POST "http://localhost:3000/webhooks/mercadopago/550e8400-e29b-41d4-a716-446655440000?topic=payment&id=123456789" \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=1234567890,v1=abc123..." \
  -H "x-request-id: req_123" \
  -d '{
    "type": "payment",
    "data": {
      "id": "123456789"
    }
  }'
```
