import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

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
}
