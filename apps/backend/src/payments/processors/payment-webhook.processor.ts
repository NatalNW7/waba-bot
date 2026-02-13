import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { MercadoPagoService } from '../mercadopago.service';
import { Payment, PreApproval } from 'mercadopago';
import {
  PaymentStatus,
  PaymentMethod,
  SubscriptionStatus,
  PaymentInterval,
} from '@prisma/client';
import { PaymentRepository } from '../payment-repository.service';
import { InfinitePayService } from '../infinite-pay.service';
import { InfinitePayWebhookPayload } from '../dto/infinite-pay.dto';
import { AppointmentPaymentHandlerService } from '../../notifications/appointment-payment-handler.service';

@Processor('payment-notifications')
export class PaymentQueueProcessor {
  private readonly logger = new Logger(PaymentQueueProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mpService: MercadoPagoService,
    private readonly paymentRepo: PaymentRepository,
    private readonly infinitePayService: InfinitePayService,
    private readonly appointmentPaymentHandler: AppointmentPaymentHandlerService,
  ) {}

  @Process('handle-notification')
  async handleNotification(
    job: Job<{
      topic: string;
      resourceId: string;
      targetId: string;
      payload?: any;
    }>,
  ) {
    const { topic, resourceId, targetId, payload } = job.data;
    this.logger.log(
      `Processing notification for ${targetId}: ${topic} - ${resourceId}`,
    );

    try {
      const client =
        targetId === 'platform'
          ? this.mpService.getPlatformClient()
          : await this.mpService.getTenantClient(targetId);

      switch (topic) {
        case 'payment':
          await this.handlePaymentNotification(resourceId, client, targetId);
          break;
        case 'subscription_preapproval':
          await this.handleSubscriptionNotification(
            resourceId,
            client,
            targetId,
          );
          break;
        case 'infinitepay_payment':
          await this.handleInfinitePayNotification(
            resourceId,
            payload,
            targetId,
          );
          break;
        default:
          this.logger.warn(`Unhandled topic in job: ${topic}`);
      }
    } catch (error: unknown) {
      this.logger.error(
        `Error processing job for ${resourceId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error; // Re-throw to trigger Bull retry
    }
  }

  private async handlePaymentNotification(
    paymentId: string,
    client: any,
    targetId: string,
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
        const paymentData = data as any;
        await this.paymentRepo.update(existingPayments[0].id, {
          status: this.mapStatus(data.status!),
          netAmount: paymentData.net_received_amount,
          fee: paymentData.fee_details?.[0]?.amount,
        });
        return;
      }

      // 2. SaaS Payment (platform webhook, external_reference = tenantId)
      if (targetId === 'platform' && externalRef) {
        const tenant = await this.prisma.tenant.findUnique({
          where: { id: externalRef },
        });

        if (tenant) {
          const paymentData = data as any;
          await this.paymentRepo.create({
            externalId: paymentId,
            amount: Number(data.transaction_amount || 0),
            netAmount: paymentData.net_received_amount,
            fee: paymentData.fee_details?.[0]?.amount,
            status: this.mapStatus(data.status!),
            type: 'SAAS_FEE',
            method: this.mapPaymentMethod(data.payment_method_id ?? ''),
            tenantId: tenant.id,
          });

          this.logger.log(`Created SAAS_FEE payment for tenant ${tenant.id}`);
          return;
        }
      }

      // 3. Appointment payment (tenant webhook)
      if (externalRef) {
        const appointment = await this.prisma.appointment.findUnique({
          where: { id: externalRef },
        });

        if (appointment) {
          const paymentData = data as any;
          const paymentStatus = this.mapStatus(data.status!);
          const newPayment = await this.paymentRepo.create({
            externalId: paymentId,
            amount: Number(data.transaction_amount || 0),
            netAmount: paymentData.net_received_amount,
            fee: paymentData.fee_details?.[0]?.amount,
            status: paymentStatus,
            type: 'APPOINTMENT',
            method: this.mapPaymentMethod(data.payment_method_id ?? ''),
            tenantId: appointment.tenantId,
            customerId: appointment.customerId,
          });

          if (!appointment.paymentId) {
            await this.prisma.appointment.update({
              where: { id: appointment.id },
              data: { paymentId: newPayment.id },
            });
          }

          // Update appointment status and send notifications
          await this.appointmentPaymentHandler.handlePaymentResult(
            appointment.id,
            paymentStatus,
          );
        }
      }
    } catch (error: unknown) {
      this.logger.error(
        `Error handling payment notification ${paymentId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private async handleSubscriptionNotification(
    preApprovalId: string,
    client: any,
    targetId: string,
  ) {
    const preApproval = new PreApproval(client);
    const data = await preApproval.get({ id: preApprovalId });

    // CASE 1: SaaS subscription (platform) - Update Tenant
    if (targetId === 'platform') {
      const externalRef = data.external_reference;

      if (externalRef) {
        const tenant = await this.prisma.tenant.findUnique({
          where: { id: externalRef },
          include: { saasPlan: true },
        });

        if (tenant) {
          const newStatus = this.mapSaasStatus(data.status ?? 'pending');
          const nextBilling =
            data.status === 'authorized'
              ? this.calculateNextBilling(
                  tenant.saasPlan?.interval || 'MONTHLY',
                )
              : tenant.saasNextBilling;

          await this.prisma.tenant.update({
            where: { id: tenant.id },
            data: {
              saasStatus: newStatus,
              saasNextBilling: nextBilling,
            },
          });

          this.logger.log(
            `Updated SaaS status for tenant ${tenant.id}: ${newStatus}`,
          );
        }
      }
      return;
    }

    // CASE 2: Customer subscription - Update Subscription
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

  private mapStatus(mpStatus: string): PaymentStatus {
    switch (mpStatus) {
      case 'approved':
        return PaymentStatus.APPROVED;
      case 'pending':
        return PaymentStatus.PENDING;
      case 'in_process':
        return PaymentStatus.PENDING;
      case 'rejected':
        return PaymentStatus.FAILED;
      case 'cancelled':
        return PaymentStatus.FAILED;
      case 'refunded':
        return PaymentStatus.REFUNDED;
      default:
        return PaymentStatus.PENDING;
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

  private mapPaymentMethod(mpMethod: string): PaymentMethod {
    if (mpMethod?.toLowerCase().includes('pix')) return 'PIX';
    return 'CREDIT_CARD';
  }

  private mapInfinitePayMethod(captureMethod?: string): PaymentMethod {
    const method = captureMethod?.toLowerCase() || '';
    if (method.includes('pix')) return PaymentMethod.PIX;
    if (method.includes('debit')) return PaymentMethod.DEBIT_CARD;
    if (method.includes('credit')) return PaymentMethod.CREDIT_CARD;
    return PaymentMethod.OTHER;
  }

  private calculateNextBilling(interval: PaymentInterval | string): Date {
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

  private async handleInfinitePayNotification(
    orderNsu: string,
    payload: InfinitePayWebhookPayload,
    targetId: string,
  ) {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: targetId },
      });

      const data = await this.infinitePayService.processWebhookNotification(
        targetId,
        orderNsu,
        payload,
        tenant?.infinitePayTag || null,
      );

      // Determine status
      let paymentStatus: PaymentStatus = PaymentStatus.PENDING;
      if (data.paid === true || data.success === true) {
        paymentStatus = PaymentStatus.APPROVED;
      } else if (data.status === 'failed' || data.status === 'rejected') {
        paymentStatus = PaymentStatus.FAILED;
      }

      // Update Database
      const existingPayment = await this.paymentRepo.findUnique({
        where: { id: orderNsu },
      });

      if (existingPayment) {
        await this.paymentRepo.update(orderNsu, {
          status: paymentStatus,
          infinitePaySlug: data.invoice_slug || data.slug,
          netAmount: data.amount ? Number(data.amount) / 100 : undefined,
          amount: data.amount
            ? Number(data.amount) / 100
            : existingPayment.amount,
          method: this.mapInfinitePayMethod(data.capture_method),
          externalId: data.transaction_nsu,
        });

        this.logger.log(
          `Updated InfinitePay payment ${orderNsu} to ${paymentStatus}`,
        );

        // If this payment is linked to an appointment, handle status + notifications
        if (existingPayment.type === 'APPOINTMENT') {
          const appointment = await this.prisma.appointment.findFirst({
            where: { paymentId: existingPayment.id },
          });
          if (appointment) {
            await this.appointmentPaymentHandler.handlePaymentResult(
              appointment.id,
              paymentStatus,
            );
          }
        }
      } else {
        this.logger.warn(
          `Payment ${orderNsu} not found for InfinitePay update`,
        );
      }
    } catch (error) {
      this.logger.error(`Error handling InfinitePay notification: ${error}`);
      throw error;
    }
  }
}
