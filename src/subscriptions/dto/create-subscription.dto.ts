import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { SubscriptionStatus } from '@prisma/client';

/**
 * Data required to create a new customer subscription
 */
export class CreateSubscriptionDto {
  /**
   * Subscription status (ACTIVE, PAST_DUE, CANCELED, EXPIRED)
   * @example "ACTIVE"
   */
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  /**
   * Subscription start date
   * @example "2025-01-01T00:00:00Z"
   */
  @IsDateString()
  @IsOptional()
  startDate?: string;

  /**
   * Next billing date
   * @example "2025-02-01T00:00:00Z"
   */
  @IsDateString()
  @IsNotEmpty()
  nextBilling: string;

  /**
   * Mercado Pago card token ID for automatic billing
   * @example "card_123..."
   */
  @IsString()
  @IsOptional()
  cardTokenId?: string;

  /**
   * ID of the plan for this subscription
   * @example "550e8400-e29b-41d4-a716-446655440006"
   */
  @IsString()
  @IsNotEmpty()
  planId: string;

  /**
   * ID of the customer subscribing
   * @example "550e8400-e29b-41d4-a716-446655440001"
   */
  @IsString()
  @IsNotEmpty()
  customerId: string;
}
