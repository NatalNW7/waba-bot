import { Injectable, BadRequestException } from '@nestjs/common';
import { MercadoPagoService } from './mercadopago.service';
import { Preference } from 'mercadopago';

interface AppointmentWithDetails {
  id: string;
  tenantId: string;
  price: number;
  service: { name: string };
  customer: { email?: string | null; name?: string | null };
}

@Injectable()
export class PaymentPreferenceService {
  constructor(private readonly mpService: MercadoPagoService) {}

  async createAppointmentPreference(appointment: AppointmentWithDetails) {
    if (!appointment.service) {
      throw new BadRequestException('Appointment must have a service assigned');
    }

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
          success: process.env.MP_SUCCESS_URL || 'https://example.com/success',
          failure: process.env.MP_FAILURE_URL || 'https://example.com/failure',
          pending: process.env.MP_PENDING_URL || 'https://example.com/pending',
        },
        auto_return: 'approved',
        external_reference: appointment.id,
        notification_url: process.env.MP_WEBHOOK_URL,
      },
    });

    return {
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
      preferenceId: result.id,
    };
  }
}
