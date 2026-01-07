import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { MercadoPagoService } from './mercadopago.service';
import { PaymentRepository } from './payment-repository.service';
import { PaymentPreferenceService } from './payment-preference.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mpService: MercadoPagoService,
    private readonly repo: PaymentRepository,
    private readonly preferenceService: PaymentPreferenceService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const { tenantId, customerId, subscriptionId } = createPaymentDto;

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    if (customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${customerId} not found`);
      }
    }

    if (subscriptionId) {
      const subscription = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
      });
      if (!subscription) {
        throw new NotFoundException(
          `Subscription with ID ${subscriptionId} not found`,
        );
      }
    }

    return this.repo.create(createPaymentDto);
  }

  async createAppointmentPayment(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: true,
        customer: true,
        tenant: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.preferenceService.createAppointmentPreference(
      appointment as any,
    );
  }

  findAll() {
    return this.repo.findAll();
  }

  findOne(id: string) {
    return this.repo.findUnique({
      where: { id },
    });
  }

  update(id: string, updatePaymentDto: UpdatePaymentDto) {
    return this.repo.update(id, updatePaymentDto);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
