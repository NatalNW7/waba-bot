import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

/**
 * Data required to create a new tenant (WhatsApp Business account holder)
 */
export class CreateTenantDto {
  /**
   * Business name
   * @example "My Barber Shop"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * WhatsApp Business Account ID from Meta
   * @example "waba_123456789"
   */
  @IsString()
  @IsNotEmpty()
  wabaId: string;

  /**
   * WhatsApp phone number ID from Meta
   * @example "phone_987654321"
   */
  @IsString()
  @IsNotEmpty()
  phoneId: string;

  /**
   * Meta API access token for sending messages
   * @example "EAAG..."
   */
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  /**
   * Business email address
   * @example "contact@barbershop.com"
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * Contact phone number (optional)
   * @example "+5511999999999"
   */
  @IsString()
  @IsOptional()
  phone?: string;
}
