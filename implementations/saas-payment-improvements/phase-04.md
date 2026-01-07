# Phase 04: SaaS Webhook Handler

## Objective
Handle Mercado Pago webhooks for SaaS subscription payments to update tenant billing status.

---

## Changes

### [MODIFY] [payment-webhook.processor.ts](file:///home/gambal/gambs/waba-bot/src/payments/processors/payment-webhook.processor.ts)

Update `handleSubscriptionNotification` to handle **SaaS payments** (when `targetId === 'platform'`):

```typescript
private async handleSubscriptionNotification(
  preApprovalId: string,
  client: any,
  targetId: string,  // Add this parameter
) {
  const preApproval = new PreApproval(client);
  const data = await preApproval.get({ id: preApprovalId });

  // CASE 1: SaaS subscription (platform) - Update Tenant
  if (targetId === 'platform') {
    const externalRef = data.external_reference; // This is the tenantId
    
    if (externalRef) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: externalRef },
        include: { saasPlan: true },
      });

      if (tenant) {
        const newStatus = this.mapSaasStatus(data.status);
        const nextBilling = this.calculateNextBilling(
          tenant.saasPlan?.interval || 'MONTHLY'
        );

        await this.prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            saasStatus: newStatus,
            saasNextBilling: data.status === 'authorized' ? nextBilling : tenant.saasNextBilling,
          },
        });

        this.logger.log(`Updated SaaS status for tenant ${tenant.id}: ${newStatus}`);
      }
    }
    return;
  }

  // CASE 2: Customer subscription - Update Subscription (existing logic)
  const subscription = await this.prisma.subscription.findFirst({
    where: { externalId: preApprovalId },
  });

  if (subscription) {
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: data.status === 'authorized' ? 'ACTIVE' : 'PAST_DUE',
      },
    });
  }
}

private mapSaasStatus(mpStatus: string): SubscriptionStatus {
  switch (mpStatus) {
    case 'authorized':
    case 'active':
      return 'ACTIVE';
    case 'paused':
    case 'pending':
      return 'PAST_DUE';
    case 'cancelled':
      return 'CANCELED';
    default:
      return 'PAST_DUE';
  }
}

private calculateNextBilling(interval: string): Date {
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

Also update the `handleNotification` method to pass `targetId`:
```diff
case 'subscription_preapproval':
-  await this.handleSubscriptionNotification(resourceId, client);
+  await this.handleSubscriptionNotification(resourceId, client, targetId);
  break;
```

---

## ⚠️ Risks & Mitigations

| Risk | Level | Mitigation |
|------|-------|------------|
| **Webhook Signature** | Low | Signature validation already implemented |
| **Race Conditions** | Low | Bull queue processes sequentially per job |
| **Missing Tenant** | Low | Null check before update |
| **Status Mapping** | Medium | Log unmapped statuses, default to PAST_DUE |
