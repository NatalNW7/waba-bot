import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentRepository } from './appointment-repository.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

import { Prisma } from '@prisma/client';

interface RelatedEntities {
  tenant?: Prisma.TenantGetPayload<{}> | null;
  customer?: Prisma.CustomerGetPayload<{}> | null;
  service?: Prisma.ServiceGetPayload<{}> | null;
  subscription?: Prisma.SubscriptionGetPayload<{
    include: { tenantCustomer: true };
  }> | null;
  payment?: Prisma.PaymentGetPayload<{}> | null;
}

@Injectable()
export class RelatedEntitiesValidator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: AppointmentRepository,
  ) {}

  async validateForCreate(dto: CreateAppointmentDto): Promise<RelatedEntities> {
    const entities = await this.fetchAndValidateBase(dto);

    if (dto.usedSubscriptionId) {
      await this.validateSubscriptionUsage(entities.subscription);
    }

    if (dto.paymentId) {
      await this.validatePaymentNotDuplicate(dto.paymentId, (dto as any).id);
    }

    return entities;
  }

  async validateForUpdate(dto: UpdateAppointmentDto): Promise<RelatedEntities> {
    const entities = await this.fetchAndValidateBase(dto);

    if (dto.usedSubscriptionId) {
      await this.validateSubscriptionUsage(entities.subscription);
    }

    if (dto.paymentId) {
      await this.validatePaymentNotDuplicate(dto.paymentId, (dto as any).id);
    }

    return entities;
  }

  private async fetchAndValidateBase(
    dto: CreateAppointmentDto | UpdateAppointmentDto,
  ): Promise<RelatedEntities> {
    let tenant: RelatedEntities['tenant'] = null;
    let customer: RelatedEntities['customer'] = null;
    let service: RelatedEntities['service'] = null;
    let subscription: RelatedEntities['subscription'] = null;
    let payment: RelatedEntities['payment'] = null;

    if (dto.tenantId) {
      tenant = await this.prisma.tenant.findUnique({
        where: { id: dto.tenantId },
      });
      if (!tenant) {
        throw new BadRequestException('The provided tenantId does not exist.');
      }
    }

    if (dto.customerId) {
      customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new BadRequestException(
          'The provided customerId does not exist.',
        );
      }
    }

    if (dto.serviceId) {
      service = await this.prisma.service.findUnique({
        where: { id: dto.serviceId },
      });
      if (!service) {
        throw new BadRequestException('The provided serviceId does not exist.');
      }
    }

    if (dto.paymentId) {
      payment = await this.prisma.payment.findUnique({
        where: { id: dto.paymentId },
      });
      if (!payment) {
        throw new BadRequestException(
          'The provided paymentId does not exist. Ensure you are providing the internal database payment ID (UUID), not the external provider ID.',
        );
      }
    }

    if (dto.usedSubscriptionId) {
      subscription = await this.prisma.subscription.findUnique({
        where: { id: dto.usedSubscriptionId },
        include: { tenantCustomer: true },
      });
      if (!subscription) {
        throw new BadRequestException(
          'The provided usedSubscriptionId does not exist.',
        );
      }

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

    return { tenant, customer, service, subscription, payment };
  }

  private async validatePaymentNotDuplicate(
    paymentId: string,
    appointmentId?: string,
  ) {
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: { paymentId },
    });
    if (existingAppointment && existingAppointment.id !== appointmentId) {
      throw new BadRequestException(
        'The provided paymentId is already associated with another appointment.',
      );
    }
  }

  private async validateSubscriptionUsage(subscription: any) {
    if (subscription.status !== 'ACTIVE') {
      throw new BadRequestException('The subscription is not active.');
    }

    const plan = await this.prisma.plan.findUnique({
      where: { id: subscription.planId },
    });

    if (!plan) {
      throw new BadRequestException('Associated plan not found.');
    }

    if (plan.maxAppointments > -1) {
      const nextBilling = new Date(subscription.nextBilling);
      const startOfCycle = new Date(nextBilling);

      switch (plan.interval) {
        case 'MONTHLY':
          startOfCycle.setMonth(startOfCycle.getMonth() - 1);
          break;
        case 'QUARTERLY':
          startOfCycle.setMonth(startOfCycle.getMonth() - 3);
          break;
        case 'YEARLY':
          startOfCycle.setFullYear(startOfCycle.getFullYear() - 1);
          break;
      }

      const usageCount = await this.repo.countSubscriptionUsage(
        subscription.id,
        startOfCycle,
        nextBilling,
      );

      if (usageCount >= plan.maxAppointments) {
        throw new BadRequestException(
          `You have reached the limit of ${plan.maxAppointments} appointments for this cycle.`,
        );
      }
    }
  }
}
