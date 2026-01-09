# Phase 02: SaaS Plan Service Updates

## Objective

Update DTOs, entities, and service to support the new `interval` field.

---

## Changes

### [MODIFY] [create-saas-plan.dto.ts](file:///home/gambal/gambs/waba-bot/src/saas-plans/dto/create-saas-plan.dto.ts)

Add `interval` field:

```typescript
import { PaymentInterval } from "@prisma/client";

export class CreateSaasPlanDto {
  // ... existing fields

  /**
   * Billing interval for the plan
   * @example "MONTHLY"
   */
  @IsEnum(PaymentInterval)
  @IsOptional()
  interval?: PaymentInterval;
}
```

---

### [MODIFY] [update-saas-plan.dto.ts](file:///home/gambal/gambs/waba-bot/src/saas-plans/dto/update-saas-plan.dto.ts)

Ensure it extends `PartialType(CreateSaasPlanDto)` (should already be the case).

---

### [MODIFY] [saas-plan.entity.ts](file:///home/gambal/gambs/waba-bot/src/saas-plans/entities/saas-plan.entity.ts)

Add `interval` property for Swagger documentation:

```typescript
import { PaymentInterval } from "@prisma/client";

export class SaasPlanEntity {
  // ... existing fields

  /**
   * Billing interval
   * @example "MONTHLY"
   */
  interval: PaymentInterval;
}
```

---

## ⚠️ Risks & Mitigations

| Risk                    | Level | Mitigation                              |
| ----------------------- | ----- | --------------------------------------- |
| **API Breaking Change** | None  | Field is optional with default          |
| **Swagger Sync**        | Low   | Entity update ensures docs are accurate |
