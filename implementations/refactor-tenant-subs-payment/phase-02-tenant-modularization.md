# Phase 2: Tenant Module Modularization

## Objective

Decompose the monolithic `TenantsService` to adhere to the Single Responsibility Principle.

## Proposed Changes

### [NEW] `src/tenants/tenant-saas.service.ts`

- Move `createSubscription` (SaaS plan subscription) logic here.
- Responsibility: Interact with Mercado Pago Platform Client for SaaS billing.

### [NEW] `src/tenants/tenant-mp-auth.service.ts`

- Move `getMpAuthorizationUrl` and `exchangeMpCode` here.
- Responsibility: Handle OAuth flow for linking tenant MP accounts.

### [MODIFY] `src/tenants/tenants.service.ts`

- Remove SaaS and OAuth logic.
- Inject `TenantRepository`, `TenantSaasService`, and `TenantMpAuthService`.
- Act as the entry point for tenant management.

## Verification

- Unit tests for each new smaller service.
- E2E tests for SaaS subscription and OAuth flow.
