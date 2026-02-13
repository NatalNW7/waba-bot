import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

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
   * Customer full name
   * @example "João Silva"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Customer email address (optional)
   * @example "joao@email.com"
   */
  @IsEmail()
  @IsOptional()
  email?: string;
}
