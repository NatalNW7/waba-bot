import { IsEnum, IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { DayOfWeek } from '@prisma/client';

/**
 * Data required to create a new operating hour entry
 */
export class CreateOperatingHourDto {
  /**
   * Day of the week
   * @example "MONDAY"
   */
  @IsEnum(DayOfWeek)
  day: DayOfWeek;

  /**
   * Opening time (HH:mm)
   * @example "08:00"
   */
  @IsString()
  @IsNotEmpty()
  startTime: string;

  /**
   * Closing time (HH:mm)
   * @example "18:00"
   */
  @IsString()
  @IsNotEmpty()
  endTime: string;

  /**
   * Whether the business is closed on this day
   * @example false
   */
  @IsBoolean()
  @IsOptional()
  isClosed?: boolean;

  /**
   * Whether this shift is reserved for subscribers only
   * @example false
   */
  @IsBoolean()
  @IsOptional()
  onlyForSubscribers?: boolean;

  /**
   * ID of the tenant this operating hour belongs to
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @IsString()
  @IsNotEmpty()
  tenantId: string;
}
