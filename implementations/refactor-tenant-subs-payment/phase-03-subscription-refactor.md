# Phase 3: Subscription & Billing Logic

## Objective

Clean up `SubscriptionsService` and separate billing calculations from SDK interactions.

## Proposed Changes

### [NEW] `src/subscriptions/subscription-billing.service.ts`

- Move logic for calculating `nextBilling` dates based on intervals (Monthly, Quarterly, Yearly).
- Responsibility: Pure date/interval logic.

### [NEW] `src/subscriptions/customer-subscription.service.ts`

- Move Mercado Pago `PreApproval` creation logic here.
- Responsibility: Interacting with MP Tenant Client for customer plans.

### [MODIFY] `src/subscriptions/subscriptions.service.ts`

- Simplify `create` method.
- Orchestrate database entries (via repository) and MP creation (via sub-service).

## Verification

- Ensure `QUARTERLY` billing edge cases are handled correctly.
- Test `TenantCustomer` auto-linking.
