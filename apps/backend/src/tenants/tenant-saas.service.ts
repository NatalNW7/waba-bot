import { Injectable, NotFoundException } from '@nestjs/common';
import { MercadoPagoService } from '../payments/mercadopago.service';
import { TenantRepository } from './tenant-repository.service';
import { PreApproval } from 'mercadopago';
import { PaymentInterval } from '@prisma/client';

interface TenantWithSaasPlan {
  id: string;
  email: string;
  saasPlan: {
    name: string;
    price: number | string;
    interval: PaymentInterval;
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

    // Map PaymentInterval to Mercado Pago frequency
    const freq = this.getFrequencyConfig(tenant.saasPlan.interval);

    const result = await preApproval.create({
      body: {
        reason: `Assinatura SaaS - ${tenant.saasPlan.name}`,
        auto_recurring: {
          frequency: freq.frequency,
          frequency_type: freq.frequencyType,
          transaction_amount: Number(tenant.saasPlan.price),
          currency_id: 'BRL',
        },
        back_url: process.env.MP_BACK_URL || 'https://example.com',
        payer_email: tenant.email,
        external_reference: tenant.id,
      },
    });

    // Calculate and update next billing date based on plan interval
    const nextBilling = this.calculateNextBilling(tenant.saasPlan.interval);
    await this.repo.update(tenant.id, {
      saasNextBilling: nextBilling,
    });

    return {
      initPoint: result.init_point,
      externalId: result.id,
    };
  }

  private getFrequencyConfig(interval: PaymentInterval): {
    frequency: number;
    frequencyType: 'months' | 'days';
  } {
    switch (interval) {
      case 'QUARTERLY':
        return { frequency: 3, frequencyType: 'months' };
      case 'YEARLY':
        return { frequency: 12, frequencyType: 'months' };
      case 'MONTHLY':
      default:
        return { frequency: 1, frequencyType: 'months' };
    }
  }

  calculateNextBilling(interval: PaymentInterval): Date {
    const now = new Date();
    switch (interval) {
      case 'QUARTERLY':
        return new Date(now.setMonth(now.getMonth() + 3));
      case 'YEARLY':
        return new Date(now.setFullYear(now.getFullYear() + 1));
      case 'MONTHLY':
      default:
        return new Date(now.setMonth(now.getMonth() + 1));
    }
  }
}
