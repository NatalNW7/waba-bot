# SaaS Payment Improvements

## Overview
Implement proper SaaS payment tracking with automatic billing calculation and webhook-driven status updates.

## Risk Assessment

### Workspace Stability: ✅ Low Risk
- **Status**: 5 untracked files (documentation/config), 2 modified files (agent rules)
- **Impact**: No uncommitted changes in target modules

### Data Integrity: ⚠️ Medium Risk
- **Concern**: Adding required field to `SaasPlan`, modifying tenant billing logic
- **Mitigation**: Use Prisma migrations with default values

---

## Phase Checklist

| Phase | Description | Risk Level |
|-------|-------------|------------|
| [Phase 01](./phase-01.md) | Schema Changes (Prisma) | ⚠️ Medium |
| [Phase 02](./phase-02.md) | SaaS Plan Service Updates | ✅ Low |
| [Phase 03](./phase-03.md) | Tenant Service Updates | ✅ Low |
| [Phase 04](./phase-04.md) | SaaS Webhook Handler | ⚠️ Medium |
| [Phase 05](./phase-05.md) | Payment Record Creation | ✅ Low |
| [Phase 06](./phase-06.md) | Testing & Documentation | ✅ Low |

---

## Key Changes Summary

1. **Schema**: Add `paymentInterval` to `SaasPlan`, make `saasNextBilling` and `saasPaymentMethodId` optional
2. **Auto-calculation**: `saasNextBilling` computed from plan's interval at subscription creation
3. **Webhooks**: New handler for SaaS `subscription_preapproval` topic to update tenant status
4. **Payment Tracking**: All SaaS payments recorded in `Payment` model with `type: SAAS_FEE`
