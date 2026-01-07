# Payment Integration Testing Plan: Mercado Pago

This folder contains the roadmap for verifying the Mercado Pago integration across the `Payments`, `Subscriptions`, and `Tenants` modules.

## Summary of Phases

| Phase | Title | Focus |
| :--- | :--- | :--- |
| **[01](./phase-01-unit-testing.md)** | **Unit Testing & Business Logic** | Isolating services, date calculations, and core business rules via mocks. |
| **[02](./phase-02-webhook-security-async.md)** | **Webhook Security & Bull Queue** | HMAC-SHA256 signature validation and asynchronous notification processing via queues. |
| **[03](./phase-03-e2e-integration.md)** | **E2E Integration Testing** | Full flow validation using MP Sandbox and MCP simulation tools. |
| **[04](./phase-04-reliability-edge-cases.md)** | **Reliability & Edge Cases** | Idempotency, error handling, retries, and integration quality checks. |

## Quick Start
- To run unit tests: `pnpm run test`
- To run E2E tests: `pnpm run test:e2e`

## Key Requirements Covered
- **Signature Validation**: HMAC-SHA256 of `id`, `x-request-id`, and `ts`.
- **Performance**: Async processing via Bull to meet 22s response limit.
- **Multitenancy**: Credential factory testing for platform and individual tenants.
