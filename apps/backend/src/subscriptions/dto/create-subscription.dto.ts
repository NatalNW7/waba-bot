import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { ICreateSubscription, SubscriptionStatus } from '@repo/api-types';

/**
 * Data required to create a new customer subscription
 */
export class CreateSubscriptionDto implements ICreateSubscription {
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
   * Next billing date (calculated automatically based on plan interval if not provided)
   * @example "2025-02-01T00:00:00Z"
   */
  @IsDateString()
  @IsOptional()
  nextBilling?: string;

  /**
   * Mercado Pago card token ID for automatic billing
   * @example "card_123..."
   */
  @IsString()
  @IsNotEmpty()
  cardTokenId: string;

  /**
   * ID of the plan for this subscription
   * @example "550e8400-e29b-41d4-a716-446655440006"
   */
  @IsString()
  @IsNotEmpty()
  planId: string;

  /**
   * ID of the customer
   * @example "550e8400-e29b-41d4-a716-446655440001"
   */
  @IsString()
  @IsNotEmpty()
  customerId: string;
}
