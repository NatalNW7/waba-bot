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
}
