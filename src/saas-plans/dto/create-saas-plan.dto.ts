import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { PaymentInterval } from '@prisma/client';

/**
 * Data required to create a new SaaS subscription plan
 */
export class CreateSaasPlanDto {
  /**
   * Plan name
   * @example "Pro"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Monthly price in BRL
   * @example 99.00
   */
  @IsNumber()
  @IsNotEmpty()
  price: number;

  /**
   * Plan description (optional)
   * @example "Full access to all features"
   */
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * Billing interval for the plan
   * @example "MONTHLY"
   */
  @IsEnum(PaymentInterval)
  @IsOptional()
  interval?: PaymentInterval;
}
