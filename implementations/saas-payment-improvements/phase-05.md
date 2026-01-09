# Phase 05: Payment Record Creation

## Objective

Record all SaaS payments in the `Payment` model with type `SAAS_FEE`.

---

## Changes

### [MODIFY] [payment-webhook.processor.ts](file:///home/gambal/gambs/waba-bot/src/payments/processors/payment-webhook.processor.ts)

Update `handlePaymentNotification` to check for SaaS payments:

```typescript
private async handlePaymentNotification(
  paymentId: string,
  client: any,
  targetId: string,  // Add parameter
) {
  try {
    const mpPayment = new Payment(client);
    const data = await mpPayment.get({ id: paymentId });

    if (!data) {
      this.logger.error(`Could not fetch details for payment ${paymentId}`);
      return;
    }

    const externalRef = data.external_reference;

    // 1. Check if payment already exists in our DB
    const existingPayments = await this.paymentRepo.findAll({
      where: { externalId: paymentId },
    });

    if (existingPayments.length > 0) {
      await this.paymentRepo.update(existingPayments[0].id, {
        status: this.mapStatus(data.status || 'pending'),
        netAmount: data.net_received_amount,
        fee: data.fee_details?.[0]?.amount,
      });
      return;
    }

    // 2. NEW: SaaS Payment (platform webhook, external_reference = tenantId)
    if (targetId === 'platform' && externalRef) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: externalRef },
      });

      if (tenant) {
        await this.paymentRepo.create({
          externalId: paymentId,
          amount: Number(data.transaction_amount || 0),
          netAmount: data.net_received_amount,
          fee: data.fee_details?.[0]?.amount,
          status: this.mapStatus(data.status || 'pending'),
          type: 'SAAS_FEE',  // KEY: Use SAAS_FEE type
          method: this.mapPaymentMethod(data.payment_method_id),
          tenantId: tenant.id,
          // customerId is null for SaaS payments
        });

        this.logger.log(`Created SAAS_FEE payment for tenant ${tenant.id}`);
        return;
      }
    }

    // 3. Existing: Appointment payment
    if (externalRef) {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: externalRef },
      });

      if (appointment) {
        const newPayment = await this.paymentRepo.create({
          externalId: paymentId,
          amount: Number(data.transaction_amount || 0),
          netAmount: data.net_received_amount,
          fee: data.fee_details?.[0]?.amount,
          status: this.mapStatus(data.status || 'pending'),
          type: 'APPOINTMENT',
          method: this.mapPaymentMethod(data.payment_method_id),
          tenantId: appointment.tenantId,
          customerId: appointment.customerId,
        });

        if (!appointment.paymentId) {
          await this.prisma.appointment.update({
            where: { id: appointment.id },
            data: { paymentId: newPayment.id },
          });
        }
      }
    }
  } catch (error: unknown) {
    this.logger.error(
      `Error handling payment ${paymentId}: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
}

private mapPaymentMethod(mpMethod: string): PaymentMethod {
  if (mpMethod?.includes('pix')) return 'PIX';
  return 'CREDIT_CARD';
}
```

Also update the `handleNotification` call to pass `targetId`:

```diff
case 'payment':
-  await this.handlePaymentNotification(resourceId, client);
+  await this.handlePaymentNotification(resourceId, client, targetId);
  break;
```

---

## ⚠️ Risks & Mitigations

| Risk                       | Level | Mitigation                                      |
| -------------------------- | ----- | ----------------------------------------------- |
| **Duplicate Payments**     | Low   | Check for existing `externalId` before creating |
| **Missing Fee Data**       | Low   | Optional chaining for `fee_details`             |
| **Payment Method Mapping** | Low   | Default to CREDIT_CARD                          |
