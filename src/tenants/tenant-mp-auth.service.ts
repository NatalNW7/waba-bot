import { Injectable, BadRequestException } from '@nestjs/common';
import { MercadoPagoService } from '../payments/mercadopago.service';
import { TenantRepository } from './tenant-repository.service';
import { OAuth } from 'mercadopago';

@Injectable()
export class TenantMpAuthService {
  constructor(
    private readonly repo: TenantRepository,
    private readonly mpService: MercadoPagoService,
  ) {}

  getMpAuthorizationUrl(tenantId: string) {
    const clientId = process.env.MP_CLIENT_ID;
    const redirectUri = process.env.MP_REDIRECT_URI;

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
    const clientId = process.env.MP_CLIENT_ID;
    const clientSecret = process.env.MP_CLIENT_SECRET;
    const redirectUri = process.env.MP_REDIRECT_URI;

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
        },
      });

      return this.repo.update(tenantId, {
        mpAccessToken: result.access_token,
        mpPublicKey: result.public_key,
        mpRefToken: result.refresh_token,
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to exchange Mercado Pago code: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
