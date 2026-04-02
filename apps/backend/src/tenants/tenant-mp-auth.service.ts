import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoService } from '../payments/mercadopago.service';
import { TenantRepository } from './tenant-repository.service';
import { OAuth } from 'mercadopago';

@Injectable()
export class TenantMpAuthService {
  constructor(
    private readonly repo: TenantRepository,
    private readonly mpService: MercadoPagoService,
    private readonly configService: ConfigService,
  ) {}

  getMpAuthorizationUrl(tenantId: string) {
    const clientId = this.mpService.getClientId();
    const redirectUri = this.mpService.getRedirectUri();

    if (!clientId || !redirectUri) {
      throw new BadRequestException(
        'Mercado Pago OAuth Client ID or Redirect URI not configured.',
      );
    }

    return `https://auth.mercadopago.com/authorization?client_id=${clientId}&response_type=code&platform_id=mp&state=${tenantId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}`;
  }

  async exchangeMpCode(code: string, tenantId: string) {
    const clientId = this.mpService.getClientId();
    const clientSecret = this.mpService.getClientSecret();
    const redirectUri = this.mpService.getRedirectUri();

    const client = this.mpService.getPlatformClient();
    const oauth = new OAuth(client);

    try {
      const oauthTyped = oauth as {
        create: (args: { body: any }) => Promise<{
          access_token: string;
          public_key: string;
          refresh_token: string;
        }>;
      };

      const result = await oauthTyped.create({
        body: {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          test_token: this.configService.get('NODE_ENV') !== 'production',
        },
      });

      return this.repo.update(tenantId, {
        mpAccessToken: result.access_token,
        mpPublicKey: result.public_key,
        mpRefToken: result.refresh_token,
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to exchange Mercado Pago code: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async refreshTenantToken(tenantId: string): Promise<void> {
    const tenant = await this.repo.findUnique({
      where: { id: tenantId },
      select: { mpRefToken: true },
    });

    if (!tenant?.mpRefToken) {
      throw new BadRequestException(
        `Tenant ${tenantId} does not have a refresh token.`,
      );
    }

    const client = this.mpService.getPlatformClient();
    const oauth = new OAuth(client);

    try {
      const oauthTyped = oauth as {
        refresh: (args: { body: any }) => Promise<{
          access_token: string;
          refresh_token: string;
        }>;
      };

      const result = await oauthTyped.refresh({
        body: {
          client_id: this.mpService.getClientId(),
          client_secret: this.mpService.getClientSecret(),
          refresh_token: tenant.mpRefToken,
        },
      });

      await this.repo.update(tenantId, {
        mpAccessToken: result.access_token,
        mpRefToken: result.refresh_token,
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to refresh Mercado Pago token: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
