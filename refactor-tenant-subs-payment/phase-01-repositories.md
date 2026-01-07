# Phase 1: Data Access Layer (Repositories)

## Objective
Introduce the Repository pattern to decouple the business services from the Prisma ORM.

## Proposed Changes

### [NEW] `src/tenants/tenant-repository.service.ts`
- Implement basic CRUD operations for the `Tenant` model.
- Include methods for finding tenants with their relations.

### [NEW] `src/subscriptions/subscription-repository.service.ts`
- Implement basic CRUD for `Subscription`.
- Add `countSubscriptionUsage` (if needed for customer plans).

### [NEW] `src/payments/payment-repository.service.ts`
- Implement basic CRUD for `Payment`.

### [MODIFY] `src/tenants/tenants.module.ts`, `src/subscriptions/subscriptions.module.ts`, `src/payments/payments.module.ts`
- Register the new repository services as providers.

## Verification
- Run existing unit tests to ensure they still pass (mocking the repositories instead of Prisma if necessary).
