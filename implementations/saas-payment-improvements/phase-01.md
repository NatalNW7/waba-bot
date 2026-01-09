# Phase 01: Schema Changes

## Objective

Update Prisma schema to support payment intervals and streamline billing fields.

---

## Changes

### [MODIFY] [schema.prisma](file:///home/gambal/gambs/waba-bot/prisma/schema.prisma)

#### 1. Add `paymentInterval` to `SaasPlan`

```prisma
model SaasPlan {
  id          String  @id @default(uuid())
  name        String
  price       Decimal @db.Decimal(10, 2)
  description String?
  interval    PaymentInterval @default(MONTHLY)  // NEW

  tenants     Tenant[]
  // ...
}
```

#### 2. Make `saasNextBilling` optional on Tenant

```diff
-  saasNextBilling     DateTime           @map("saas_next_billing")
+  saasNextBilling     DateTime?          @map("saas_next_billing")
```

#### 3. Make `saasPaymentMethodId` optional on Tenant

```diff
-  saasPaymentMethodId String             @map("saas_payment_method_id")
+  saasPaymentMethodId String?            @map("saas_payment_method_id")
```

> **Rationale for `saasPaymentMethodId`**: This field was intended to reference a saved payment method, but the current implementation uses Mercado Pago's PreApproval which handles payment method selection internally. Making it optional prevents unnecessary required data while preserving the field for future explicit payment method storage.

---

## ⚠️ Risks & Mitigations

| Risk                 | Level  | Mitigation                                                                              |
| -------------------- | ------ | --------------------------------------------------------------------------------------- |
| **Data Migration**   | Medium | The new `interval` field has a default value `MONTHLY`, so existing records won't break |
| **Breaking Changes** | Low    | Making fields optional is backwards-compatible                                          |
| **Existing Tenants** | Low    | Existing tenants with `saasNextBilling` values are unaffected                           |

---

## Migration Command

```bash
pnpm run migrate:make add-saas-payment-interval
```
