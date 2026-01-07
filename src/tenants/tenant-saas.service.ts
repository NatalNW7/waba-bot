import { Injectable, NotFoundException } from '@nestjs/common';
import { MercadoPagoService } from '../payments/mercadopago.service';
import { TenantRepository } from './tenant-repository.service';
import { PreApproval } from 'mercadopago';

interface TenantWithSaasPlan {
  id: string;
  email: string;
  saasPlan: {
    name: string;
    price: number | string;
  };
}

@Injectable()
export class TenantSaasService {
  constructor(
    private readonly repo: TenantRepository,
    private readonly mpService: MercadoPagoService,
  ) {}

  async createSubscription(id: string) {
    const tenant = (await this.repo.findUnique({
      where: { id },
      include: { saasPlan: true },
    })) as TenantWithSaasPlan | null;

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found.`);
    }

    const client = this.mpService.getPlatformClient();
    const preApproval = new PreApproval(client);

    const result = await preApproval.create({
      body: {
        reason: `Assinatura SaaS - ${tenant.saasPlan.name}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: Number(tenant.saasPlan.price),
          currency_id: 'BRL',
        },
        back_url: process.env.MP_BACK_URL || 'https://example.com',
        payer_email: tenant.email,
        external_reference: tenant.id,
      },
    });

    return {
      initPoint: result.init_point,
      externalId: result.id,
    };
  }
}
