import { Injectable } from '@nestjs/common';
import { DayOfWeek } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ITool,
  ToolExecutionContext,
  ToolExecutionResult,
  ToolName,
} from '../interfaces/tool.interface';
import { Tool } from '../interfaces/llm-provider.interface';

interface CheckAvailabilityArgs {
  date: string; // YYYY-MM-DD format
  serviceId?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

/**
 * Tool for checking available appointment slots for a tenant.
 */
@Injectable()
export class CheckAvailabilityTool implements ITool {
  readonly name: ToolName = 'check_availability';

  constructor(private readonly prisma: PrismaService) {}

  getDefinition(): Tool {
    return {
      name: this.name,
      description:
        'Verifica os horários disponíveis para agendamento. A data DEVE estar no formato YYYY-MM-DD (ex: 2026-01-27). Retorna horários livres e sugere alternativas se o horário pedido não estiver disponível.',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description:
              'Data para verificar disponibilidade no formato YYYY-MM-DD (ex: 2026-01-25)',
          },
          serviceId: {
            type: 'string',
            description:
              'ID do serviço (opcional). Se fornecido, considera a duração do serviço.',
          },
        },
        required: ['date'],
      },
    };
  }

  async execute(
    args: Record<string, unknown>,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult> {
    const { date, serviceId } = args as unknown as CheckAvailabilityArgs;

    try {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return {
          success: false,
          error: 'Formato de data inválido. Use YYYY-MM-DD (ex: 2026-01-25)',
        };
      }

      const requestedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (requestedDate < today) {
        return {
          success: false,
          error: 'Não é possível agendar para datas passadas.',
        };
      }

      // Get day of week
      const dayOfWeek = this.getDayOfWeek(requestedDate);

      // Get operating hours for this day
      const operatingHours = await this.prisma.operatingHour.findFirst({
        where: {
          tenantId: context.tenantId,
          day: dayOfWeek,
        },
      });

      if (!operatingHours || operatingHours.isClosed) {
        return {
          success: true,
          data: {
            date,
            dayOfWeek,
            isClosed: true,
            message: `Não há expediente neste dia (${this.getDayName(dayOfWeek)}).`,
            slots: [],
          },
        };
      }

      // Get service duration if serviceId provided
      let serviceDuration = 60; // Default 60 min
      if (serviceId) {
        const service = await this.prisma.service.findUnique({
          where: { id: serviceId },
        });
        if (service) {
          serviceDuration = service.duration;
        }
      }

      // Get existing appointments for this day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAppointments = await this.prisma.appointment.findMany({
        where: {
          tenantId: context.tenantId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
        },
        include: {
          service: true,
        },
        orderBy: {
          date: 'asc',
        },
      });

      // Generate available time slots
      const slots = this.generateTimeSlots(
        operatingHours.startTime,
        operatingHours.endTime,
        serviceDuration,
        existingAppointments,
        date,
      );

      const availableSlots = slots.filter((s) => s.available);

      return {
        success: true,
        data: {
          date,
          dayOfWeek,
          dayName: this.getDayName(dayOfWeek),
          operatingHours: `${operatingHours.startTime} às ${operatingHours.endTime}`,
          serviceDuration: `${serviceDuration} minutos`,
          availableSlots: availableSlots.map((s) => s.time),
          totalAvailable: availableSlots.length,
          message:
            availableSlots.length > 0
              ? `Encontrei ${availableSlots.length} horários disponíveis.`
              : 'Não há horários disponíveis nesta data.',
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao verificar disponibilidade',
      };
    }
  }

  private getDayOfWeek(date: Date): DayOfWeek {
    const days: DayOfWeek[] = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];
    return days[date.getDay()];
  }

  private getDayName(day: string): string {
    const names: Record<string, string> = {
      MONDAY: 'Segunda-feira',
      TUESDAY: 'Terça-feira',
      WEDNESDAY: 'Quarta-feira',
      THURSDAY: 'Quinta-feira',
      FRIDAY: 'Sexta-feira',
      SATURDAY: 'Sábado',
      SUNDAY: 'Domingo',
    };
    return names[day] || day;
  }

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    serviceDuration: number,
    existingAppointments: any[],
    date: string,
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    const endMinutes = endHour * 60 + endMin;

    while (currentHour * 60 + currentMin + serviceDuration <= endMinutes) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      const slotStart = new Date(`${date}T${timeStr}:00`);
      const slotEnd = new Date(
        slotStart.getTime() + serviceDuration * 60 * 1000,
      );

      // Check if this slot conflicts with any existing appointment
      const hasConflict = existingAppointments.some((apt) => {
        const aptStart = new Date(apt.date);
        const aptDuration = apt.service?.duration || 60;
        const aptEnd = new Date(aptStart.getTime() + aptDuration * 60 * 1000);

        // Check for overlap
        return slotStart < aptEnd && slotEnd > aptStart;
      });

      slots.push({
        time: timeStr,
        available: !hasConflict,
      });

      // Move to next slot (30 min intervals)
      currentMin += 30;
      if (currentMin >= 60) {
        currentHour += 1;
        currentMin = currentMin - 60;
      }
    }

    return slots;
  }
}
