# Phase 03: Tenant Service Updates

## Objective
Auto-calculate `saasNextBilling` based on the SaaS plan's interval when creating subscriptions.

---

## Changes

### [MODIFY] [create-tenant.dto.ts](file:///home/gambal/gambs/waba-bot/src/tenants/dto/create-tenant.dto.ts)

Make billing fields optional since they will be calculated:
```diff
-  @IsDateString()
-  @IsNotEmpty()
-  saasNextBilling: string;
+  @IsDateString()
+  @IsOptional()
+  saasNextBilling?: string;

-  @IsString()
-  @IsNotEmpty()
-  saasPaymentMethodId: string;
+  @IsString()
+  @IsOptional()
+  saasPaymentMethodId?: string;
```

---

### [MODIFY] [tenant-saas.service.ts](file:///home/gambal/gambs/waba-bot/src/tenants/tenant-saas.service.ts)

Update `createSubscription` to use the plan's interval for Mercado Pago:
```typescript
async createSubscription(id: string) {
  const tenant = await this.repo.findUnique({
    where: { id },
    include: { saasPlan: true },
  });

  if (!tenant) {
    throw new NotFoundException(`Tenant with ID ${id} not found.`);
  }

  const client = this.mpService.getPlatformClient();
  const preApproval = new PreApproval(client);

  // Map PaymentInterval to Mercado Pago frequency_type
  const frequencyMap = {
    MONTHLY: { frequency: 1, frequency_type: 'months' },
    QUARTERLY: { frequency: 3, frequency_type: 'months' },
    YEARLY: { frequency: 1, frequency_type: 'years' },
  };
  const freq = frequencyMap[tenant.saasPlan.interval] || frequencyMap.MONTHLY;

  const result = await preApproval.create({
    body: {
      reason: `Assinatura SaaS - ${tenant.saasPlan.name}`,
      auto_recurring: {
        frequency: freq.frequency,
        frequency_type: freq.frequency_type,
        transaction_amount: Number(tenant.saasPlan.price),
        currency_id: 'BRL',
      },
      back_url: process.env.MP_BACK_URL || 'https://example.com',
      payer_email: tenant.email,
      external_reference: tenant.id,
    },
  });

  // Calculate next billing based on interval
  const nextBilling = this.calculateNextBilling(tenant.saasPlan.interval);
  
  await this.repo.update(tenant.id, {
    saasNextBilling: nextBilling,
  });

  return {
    initPoint: result.init_point,
    externalId: result.id,
  };
}

private calculateNextBilling(interval: PaymentInterval): Date {
  const now = new Date();
  switch (interval) {
    case 'QUARTERLY':
      return new Date(now.setMonth(now.getMonth() + 3));
    case 'YEARLY':
      return new Date(now.setFullYear(now.getFullYear() + 1));
    case 'MONTHLY':
    default:
      return new Date(now.setMonth(now.getMonth() + 1));
  }
}
```

---

### [MODIFY] [tenant.entity.ts](file:///home/gambal/gambs/waba-bot/src/tenants/entities/tenant.entity.ts)

Make optional fields reflect schema:
```typescript
saasNextBilling?: Date;
saasPaymentMethodId?: string;
```

---

## ⚠️ Risks & Mitigations

| Risk | Level | Mitigation |
|------|-------|------------|
| **Existing API Consumers** | Low | Fields become optional, not removed |
| **Interval Mapping** | Low | Default to MONTHLY if unknown interval |
