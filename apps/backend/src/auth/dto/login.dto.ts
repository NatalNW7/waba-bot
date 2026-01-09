import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ILoginRequest } from '@repo/api-types';

/**
 * Login credentials
 */
export class LoginDto implements ILoginRequest {
  /**
   * User email
   * @example "admin@waba-bot.com"
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * User password
   * @example "admin123"
   */
  @IsString()
  @IsNotEmpty()
  password: string;
}
