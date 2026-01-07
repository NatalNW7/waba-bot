# Phase 03: E2E Integration Testing

This phase ensures that all modules (`Tenants`, `Subscriptions`, `Payments`) and `MercadoPagoService` work together in a real-world scenario using the Mercado Pago Sandbox.

## Goals
- Validate the full lifecycle of a plan and subscription.
- Test real API communication with Mercado Pago Sandbox.
- Verify that webhooks correctly reconcile state in the production database.

## Test Scenarios

### 1. The Multi-Tenant Onboarding Flow
- [ ] Start OAuth flow for a test tenant.
- [ ] Exchange the test code for credentials.
- [ ] Verify that `mpAccessToken` and `mpPublicKey` are stored.

### 2. SaaS Subscription Flow
- [ ] Tenant created with `saasPlanId`.
- [ ] POST `/tenants/:id/subscribe` returns a valid `init_point`.
- [ ] Manual check (browser): Link opens the MP checkout.

### 3. Customer Subscription & Webhook Flow
- [ ] Create a `Plan` for a Tenant.
- [ ] Customer subscribes via POST `/subscriptions` (using test card token).
- [ ] Subscription created with `PENDING` status.
- [ ] Use **MCP Tool `simulate_webhook`** to send a "preapproval" notification.
- [ ] Verify that subscription status changes to `ACTIVE` in DB.

### 4. Appointment Payment & Webhook Flow
- [ ] Create an `Appointment`.
- [ ] POST `/payments/appointment/:id` returns a payment link.
- [ ] Use **MCP Tool `simulate_webhook`** to send a "payment" notification with `external_reference=appointmentId`.
- [ ] Verify that a `Payment` record is created and linked to the `Appointment`.
- [ ] Verify `Appointment` status is updated (if applicable).

## Tools & Utilities
- **Supertest**: For making HTTP requests to the local NestJS server.
- **mercadopago-mcp-server**:
    - `create_test_user`: For fresh buyer/seller accounts.
    - `simulate_webhook`: For triggering reconciliation logic without real interaction.
    - `notifications_history`: For debugging failed delivery attempts.
- **Postgres (Test DB)**: Use a separate database/schema for E2E tests.

## Verification
- Run E2E suite: `pnpm run test:e2e`.
