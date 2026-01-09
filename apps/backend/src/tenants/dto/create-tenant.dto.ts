import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { SubscriptionStatus } from '@prisma/client';

/**
 * Data required to create a new tenant (WhatsApp Business account holder)
 */
export class CreateTenantDto {
  /**
   * Business name
   * @example "My Barber Shop"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * WhatsApp Business Account ID from Meta
   * @example "waba_123456789"
   */
  @IsString()
  @IsOptional()
  wabaId?: string;

  /**
   * WhatsApp phone number ID from Meta
   * @example "phone_987654321"
   */
  @IsString()
  @IsOptional()
  phoneId?: string;

  /**
   * Meta API access token for sending messages
   * @example "EAAG..."
   */
  @IsString()
  @IsOptional()
  accessToken?: string;

  /**
   * Business email address
   * @example "contact@barbershop.com"
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * Contact phone number
   * @example "+5511999999999"
   */
  @IsString()
  @IsNotEmpty()
  phone: string;

  /**
   * Mercado Pago Access Token
   * @example "APP_USR-..."
   */
  @IsString()
  @IsOptional()
  mpAccessToken?: string;

  /**
   * Mercado Pago Public Key
   * @example "APP_USR-..."
   */
  @IsString()
  @IsOptional()
  mpPublicKey?: string;

  /**
   * Mercado Pago Refresh Token
   * @example "TG-..."
   */
  @IsString()
  @IsOptional()
  mpRefToken?: string;

  /**
   * SaaS subscription status
   * @example "ACTIVE"
   */
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  saasStatus?: SubscriptionStatus;

  /**
   * Next SaaS billing date (auto-calculated if not provided)
   * @example "2025-01-31T00:00:00Z"
   */
  @IsDateString()
  @IsOptional()
  saasNextBilling?: string;

  /**
   * SaaS payment method ID (optional, handled by payment provider)
   * @example "pm_123"
   */
  @IsString()
  @IsOptional()
  saasPaymentMethodId?: string;

  /**
   * SaaS Plan ID
   * @example "550e8400-e29b-41d4-a716-446655440003"
   */
  @IsString()
  @IsNotEmpty()
  saasPlanId: string;
}
