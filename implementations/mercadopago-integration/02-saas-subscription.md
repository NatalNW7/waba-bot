# Phase 2: Tenant SaaS Subscription

This phase implements the payment flow for the Tenants to subscribe to the SaaS platform.

## Goals
- Create a Checkout flow for `SaasPlan`.
- Handle the `SAAS_FEE` payment type.
- Update `Tenant` status upon successful payment.

## Proposed Changes

### [MODIFY] TenantsController / Service
- `POST /tenants/:id/subscribe`: Endpoint to initiate a SaaS plan subscription.
- This will generate a Mercado Pago "Preference" or "Subscription" (Pre-approval) using the **Platform** credentials.

### [MODIFY] PaymentsService
- Logic to create `Payment` records with `type: SAAS_FEE`.

## Verification
- Successful creation of a Mercado Pago subscription link.
- **MCP Tool**: Use `create_test_user` (profile: "buyer") and `add_money_test_user` to simulate a tenant paying for the SaaS plan in sandbox.
- Simulation of a successful payment affecting the `Tenant.saasStatus`.
