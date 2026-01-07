# Phase 6: Webhooks & Reconciliation

Handling asynchronous notifications from Mercado Pago.

## Goals
- Implement a robust Webhook listener.
- Sync payment and subscription status.

## Proposed Changes

### [NEW] WebhooksController
- `POST /webhooks/mercadopago`: Single entry point for all MP notifications.

### [NEW] WebhookDispatcherService
- Identify the resource type (`payment`, `plan`, `subscription`).
- Find the corresponding record in the DB (via `externalId`).
- Update status accordingly (`APPROVED` -> `CONFIRMED` appointment, etc.).

## Verification
- **MCP Tool**: Use `save_webhook` to configure the notification URL for the application.
- **MCP Tool**: Use `simulate_webhook` with specific `resource_id` (payment/subscription) to test various scenarios (Success, Pending, Rejected).
- **MCP Tool**: Use `notifications_history` to diagnostic any delivery issues.
- Ensure idempotency (don't process the same notification twice).
