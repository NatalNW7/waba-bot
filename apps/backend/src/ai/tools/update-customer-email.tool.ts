import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ITool,
  ToolExecutionContext,
  ToolExecutionResult,
  ToolName,
  UpdateCustomerEmailArgs,
} from '../interfaces/tool.interface';
import { Tool } from '../interfaces/llm-provider.interface';

/**
 * Tool for updating a customer's email address.
 * Used when the AI needs to collect email before booking.
 */
@Injectable()
export class UpdateCustomerEmailTool implements ITool {
  readonly name: ToolName = 'update_customer_email';
  private readonly logger = new Logger(UpdateCustomerEmailTool.name);

  constructor(private readonly prisma: PrismaService) {}

  getDefinition(): Tool {
    return {
      name: this.name,
      description:
        'Atualiza o email do cliente. Use quando o cliente fornecer o email. O email é OBRIGATÓRIO antes de realizar qualquer agendamento.',
      parameters: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'Email do cliente (ex: cliente@email.com)',
          },
        },
        required: ['email'],
      },
    };
  }

  async execute(
    args: Record<string, unknown>,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult> {
    const { email } = args as unknown as UpdateCustomerEmailArgs;

    try {
      // Validate email
      if (!email) {
        return {
          success: false,
          error: 'Email é obrigatório.',
        };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error:
            'Formato de email inválido. Peça ao cliente para verificar o email.',
        };
      }

      // Check if customer exists
      const customer = await this.prisma.customer.findUnique({
        where: { id: context.customerId },
      });

      if (!customer) {
        return {
          success: false,
          error: 'Cliente não encontrado.',
        };
      }

      // Check if email is already in use by another customer
      const existingCustomer = await this.prisma.customer.findFirst({
        where: {
          email: email.toLowerCase().trim(),
          id: { not: context.customerId },
        },
      });

      if (existingCustomer) {
        return {
          success: false,
          error:
            'Este email já está em uso por outro cliente. Peça um email diferente.',
        };
      }

      // Update customer email
      await this.prisma.customer.update({
        where: { id: context.customerId },
        data: { email: email.toLowerCase().trim() },
      });

      this.logger.log(
        `Updated email for customer ${context.customerId}: ${email}`,
      );

      return {
        success: true,
        data: {
          email: email.toLowerCase().trim(),
          message: `✅ Email ${email} salvo com sucesso! Agora posso prosseguir com o agendamento.`,
        },
      };
    } catch (error) {
      this.logger.error('Failed to update customer email:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao atualizar email do cliente',
      };
    }
  }
}
