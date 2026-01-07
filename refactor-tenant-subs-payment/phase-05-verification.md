# Phase 5: Cross-Cutting Optimization & Verification

## Objective
Final polish, shared validation, and full system verification.

## Proposed Changes

### [NEW] `src/common/validators/related-entities.validator.ts` (or similar)
- Evaluate if a shared validator can handle ID checks for Tenants, Customers, and Services across modules to reduce code duplication.

### [MODIFY] `src/payments/processors/payment-webhook.processor.ts`
- Refactor the processor to use the new repositories.
- Consider extracting status mapping logic to a standalone utility.

## Verification
- Run `pnpm run lint`.
- Final run of `pnpm test` and `pnpm test:e2e`.
- Walkthrough of the new clean architecture.
