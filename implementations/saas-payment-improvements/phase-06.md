# Phase 06: Testing & Documentation

## Objective
Add/update unit tests and update `onboarding-flow.md` documentation.

---

## Test Updates

### [MODIFY] [tenant-saas.service.spec.ts](file:///home/gambal/gambs/waba-bot/src/tenants/tenant-saas.service.spec.ts)

Add tests for:
- `calculateNextBilling` with MONTHLY, QUARTERLY, YEARLY intervals
- Subscription creation uses plan's interval

### [MODIFY] [payment-webhook.processor.spec.ts](file:///home/gambal/gambs/waba-bot/src/payments/processors/payment-webhook.processor.spec.ts)

Add tests for:
- SaaS payment notification creates `SAAS_FEE` payment record
- SaaS subscription notification updates tenant `saasStatus` and `saasNextBilling`
- Distinguishes between platform and tenant webhooks

---

## Documentation Updates

### [MODIFY] [onboarding-flow.md](file:///home/gambal/gambs/waba-bot/onboarding-flow.md)

Add new section: **"Step 3b: Webhook Processing"**

```markdown
### Step 3b: Webhook Processing (Automatic)

When a SaaS payment is processed by Mercado Pago, webhooks are sent to:

**Endpoint:** `POST /webhooks/mercadopago/platform`

**Processing Flow:**
1. Webhook received and queued via Bull
2. `PaymentQueueProcessor` fetches payment details from Mercado Pago
3. For `payment` topic:
   - Creates `Payment` record with `type: SAAS_FEE`
   - Links to tenant via `external_reference`
4. For `subscription_preapproval` topic:
   - Updates `Tenant.saasStatus` (ACTIVE, PAST_DUE, CANCELED)
   - Recalculates `saasNextBilling` based on plan interval
```

Also update the Schema section to reflect:
- `SaasPlan.interval` field
- Optional `saasNextBilling` and `saasPaymentMethodId`

---

## ⚠️ Risks & Mitigations

| Risk | Level | Mitigation |
|------|-------|------------|
| **Test Coverage Gaps** | Low | Focus on critical paths |
| **Documentation Drift** | Low | Update docs in same PR as code |

---

## Verification Commands

```bash
# Run unit tests
pnpm test -- --testPathPattern="tenant-saas|payment-webhook"

# Run all tests
pnpm test

# Generate Prisma client after migration
pnpm prisma generate
```
