# Phase 02: Webhook Security & Asynchronous Processing

This phase addresses the security of incoming notifications and the architectural requirement for fast HTTP responses using a message queue.

## Scope
- `WebhooksController`: Signature verification logic.
- `MercadoPagoWebhooksService`: Logic for dispatching work to a Bull queue.
- `PaymentQueueProcessor`: New component to process notifications asynchronously.

## Security: Signature Validation
Mercado Pago webhooks must be validated using the `x-signature` header to prevent spoofing.

### Implementation Checklist
- [ ] Retrieve `MP_WEBHOOK_SECRET` from environment.
- [ ] Extract `ts` and `v1` from `x-signature`.
- [ ] Build manifest string: `id:resource_id;request-id:x-request-id;ts:ts_value`.
- [ ] Calculate HMAC-SHA256(manifest, secret).
- [ ] Compare result with `v1`.

## Asynchronous Processing (Bull)
To ensure responses are sent within 22 seconds, the controller should only validate and enqueue.

### Architecture
1. **Webhook Received**: `WebhooksController` validates signature.
2. **Immediate Reply**: Return HTTP 200/201.
3. **Queue Job**: `MercadoPagoWebhooksService` adds job to `payment-notifications` queue.
4. **Processing**: `PaymentQueueProcessor` (Bull) executes the logic (fetching MP details, updating DB).

## Proposed Tests

### Webhook Security Tests
- [ ] **Valid Signature**: Should accept the request and return 200.
- [ ] **Invalid Signature**: Should return 401 Unauthorized.
- [ ] **Missing Header**: Should return 400 Bad Request.

### Queue Integration Tests
- [ ] **Job Enqueueing**: `handleNotification` should call `queue.add()` with the correct payload.
- [ ] **Processor Execution**: Processor should correctly handle `payment` and `subscription_preapproval` topics by calling the respective logic.

## Verification Tools
- **Bull Board**: For visual queue monitoring (optional).
- **Jest Mocks**: Mock `@nestjs/bull` `Queue` to verify `add()` calls.
