import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from '@prisma/client';

/**
 * Tenant entity representing a WhatsApp Business account holder
 */
export class TenantEntity {
  /** Unique identifier */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  /** Business name */
  @ApiProperty({ example: 'My Barber Shop' })
  name: string;

  /** WhatsApp Business Account ID */
  @ApiProperty({ example: 'waba_123456789' })
  wabaId: string;

  /** WhatsApp phone number ID */
  @ApiProperty({ example: 'phone_987654321' })
  phoneId: string;

  /** Meta API access token */
  @ApiProperty({ example: 'EAAG...' })
  accessToken: string;

  /** Business email address */
  @ApiProperty({ example: 'contact@barbershop.com' })
  email: string;

  /** Contact phone number */
  @ApiProperty({ example: '+5511999999999', required: false })
  phone?: string;

  /** Mercado Pago Access Token */
  @ApiProperty({ example: 'APP_USR-...', required: false })
  mpAccessToken?: string;

  /** Mercado Pago Public Key */
  @ApiProperty({ example: 'APP_USR-...', required: false })
  mpPublicKey?: string;

  /** Mercado Pago Refresh Token */
  @ApiProperty({ example: 'TG-...', required: false })
  mpRefToken?: string;

  /** SaaS subscription status */
  @ApiProperty({ enum: SubscriptionStatus, example: 'ACTIVE' })
  saasStatus: SubscriptionStatus;

  /** Next SaaS billing date */
  @ApiProperty({ example: '2025-01-31T00:00:00Z', required: false })
  saasNextBilling?: Date;

  /** SaaS payment method ID */
  @ApiProperty({ example: 'pm_123', required: false })
  saasPaymentMethodId?: string;

  /** SaaS Plan ID */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440003', required: false })
  saasPlanId?: string;

  /** Creation timestamp */
  @ApiProperty()
  createdAt: Date;

  /** Last update timestamp */
  @ApiProperty()
  updatedAt: Date;
}
