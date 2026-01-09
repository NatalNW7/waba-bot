import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { PaymentInterval } from '@prisma/client';

/**
 * Data required to create a new plan (for tenant's customers)
 */
export class CreatePlanDto {
  /**
   * Plan name
   * @example "Mensal Barba"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Plan description
   * @example "Acesso ilimitado a barba por um mês"
   */
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * Monthly price in BRL
   * @example 80.00
   */
  @IsNumber()
  @IsNotEmpty()
  price: number;

  /**
   * Payment interval (MONTHLY, QUARTERLY, YEARLY)
   * @example "MONTHLY"
   */
  @IsEnum(PaymentInterval)
  @IsOptional()
  interval?: PaymentInterval;

  /**
   * ID of the tenant this plan belongs to
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  /**
   * Maximum appointments allowed per cycle (-1 for unlimited)
   * @example 4
   */
  @IsNumber()
  @IsNotEmpty()
  maxAppointments: number;
}
