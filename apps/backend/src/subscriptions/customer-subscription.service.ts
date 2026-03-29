import { Injectable, BadRequestException } from '@nestjs/common';
import { MercadoPagoService } from '../payments/mercadopago.service';
import { PreApproval } from 'mercadopago';

@Injectable()
export class CustomerSubscriptionService {
  constructor(private readonly mpService: MercadoPagoService) {}

  async createMpSubscription(options: {
    tenantId: string;
    plan: { name: string; price: number | string; interval: string };
    customer: { id: string; email: string | null | undefined };
    cardTokenId: string;
  }) {
    const { tenantId, plan, customer, cardTokenId } = options;

    if (!customer.email) {
      throw new BadRequestException(
        'O email do cliente é obrigatório para criar uma assinatura no Mercado Pago.',
      );
    }

    const client = await this.mpService.getTenantClient(tenantId);
    const preApproval = new PreApproval(client);

    return preApproval.create({
      body: {
        reason: `Assinatura - ${plan.name}`,
        auto_recurring: {
          frequency: 1,
          frequency_type:
            plan.interval === 'MONTHLY'
              ? 'months'
              : plan.interval === 'QUARTERLY'
                ? 'months'
                : 'years',
          transaction_amount: Number(plan.price),
          currency_id: 'BRL',
        },
        payer_email: customer.email,
        card_token_id: cardTokenId,
        status: 'authorized',
        external_reference: customer.id,
      },
    });
  }
}
