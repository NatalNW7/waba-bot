import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoService } from './mercadopago.service';
import { Preference } from 'mercadopago';
import { PaymentRepository } from './payment-repository.service';
import { InfinitePayService } from './infinite-pay.service';
import { PaymentProvider } from '@prisma/client';

interface AppointmentWithDetails {
  id: string;
  tenantId: string;
  price: number;
  customerId: string; // Ensure this is selected in query or mapped
  service: { name: string };
  customer: {
    email?: string | null;
    name?: string | null;
    phone?: string | null;
  };
  tenant: {
    preferredPaymentProvider?: PaymentProvider | null;
    infinitePayTag?: string | null;
  };
}

@Injectable()
export class PaymentPreferenceService {
  constructor(
    private readonly mpService: MercadoPagoService,
    private readonly paymentRepo: PaymentRepository,
    private readonly infinitePayService: InfinitePayService,
    private readonly configService: ConfigService,
  ) {}

  async createAppointmentPreference(appointment: AppointmentWithDetails) {
    if (!appointment.service) {
      throw new BadRequestException('Appointment must have a service assigned');
    }

    if (
      appointment.tenant.preferredPaymentProvider === 'INFINITE_PAY' &&
      appointment.tenant.infinitePayTag
    ) {
      return this.createInfinitePayLink(appointment);
    }

    return this.createMercadoPagoPreference(appointment);
  }

  private async createInfinitePayLink(appointment: AppointmentWithDetails) {
    // 1. Create a PENDING payment to generate the UUID (order_nsu)
    const payment = await this.paymentRepo.create({
      tenantId: appointment.tenantId,
      amount: Number(appointment.price),
      type: 'APPOINTMENT',
      status: 'PENDING',
      // method: method is now optional and will be set on webhook
      customerId: appointment.customerId,
    });

    // Link payment to appointment
    // Use the returned payment.id as order_nsu.

    const linkData = await this.infinitePayService.createCheckoutLink({
      handle: appointment.tenant.infinitePayTag!,
      amount: Number(appointment.price) * 100, // Cents
      order_nsu: payment.id,
      webhook_url: `${this.configService.get('API_URL')}/webhooks/infinitepay/${appointment.tenantId}`,
      description: appointment.service.name,
      customer: {
        name: appointment.customer.name,
        email: appointment.customer.email,
        phone_number: appointment.customer.phone,
      },
    });

    return {
      initPoint: linkData.url, // Adjust based on actual API response
      paymentId: payment.id,
      provider: 'INFINITE_PAY',
    };
  }

  private async createMercadoPagoPreference(
    appointment: AppointmentWithDetails,
  ) {
    const client = await this.mpService.getTenantClient(appointment.tenantId);
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: appointment.id,
            title: appointment.service.name,
            quantity: 1,
            unit_price: Number(appointment.price),
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: appointment.customer.email ?? undefined,
          name: appointment.customer.name ?? undefined,
        },
        back_urls: {
          success: this.configService.get('MP_SUCCESS_URL'),
          failure: this.configService.get('MP_FAILURE_URL'),
          pending: this.configService.get('MP_PENDING_URL'),
        },
        auto_return: 'approved',
        external_reference: appointment.id,
        notification_url: this.configService.get('MP_WEBHOOK_URL'),
      },
    });

    return {
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
      preferenceId: result.id,
      provider: 'MERCADO_PAGO',
    };
  }
}
