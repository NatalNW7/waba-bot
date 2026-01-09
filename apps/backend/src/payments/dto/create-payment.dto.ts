import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { PaymentStatus, PaymentType, PaymentMethod } from '@prisma/client';

/**
 * Data required to create a new payment record
 */
export class CreatePaymentDto {
  /**
   * External ID from payment gateway (Mercado Pago)
   * @example "mp_123456789"
   */
  @IsString()
  @IsOptional()
  externalId?: string;

  /**
   * Total payment amount
   * @example 30.00
   */
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  /**
   * Net amount received after fees
   * @example 28.50
   */
  @IsNumber()
  @IsOptional()
  netAmount?: number;

  /**
   * Fee charged by the gateway
   * @example 1.50
   */
  @IsNumber()
  @IsOptional()
  fee?: number;

  /**
   * Payment status (PENDING, APPROVED, REFUNDED, etc.)
   * @example "APPROVED"
   */
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  /**
   * Type of payment (APPOINTMENT, SUBSCRIPTION, SAAS_FEE)
   * @example "APPOINTMENT"
   */
  @IsEnum(PaymentType)
  @IsNotEmpty()
  type: PaymentType;

  /**
   * Payment method (PIX, CREDIT_CARD)
   * @example "PIX"
   */
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;

  /**
   * ID of the tenant
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  /**
   * ID of the customer (optional)
   * @example "550e8400-e29b-41d4-a716-446655440001"
   */
  @IsString()
  @IsOptional()
  customerId?: string;

  /**
   * ID of the associated subscription (if applicable)
   * @example "550e8400-e29b-41d4-a716-446655440007"
   */
  @IsString()
  @IsOptional()
  subscriptionId?: string;
}
