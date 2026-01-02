import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    const { tenantId, customerId, date, paymentId } = createAppointmentDto;
    const appointmentDate = new Date(date);

    // 1. Check if date is in the past
    if (appointmentDate < new Date()) {
      throw new BadRequestException('The appointment date is in the past.');
    }

    // 2. Validate Related Entities (Tenant, Customer, Service, Subscription)
    await this.validateRelatedEntities(createAppointmentDto);

    // 3. Payment ID validation (existence only, status checked on update/confirmation)
    if (paymentId) {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
      });
      if (!payment) {
        throw new BadRequestException('The provided paymentId does not exist.');
      }
    }

    // 4. Operating Hours Check
    await this.validateOperatingHours(tenantId, appointmentDate);

    // 5. Conflict Check (Same date/time for same tenant)
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        tenantId,
        date: appointmentDate,
      },
    });
    if (existingAppointment) {
      throw new BadRequestException(
        'Already exists an appointment in the chosen date.',
      );
    }

    // 6. Create Appointment and TenantCustomer relation in a transaction
    return this.prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({
        data: createAppointmentDto,
      });

      // Ensure TenantCustomer relation exists
      const link = await tx.tenantCustomer.findUnique({
        where: {
          tenantId_customerId: {
            tenantId,
            customerId,
          },
        },
      });

      if (!link) {
        await tx.tenantCustomer.create({
          data: {
            tenantId,
            customerId,
          },
        });
      }

      return appointment;
    });
  }

  findAll() {
    return this.prisma.appointment.findMany();
  }

  findOne(id: string) {
    return this.prisma.appointment.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const { status, paymentId } = updateAppointmentDto;

    // 1. Validate Related Entities
    await this.validateRelatedEntities(updateAppointmentDto);

    // 2. If status is changing to CONFIRMED, check payment
    if (status === 'CONFIRMED') {
      // Find the appointment to get its paymentId if not provided in DTO
      const current = await this.prisma.appointment.findUnique({
        where: { id },
      });

      const effectivePaymentId = paymentId || current?.paymentId;

      if (!effectivePaymentId) {
        throw new BadRequestException(
          'An appointment cannot be confirmed without an associated payment.',
        );
      }

      const payment = await this.prisma.payment.findUnique({
        where: { id: effectivePaymentId },
      });

      if (!payment || payment.status !== 'APPROVED') {
        throw new BadRequestException(
          'The appointment can only be confirmed if the payment is approved.',
        );
      }
    }

    return this.prisma.appointment.update({
      where: { id },
      data: updateAppointmentDto,
    });
  }

  async checkPendingAppointments() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const stalePending = await this.prisma.appointment.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: oneHourAgo,
        },
      },
      include: {
        payment: true,
      },
    });

    for (const appointment of stalePending) {
      if (!appointment.payment || appointment.payment.status !== 'APPROVED') {
        await this.prisma.appointment.update({
          where: { id: appointment.id },
          data: {
            status: 'CANCELED',
            cancellationReason: 'payment not failed',
          },
        });
      }
    }
  }

  remove(id: string) {
    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  private async validateOperatingHours(tenantId: string, date: Date) {
    const dayOfWeekMap: Record<number, string> = {
      0: 'SUNDAY',
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY',
    };

    const dayName = dayOfWeekMap[date.getUTCDay()];
    const operatingHour = await this.prisma.operatingHour.findFirst({
      where: {
        tenantId,
        day: dayName as any,
      },
    });

    if (!operatingHour || operatingHour.isClosed) {
      throw new BadRequestException(
        'The business is closed on the chosen date.',
      );
    }

    const appointmentTime =
      date.getUTCHours().toString().padStart(2, '0') +
      ':' +
      date.getUTCMinutes().toString().padStart(2, '0');

    if (
      appointmentTime < operatingHour.startTime ||
      appointmentTime > operatingHour.endTime
    ) {
      throw new BadRequestException(
        'The chosen time is outside of operating hours.',
      );
    }
  }

  private async validateRelatedEntities(
    dto: CreateAppointmentDto | UpdateAppointmentDto,
  ) {
    // 1. Validate Tenant
    if (dto.tenantId) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: dto.tenantId },
      });
      if (!tenant) {
        throw new BadRequestException('The provided tenantId does not exist.');
      }
    }

    // 2. Validate Customer
    if (dto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new BadRequestException(
          'The provided customerId does not exist.',
        );
      }
    }

    // 3. Validate Service
    if (dto.serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: dto.serviceId },
      });
      if (!service) {
        throw new BadRequestException('The provided serviceId does not exist.');
      }
    }

    // 4. Validate Payment
    if (dto.paymentId) {
      const payment = await this.prisma.payment.findUnique({
        where: { id: dto.paymentId },
      });
      if (!payment) {
        throw new BadRequestException(
          'The provided paymentId does not exist. Ensure you are providing the internal database payment ID (UUID), not the external provider ID.',
        );
      }
    }

    // 5. Validate Subscription
    if (dto.usedSubscriptionId) {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id: dto.usedSubscriptionId },
        include: { tenantCustomer: true },
      });
      if (!subscription) {
        throw new BadRequestException(
          'The provided usedSubscriptionId does not exist.',
        );
      }

      // Ensure the subscription belongs to the provided Tenant and Customer
      if (dto.tenantId && dto.customerId) {
        if (
          subscription.tenantCustomer.tenantId !== dto.tenantId ||
          subscription.tenantCustomer.customerId !== dto.customerId
        ) {
          throw new BadRequestException(
            'The provided subscription does not belong to the specified Tenant and Customer.',
          );
        }
      }
    }
  }
}
