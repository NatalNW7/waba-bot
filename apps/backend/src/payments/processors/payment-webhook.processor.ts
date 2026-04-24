import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { MercadoPagoService } from '../mercadopago.service';
import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago';
import {
  PaymentStatus,
  PaymentMethod,
  PaymentType,
  SubscriptionStatus,
  PaymentInterval,
} from '@prisma/client';
import { PaymentRepository } from '../payment-repository.service';
import { InfinitePayService } from '../infinite-pay.service';
import { InfinitePayWebhookPayload } from '../dto/infinite-pay.dto';
import { AppointmentPaymentHandlerService } from '../../notifications/appointment-payment-handler.service';

/**
 * Payload parcial da resposta da API de Pagamentos do Mercado Pago.
 * Campos que não existem nos tipos oficiais do SDK (ex: net_received_amount)
 * são declarados aqui para evitar casts `as any`.
 */
interface MpPaymentData {
  id?: string;
  status?: string;
  transaction_amount?: number;
  external_reference?: string;
  payment_method_id?: string;
  operation_type?: string;
  net_received_amount?: number;
  fee_details?: Array<{ amount: number; type: string; fee_payer: string }>;
}

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
        case 'subscription_authorized_payment':
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
    client: MercadoPagoConfig,
    targetId: string,
  ) {
    try {
      const mpPayment = new Payment(client);
      const data = await mpPayment.get({ id: paymentId });

      if (!data) {
        this.logger.error(`Could not fetch details for payment ${paymentId}`);
        return;
      }

      const paymentData = data as MpPaymentData;

      // Filtrar validações de cartão (valor R$0 gerado pelo MP para testar o cartão)
      if (paymentData.operation_type === 'card_validation') {
        this.logger.log(
          `Ignoring card_validation payment ${paymentId}`,
        );
        return;
      }

      // 1. Check if payment already exists in our DB
      const existingPayments = await this.paymentRepo.findAll({
        where: { externalId: paymentId },
      });

      if (existingPayments.length > 0) {
        await this.updateExistingPayment(
          existingPayments[0],
          paymentData,
          targetId,
        );
        return;
      }

      // 2. Classify and process new payment
      const paymentType = this.classifyPaymentType(paymentData, targetId);

      if (!paymentType) {
        this.logger.warn(
          `Ignoring unclassified payment ${paymentId} (operation_type: ${paymentData.operation_type})`,
        );
        return;
      }

      switch (paymentType) {
        case PaymentType.SAAS_FEE:
          await this.createSaasPayment(paymentData, paymentId, targetId);
          break;
        case PaymentType.APPOINTMENT:
          await this.createAppointmentPayment(
            paymentData,
            paymentId,
            targetId,
          );
          break;
        case PaymentType.SUBSCRIPTION:
          this.logger.log(
            `Subscription payment ${paymentId} from tenant ${targetId} — future handling`,
          );
          break;
      }
    } catch (error: unknown) {
      this.logger.error(
        `Error handling payment notification ${paymentId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Classifica o tipo de pagamento com base no payload do Mercado Pago.
   * Usa `operation_type`, `targetId` e `external_reference` como critérios.
   */
  private classifyPaymentType(
    data: MpPaymentData,
    targetId: string,
  ): PaymentType | null {
    // SaaS: pagamento da plataforma com external_reference (tenantId)
    if (targetId === 'platform' && data.external_reference) {
      return PaymentType.SAAS_FEE;
    }

    // Assinatura de cliente com tenant (pagamento recorrente não-plataforma)
    if (
      data.operation_type === 'recurring_payment' &&
      targetId !== 'platform'
    ) {
      return PaymentType.SUBSCRIPTION;
    }

    // Pagamento avulso de agendamento
    if (data.external_reference) {
      return PaymentType.APPOINTMENT;
    }

    return null; // Não classificável
  }

  /**
   * Atualiza um pagamento já existente no banco de dados e gerencia
   * o status do tenant quando o pagamento é SaaS.
   */
  private async updateExistingPayment(
    existing: { id: string },
    paymentData: MpPaymentData,
    targetId: string,
  ) {
    const newStatus = this.mapStatus(paymentData.status!);
    await this.paymentRepo.update(existing.id, {
      status: newStatus,
      netAmount: paymentData.net_received_amount,
      fee: paymentData.fee_details?.[0]?.amount,
    });

    // Atualizar saasStatus do tenant quando o pagamento é SaaS
    if (targetId === 'platform' && paymentData.external_reference) {
      if (newStatus === PaymentStatus.FAILED) {
        await this.prisma.tenant.update({
          where: { id: paymentData.external_reference },
          data: { saasStatus: SubscriptionStatus.PAST_DUE },
        });
        this.logger.warn(
          `SaaS payment update failed for tenant ${paymentData.external_reference}, status set to PAST_DUE`,
        );
      } else if (newStatus === PaymentStatus.APPROVED) {
        await this.prisma.tenant.update({
          where: { id: paymentData.external_reference },
          data: { saasStatus: SubscriptionStatus.ACTIVE },
        });
        this.logger.log(
          `SaaS payment approved for tenant ${paymentData.external_reference}, status restored to ACTIVE`,
        );
      }
    }
  }

  /**
   * Cria um novo pagamento do tipo SAAS_FEE e atualiza o status do tenant.
   */
  private async createSaasPayment(
    paymentData: MpPaymentData,
    paymentId: string,
    targetId: string,
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: paymentData.external_reference! },
    });

    if (!tenant) {
      this.logger.warn(
        `Tenant ${paymentData.external_reference} not found for SaaS payment ${paymentId}`,
      );
      return;
    }

    const paymentStatus = this.mapStatus(paymentData.status!);
    await this.paymentRepo.create({
      externalId: paymentId,
      amount: Number(paymentData.transaction_amount || 0),
      netAmount: paymentData.net_received_amount,
      fee: paymentData.fee_details?.[0]?.amount,
      status: paymentStatus,
      type: PaymentType.SAAS_FEE,
      method: this.mapPaymentMethod(paymentData.payment_method_id ?? ''),
      tenantId: tenant.id,
    });

    // Atualizar saasStatus com base no resultado do pagamento
    if (paymentStatus === PaymentStatus.FAILED) {
      await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: { saasStatus: SubscriptionStatus.PAST_DUE },
      });
      this.logger.warn(
        `SaaS payment failed for tenant ${tenant.id}, status set to PAST_DUE`,
      );
    } else if (paymentStatus === PaymentStatus.APPROVED) {
      await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: { saasStatus: SubscriptionStatus.ACTIVE },
      });
      this.logger.log(
        `SaaS payment approved for tenant ${tenant.id}, status set to ACTIVE`,
      );
    }

    this.logger.log(`Created SAAS_FEE payment for tenant ${tenant.id}`);
  }

  /**
   * Cria um novo pagamento do tipo APPOINTMENT vinculado a um agendamento.
   */
  private async createAppointmentPayment(
    paymentData: MpPaymentData,
    paymentId: string,
    targetId: string,
  ) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: paymentData.external_reference! },
    });

    if (!appointment) {
      this.logger.warn(
        `Appointment ${paymentData.external_reference} not found for payment ${paymentId}`,
      );
      return;
    }

    const paymentStatus = this.mapStatus(paymentData.status!);
    const newPayment = await this.paymentRepo.create({
      externalId: paymentId,
      amount: Number(paymentData.transaction_amount || 0),
      netAmount: paymentData.net_received_amount,
      fee: paymentData.fee_details?.[0]?.amount,
      status: paymentStatus,
      type: PaymentType.APPOINTMENT,
      method: this.mapPaymentMethod(paymentData.payment_method_id ?? ''),
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

  private async handleSubscriptionNotification(
    preApprovalId: string,
    client: MercadoPagoConfig,
    targetId: string,
  ) {
    const preApproval = new PreApproval(client);
    const data = await preApproval.get({ id: preApprovalId });

    // Monitorar semáforo de saúde da assinatura (campo não tipado pelo SDK)
    const semaphore = (data as any).semaphore as string | undefined;
    if (semaphore && semaphore !== 'green') {
      this.logger.warn(
        `Subscription ${preApprovalId} semaphore is "${semaphore}" — ` +
          `status: ${data.status}, external_reference: ${data.external_reference}`,
      );
    }

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
        return SubscriptionStatus.ACTIVE;
      case 'paused':
      case 'pending':
        return SubscriptionStatus.PAST_DUE;
      case 'cancelled':
        return SubscriptionStatus.CANCELED;
      default:
        return SubscriptionStatus.PAST_DUE;
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
