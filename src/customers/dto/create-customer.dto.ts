import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
} from 'class-validator';

/**
 * Data required to create a new customer
 */
export class CreateCustomerDto {
  /**
   * Customer WhatsApp phone number
   * @example "+5511999999999"
   */
  @IsString()
  @IsNotEmpty()
  phone: string;

  /**
   * Customer name (optional)
   * @example "João Silva"
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * Customer email address (optional)
   * @example "joao@email.com"
   */
  @IsEmail()
  @IsOptional()
  email?: string;

  /**
   * Whether customer opted in for promotional notifications
   * @example true
   */
  @IsBoolean()
  @IsOptional()
  offerNotification?: boolean;

  /**
   * ID of the tenant this customer belongs to
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  /**
   * Mercado Pago customer ID (optional)
   * @example "mp_cust_123"
   */
  @IsString()
  @IsOptional()
  mpCustomerId?: string;
}
