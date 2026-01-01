import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    await this.validateRelatedEntities(createAppointmentDto);

    return this.prisma.appointment.create({
      data: createAppointmentDto,
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
    await this.validateRelatedEntities(updateAppointmentDto);

    return this.prisma.appointment.update({
      where: { id },
      data: updateAppointmentDto,
    });
  }

  remove(id: string) {
    return this.prisma.appointment.delete({
      where: { id },
    });
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
        throw new BadRequestException('The provided customerId does not exist.');
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
      });
      if (!subscription) {
        throw new BadRequestException(
          'The provided usedSubscriptionId does not exist.',
        );
      }
    }
  }
}
