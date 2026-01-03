import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentRepository } from './appointment-repository.service';
import { RelatedEntitiesValidator } from './related-entities-validator.service';
import { AppointmentOperatingHoursValidator } from './appointment-operating-hours.service';
import {
  SchedulingService,
  DEFAULT_SERVICE_DURATION_MINUTES,
} from './scheduling.service';
import { AppointmentPaymentValidator } from './appointment-payment.service';
import { TenantCustomerService } from './tenant-customer.service';
import { DateTimeUtils } from './utils/date-time.utils';
import { AppointmentStatus, Prisma } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly repo: AppointmentRepository,
    private readonly validator: RelatedEntitiesValidator,
    private readonly operatingHours: AppointmentOperatingHoursValidator,
    private readonly scheduling: SchedulingService,
    private readonly paymentService: AppointmentPaymentValidator,
    private readonly tenantCustomerService: TenantCustomerService,
  ) {}

  async create(dto: CreateAppointmentDto) {
    const dateUtc = DateTimeUtils.toUtcDate(dto.date);

    // 1. Check if date is in the past
    if (dateUtc < DateTimeUtils.now()) {
      throw new BadRequestException('The appointment date is in the past.');
    }

    // 2. Ensure at least one of serviceId or usedSubscriptionId is provided
    if (!dto.serviceId && !dto.usedSubscriptionId) {
      throw new BadRequestException(
        'At least one of serviceId or usedSubscriptionId must be provided.',
      );
    }

    // 3. Validate Related Entities
    const related = await this.validator.validateForCreate(dto);
    const { service, subscription } = related;

    // 4. Determine Price
    const price = this.determinePrice(dto.price, subscription, service);

    // 5. Determine Status based on Payment
    const status = await this.determineStatus(dto.paymentId);

    // 6. Operating Hours Check
    await this.operatingHours.assertWithinOperatingHours(dto.tenantId, dateUtc);

    // 7. Conflict Check
    const durationMinutes =
      service?.duration || DEFAULT_SERVICE_DURATION_MINUTES;
    await this.scheduling.assertNoConflict(
      dto.tenantId,
      dateUtc,
      durationMinutes,
    );

    // 8. Create Appointment and TenantCustomer link in a transaction
    const appointmentData: Prisma.AppointmentUncheckedCreateInput = {
      date: dateUtc,
      status: status as AppointmentStatus,
      price,
      tenantId: dto.tenantId,
      customerId: dto.customerId,
      serviceId: dto.serviceId,
      usedSubscriptionId: dto.usedSubscriptionId,
      paymentId: dto.paymentId,
      externalEventId: dto.externalEventId,
    };

    return this.repo.withTransaction(async (tx) => {
      const appointment = await this.repo.create(appointmentData, tx);
      await this.tenantCustomerService.ensureTenantCustomerLink(
        tx,
        dto.tenantId,
        dto.customerId,
      );
      return appointment;
    });
  }

  findAll() {
    return this.repo.findMany({});
  }

  findOne(id: string) {
    return this.repo.findOne(id);
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    // 1. Validate Related Entities
    await this.validator.validateForUpdate(dto);

    // 2. If status is changing to CONFIRMED, check payment
    if (dto.status === 'CONFIRMED') {
      await this.validatePaymentForConfirmation(id, dto.paymentId);
    }

    // 3. Conflict Check if date or service is changing
    if (dto.date || dto.serviceId) {
      await this.validateConflictOnUpdate(id, dto);
    }

    return this.repo.update(id, dto);
  }

  async checkPendingAppointments() {
    const oneHourAgo = new Date(DateTimeUtils.now().getTime() - 60 * 60 * 1000);
    const stalePending = await this.repo.findStalePending(oneHourAgo);

    for (const appointment of stalePending) {
      if (!appointment.payment || appointment.payment.status !== 'APPROVED') {
        this.logger.debug(
          `Canceling stale pending appointment ${appointment.id}`,
        );
        await this.repo.update(appointment.id, {
          status: 'CANCELED',
          cancellationReason: 'payment not approved',
        });
      }
    }
  }

  remove(id: string) {
    return this.repo.remove(id);
  }

  private determinePrice(
    dtoPrice: number | undefined | null,
    subscription: any,
    service: any,
  ): number {
    if (dtoPrice !== undefined && dtoPrice !== null) {
      return dtoPrice;
    }

    if (subscription) {
      return 0;
    }

    if (service) {
      return Number(service.price);
    }

    throw new BadRequestException('Price could not be determined.');
  }

  private async determineStatus(paymentId?: string): Promise<string> {
    if (paymentId) {
      const isApproved = await this.paymentService.isPaymentApproved(paymentId);
      if (isApproved) {
        this.logger.debug(
          `Payment ${paymentId} is approved. Setting status to CONFIRMED.`,
        );
        return 'CONFIRMED';
      }
    }
    return 'PENDING';
  }

  private async validatePaymentForConfirmation(
    id: string,
    dtoPaymentId?: string,
  ) {
    const current = await this.repo.findOne(id);
    const effectivePaymentId = dtoPaymentId || current?.paymentId;

    if (!effectivePaymentId) {
      throw new BadRequestException(
        'An appointment cannot be confirmed without an associated payment.',
      );
    }

    const isApproved =
      await this.paymentService.isPaymentApproved(effectivePaymentId);
    if (!isApproved) {
      throw new BadRequestException(
        'The appointment can only be confirmed if the payment is approved.',
      );
    }
  }

  private async validateConflictOnUpdate(
    id: string,
    dto: UpdateAppointmentDto,
  ) {
    const current = (await this.repo.findOne(id, { service: true })) as any;
    if (!current) return;

    const date = dto.date ? DateTimeUtils.toUtcDate(dto.date) : current.date;

    let duration =
      current.service?.duration || DEFAULT_SERVICE_DURATION_MINUTES;
    if (dto.serviceId && dto.serviceId !== current.serviceId) {
      const newService = await this.validator.validateForUpdate({
        serviceId: dto.serviceId,
      } as any);
      duration =
        newService.service?.duration || DEFAULT_SERVICE_DURATION_MINUTES;
    }

    await this.scheduling.assertNoConflict(
      dto.tenantId || current.tenantId,
      date,
      duration,
      id,
    );
  }
}
