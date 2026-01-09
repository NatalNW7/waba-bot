import { IsString, IsNotEmpty, IsNumber, IsInt, Min } from 'class-validator';

/**
 * Data required to create a new service offering
 */
export class CreateServiceDto {
  /**
   * Service name
   * @example "Haircut"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Price in BRL
   * @example 30.00
   */
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  /**
   * Duration in minutes
   * @example 30
   */
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  duration: number;

  /**
   * ID of the tenant offering this service
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @IsString()
  @IsNotEmpty()
  tenantId: string;
}
