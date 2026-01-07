import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MercadoPagoConfig } from 'mercadopago';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MercadoPagoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns a Mercado Pago client configured with the platform's credentials.
   * Used for SaaS subscription payments (Tenants paying the platform).
   */
  getPlatformClient(): MercadoPagoConfig {
    const accessToken =
      process.env.MP_PLATFORM_ACCESS_TOKEN ||
      'TEST-7681122337146693-010219-8ac0901b520a70aa446467eff6ed64d7-257942709';

    if (!accessToken) {
      throw new Error(
        'Mercado Pago Platform Access Token is not configured. Please set MP_PLATFORM_ACCESS_TOKEN in .env',
      );
    }

    return new MercadoPagoConfig({
      accessToken,
    });
  }

  /**
   * Returns a Mercado Pago client configured with a specific Tenant's credentials.
   * Used for Customer payments (Customers paying the Tenant).
   */
  async getTenantClient(tenantId: string): Promise<MercadoPagoConfig> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { mpAccessToken: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    if (!tenant.mpAccessToken) {
      throw new BadRequestException(
        `Tenant with ID ${tenantId} does not have Mercado Pago credentials configured.`,
      );
    }

    return new MercadoPagoConfig({
      accessToken: tenant.mpAccessToken,
    });
  }
}
