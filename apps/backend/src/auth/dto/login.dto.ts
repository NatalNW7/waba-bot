import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

/**
 * Login credentials
 */
export class LoginDto {
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
