import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ITool,
  ToolExecutionContext,
  ToolExecutionResult,
  ToolName,
} from '../interfaces/tool.interface';
import { Tool } from '../interfaces/llm-provider.interface';

interface BookAppointmentArgs {
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

/**
 * Tool for booking an appointment.
 */
@Injectable()
export class BookAppointmentTool implements ITool {
  readonly name: ToolName = 'book_appointment';
  private readonly logger = new Logger(BookAppointmentTool.name);

  constructor(private readonly prisma: PrismaService) {}

  getDefinition(): Tool {
    return {
      name: this.name,
      description:
        'Agenda um horário para o cliente. A data DEVE estar no formato YYYY-MM-DD (ex: 2026-01-27) e o horário no formato HH:mm (ex: 15:00). Use SOMENTE após: 1) verificar disponibilidade com check_availability, 2) confirmar todos os dados com o cliente.',
      parameters: {
        type: 'object',
        properties: {
          serviceId: {
            type: 'string',
            description: 'ID do serviço a ser agendado',
          },
          date: {
            type: 'string',
            description:
              'Data do agendamento no formato YYYY-MM-DD (ex: 2026-01-25)',
          },
          time: {
            type: 'string',
            description: 'Horário do agendamento no formato HH:mm (ex: 14:30)',
          },
        },
        required: ['serviceId', 'date', 'time'],
      },
    };
  }

  async execute(
    args: Record<string, unknown>,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult> {
    const { serviceId, date, time } = args as unknown as BookAppointmentArgs;

    try {
      // Validate inputs
      if (!serviceId || !date || !time) {
        return {
          success: false,
          error: 'Dados incompletos. Preciso do serviço, data e horário.',
        };
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return {
          success: false,
          error: 'Formato de data inválido. Use YYYY-MM-DD.',
        };
      }

      // Validate time format
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(time)) {
        return {
          success: false,
          error: 'Formato de horário inválido. Use HH:mm.',
        };
      }

      // Check if customer has email (REQUIRED before booking)
      const customer = await this.prisma.customer.findUnique({
        where: { id: context.customerId },
        select: { email: true },
      });

      if (!customer?.email) {
        return {
          success: false,
          error:
            'O cliente ainda não tem email cadastrado. Peça o email ao cliente e use a ferramenta update_customer_email antes de agendar.',
        };
      }

      // Get the service
      const service = await this.prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service || service.tenantId !== context.tenantId) {
        return {
          success: false,
          error: 'Serviço não encontrado.',
        };
      }

      // Parse date and time
      const appointmentDateTime = new Date(`${date}T${time}:00`);
      const now = new Date();

      if (appointmentDateTime <= now) {
        return {
          success: false,
          error: 'Não é possível agendar para horários passados.',
        };
      }

      // Check for conflicting appointments
      const startOfSlot = appointmentDateTime;
      const endOfSlot = new Date(
        startOfSlot.getTime() + service.duration * 60 * 1000,
      );

      const conflictingAppointment = await this.prisma.appointment.findFirst({
        where: {
          tenantId: context.tenantId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          date: {
            gte: new Date(startOfSlot.getTime() - service.duration * 60 * 1000),
            lt: endOfSlot,
          },
        },
        include: {
          service: true,
        },
      });

      if (conflictingAppointment) {
        return {
          success: false,
          error: `Este horário não está disponível. Já existe um agendamento às ${new Date(conflictingAppointment.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`,
        };
      }

      // Create the appointment
      const appointment = await this.prisma.appointment.create({
        data: {
          date: appointmentDateTime,
          price: service.price,
          status: 'PENDING',
          tenantId: context.tenantId,
          customerId: context.customerId,
          serviceId: service.id,
        },
        include: {
          service: true,
          customer: true,
        },
      });

      this.logger.log(
        `Appointment created: ${appointment.id} for customer ${context.customerId}`,
      );

      return {
        success: true,
        data: {
          appointmentId: appointment.id,
          service: service.name,
          date: appointmentDateTime.toLocaleDateString('pt-BR'),
          time: appointmentDateTime.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          price: `R$ ${Number(service.price).toFixed(2)}`,
          status: 'PENDENTE',
          message: `✅ Agendamento realizado com sucesso! ${service.name} em ${appointmentDateTime.toLocaleDateString('pt-BR')} às ${time}. Valor: R$ ${Number(service.price).toFixed(2)}.`,
        },
      };
    } catch (error) {
      this.logger.error('Failed to book appointment:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao realizar agendamento',
      };
    }
  }
}
