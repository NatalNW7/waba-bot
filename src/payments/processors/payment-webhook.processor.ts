import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { MercadoPagoService } from '../mercadopago.service';
import { Payment, PreApproval } from 'mercadopago';
import { PaymentStatus } from '@prisma/client';
import { PaymentRepository } from '../payment-repository.service';

@Processor('payment-notifications')
export class PaymentQueueProcessor {
  private readonly logger = new Logger(PaymentQueueProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mpService: MercadoPagoService,
    private readonly paymentRepo: PaymentRepository,
  ) {}

  @Process('handle-notification')
  async handleNotification(
    job: Job<{ topic: string; resourceId: string; targetId: string }>,
  ) {
    const { topic, resourceId, targetId } = job.data;
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
          await this.handlePaymentNotification(resourceId, client);
          break;
        case 'subscription_preapproval':
          await this.handleSubscriptionNotification(resourceId, client);
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

  private async handlePaymentNotification(paymentId: string, client: any) {
    try {
      const mpPayment = new Payment(client);
      const data = await mpPayment.get({ id: paymentId });

      if (!data) {
        this.logger.error(`Could not fetch details for payment ${paymentId}`);
        return;
      }

      const externalRef = data.external_reference;

      // 1. Is it a payment recorded in our DB?
      const internalPayments = await this.paymentRepo.findAll({
        where: { externalId: paymentId },
      });
      const internalPayment = internalPayments[0];

      if (internalPayment) {
        await this.paymentRepo.update(internalPayment.id, {
          status: this.mapStatus(data.status || 'pending'),
        });
        return;
      }

      // 2. Is it a payment for an appointment (external_reference)?
      if (externalRef) {
        const appointment = await this.prisma.appointment.findUnique({
          where: { id: externalRef },
        });

        if (appointment) {
          // Create the payment record if it doesn't exist
          const newPayment = await this.paymentRepo.create({
            externalId: paymentId,
            amount: Number(data.transaction_amount || 0),
            status: this.mapStatus(data.status || 'pending'),
            type: 'APPOINTMENT',
            method: 'CREDIT_CARD', // Default for now
            tenantId: appointment.tenantId,
            customerId: appointment.customerId,
          });

          // Link to appointment if not linked
          if (!appointment.paymentId) {
            await this.prisma.appointment.update({
              where: { id: appointment.id },
              data: {
                paymentId: newPayment.id,
              },
            });
          }
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
  ) {
    const preApproval = new PreApproval(client);
    const data = await preApproval.get({ id: preApprovalId });

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
}
