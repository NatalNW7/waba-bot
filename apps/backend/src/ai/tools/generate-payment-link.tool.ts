import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentPreferenceService } from '../../payments/payment-preference.service';
import {
  ITool,
  ToolExecutionContext,
  ToolExecutionResult,
  ToolName,
  GeneratePaymentLinkArgs,
} from '../interfaces/tool.interface';
import { Tool } from '../interfaces/llm-provider.interface';

/**
 * Tool for generating a payment link after an appointment is booked.
 */
@Injectable()
export class GeneratePaymentLinkTool implements ITool {
  readonly name: ToolName = 'generate_payment_link';
  private readonly logger = new Logger(GeneratePaymentLinkTool.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentPreferenceService: PaymentPreferenceService,
  ) {}

  getDefinition(): Tool {
    return {
      name: this.name,
      description:
        'Gera um link de pagamento para um agendamento. Use IMEDIATAMENTE após o book_appointment retornar sucesso. Envie o link ao cliente para que ele realize o pagamento.',
      parameters: {
        type: 'object',
        properties: {
          appointmentId: {
            type: 'string',
            description: 'ID do agendamento retornado pelo book_appointment',
          },
        },
        required: ['appointmentId'],
      },
    };
  }

  async execute(
    args: Record<string, unknown>,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult> {
    const { appointmentId } = args as unknown as GeneratePaymentLinkArgs;

    try {
      if (!appointmentId) {
        return {
          success: false,
          error: 'ID do agendamento é obrigatório.',
        };
      }

      // Fetch appointment with all related data needed for payment
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          service: true,
          customer: true,
          tenant: true,
        },
      });

      if (!appointment) {
        return {
          success: false,
          error: 'Agendamento não encontrado.',
        };
      }

      // Validate appointment belongs to the current tenant and customer
      if (appointment.tenantId !== context.tenantId) {
        return {
          success: false,
          error: 'Agendamento não pertence a este estabelecimento.',
        };
      }

      if (appointment.customerId !== context.customerId) {
        return {
          success: false,
          error: 'Agendamento não pertence a este cliente.',
        };
      }

      // Check if payment link already exists
      if (appointment.paymentId) {
        return {
          success: false,
          error: 'Este agendamento já possui um pagamento associado.',
        };
      }

      if (!appointment.service) {
        return {
          success: false,
          error: 'Agendamento sem serviço associado.',
        };
      }

      // Generate payment link via PaymentPreferenceService
      const paymentResult =
        await this.paymentPreferenceService.createAppointmentPreference({
          id: appointment.id,
          tenantId: appointment.tenantId,
          price: Number(appointment.price),
          customerId: appointment.customerId,
          service: { name: appointment.service.name },
          customer: {
            email: appointment.customer.email,
            name: appointment.customer.name,
            phone: appointment.customer.phone,
          },
          tenant: {
            preferredPaymentProvider:
              appointment.tenant.preferredPaymentProvider,
            infinitePayTag: appointment.tenant.infinitePayTag,
          },
        });

      this.logger.log(
        `Payment link generated for appointment ${appointmentId}: ${paymentResult.initPoint}`,
      );

      return {
        success: true,
        data: {
          paymentUrl: paymentResult.initPoint,
          provider: paymentResult.provider,
          message: `💳 Link de pagamento gerado! Envie este link ao cliente para que ele realize o pagamento: ${paymentResult.initPoint}. O agendamento será confirmado automaticamente após o pagamento.`,
        },
      };
    } catch (error) {
      this.logger.error('Failed to generate payment link:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao gerar link de pagamento',
      };
    }
  }
}
