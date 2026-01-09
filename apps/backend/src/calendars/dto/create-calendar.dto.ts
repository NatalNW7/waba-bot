import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ICreateCalendar, CalendarProvider } from '@repo/api-types';

/**
 * Data required to create a new calendar integration
 */
export class CreateCalendarDto implements ICreateCalendar {
  /**
   * Calendar provider (GOOGLE or APPLE)
   * @example "GOOGLE"
   */
  @IsEnum(CalendarProvider)
  provider: CalendarProvider;

  /**
   * Email address associated with the calendar
   * @example "owner@barbershop.com"
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * OAuth access token
   * @example "ya29..."
   */
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  /**
   * OAuth refresh token
   * @example "1//..."
   */
  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  /**
   * Token expiry timestamp
   * @example "2025-12-31T23:59:59Z"
   */
  @IsDateString()
  @IsOptional()
  tokenExpiry?: string;

  /**
   * ID of the tenant this calendar belongs to
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @IsString()
  @IsNotEmpty()
  tenantId: string;
}
