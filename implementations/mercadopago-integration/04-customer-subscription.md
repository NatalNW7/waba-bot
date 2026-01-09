# Phase 4: Customer Subscriptions

Customers can subscribe to plans offered by the Tenant (e.g., a monthly beauty salon plan).

## Goals

- Create subscriptions on the **Tenant's** Mercado Pago account.
- Manage `Subscription` records in our DB.

## Proposed Changes

### [MODIFY] SubscriptionsService

- `create()`: Now must call Mercado Pago `preapproval` API using the **Tenant's client**.
- Requires the Customer's credit card token (obtained via MercadoPago.js on the frontend).

### [NEW] Card Tokenization Flow

- Although mainly frontend, the backend must support receiving and using the `token`.

## Verification

- Verify that the subscription is created in the _Tenant's_ MP account, not the platform's.
- **MCP Tool**: Use `create_test_user` (profile: "seller") for the Tenant and another for the Buyer to test the N:N relationship and segmented payments.
- Verify `Subscription` status updates in our DB.
