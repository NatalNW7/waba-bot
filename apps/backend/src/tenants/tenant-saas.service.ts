import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoService } from '../payments/mercadopago.service';
import { TenantRepository } from './tenant-repository.service';
import { PrismaService } from '../prisma/prisma.service';
import { PreApproval, PreApprovalPlan } from 'mercadopago';
import { PaymentInterval } from '@prisma/client';

interface TenantWithSaasPlan {
  id: string;
  email: string;
  saasPlan: {
    id: string;
    name: string;
    price: number | string;
    interval: PaymentInterval;
    mpPlanId: string | null;
  };
}

@Injectable()
export class TenantSaasService {
  private readonly logger = new Logger(TenantSaasService.name);

  constructor(
    private readonly repo: TenantRepository,
    private readonly mpService: MercadoPagoService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Synchronize all SaaS plans with Mercado Pago.
   * For each SaasPlan without an `mpPlanId`, creates a preapproval_plan
   * via the Mercado Pago API and stores the returned ID.
   */
  async syncPlansWithMercadoPago(): Promise<void> {
    const plans = await this.prisma.saasPlan.findMany({
      where: { mpPlanId: null },
    });

    if (plans.length === 0) {
      this.logger.log('All SaaS plans already synced with Mercado Pago.');
      return;
    }

    const client = this.mpService.getPlatformClient();
    const preApprovalPlan = new PreApprovalPlan(client);

    const backUrl = this.configService.get<string>('MP_BACK_URL');
    if (!backUrl) {
      throw new BadRequestException(
        'MP_BACK_URL não está configurada. Defina a variável de ambiente MP_BACK_URL.',
      );
    }

    for (const plan of plans) {
      const freq = this.getFrequencyConfig(plan.interval);

      try {
        const result = await preApprovalPlan.create({
          body: {
            reason: `Assinatura SaaS - ${plan.name} (${plan.interval})`,
            auto_recurring: {
              frequency: freq.frequency,
              frequency_type: freq.frequencyType,
              transaction_amount: Number(plan.price),
              currency_id: 'BRL',
            },
            back_url: backUrl,
          },
        });

        await this.prisma.saasPlan.update({
          where: { id: plan.id },
          data: { mpPlanId: result.id },
        });

        this.logger.log(
          `Synced plan "${plan.name}" (${plan.interval}) → MP Plan ID: ${result.id}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync plan "${plan.name}" (${plan.interval}): ${error.message}`,
        );
        throw error;
      }
    }
  }

  async createSubscription(
    id: string,
    cardTokenId?: string,
    payerEmail?: string,
  ) {
    const tenant = (await this.repo.findUnique({
      where: { id },
      include: { saasPlan: true },
    })) as TenantWithSaasPlan | null;

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found.`);
    }

    if (!tenant.saasPlan.mpPlanId) {
      this.logger.log(
        'SaaS plan is not synced with Mercado Pago. Syncing now...',
      );
      await this.syncPlansWithMercadoPago();
      return this.createSubscription(id, cardTokenId, payerEmail);
    }

    const client = this.mpService.getPlatformClient();
    const preApproval = new PreApproval(client);

    const backUrl = this.configService.get<string>('MP_BACK_URL');
    if (!backUrl) {
      throw new BadRequestException(
        'MP_BACK_URL não está configurada. Defina a variável de ambiente MP_BACK_URL.',
      );
    }

    const body: any = {
      preapproval_plan_id: tenant.saasPlan.mpPlanId,
      reason: `Assinatura SaaS - ${tenant.saasPlan.name}`,
      back_url: backUrl,
      external_reference: tenant.id,
      status: cardTokenId ? 'authorized' : 'pending',
      payer_email: payerEmail,
    };

    if (cardTokenId) {
      body.card_token_id = cardTokenId;
    }

    const result = await preApproval.create({
      body,
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
