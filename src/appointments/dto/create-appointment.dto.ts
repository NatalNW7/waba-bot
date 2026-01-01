import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

/**
 * Data required to create a new appointment
 */
export class CreateAppointmentDto {
  /**
   * Date and time of the appointment
   * @example "2025-12-31T10:00:00Z"
   */
  @IsDateString()
  @IsNotEmpty()
  date: string;

  /**
   * Appointment status (PENDING, CONFIRMED, CANCELED, COMPLETED)
   * @example "PENDING"
   */
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  /**
   * Reason for cancellation
   * @example "Customer could not attend"
   */
  @IsString()
  @IsOptional()
  cancellationReason?: string;

  /**
   * Price snapshot at the time of booking
   * @example 30.00
   */
  @IsNumber()
  @IsNotEmpty()
  price: number;

  /**
   * External calendar event ID
   * @example "evt_123"
   */
  @IsString()
  @IsOptional()
  externalEventId?: string;

  /**
   * ID of the tenant
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  /**
   * ID of the customer
   * @example "550e8400-e29b-41d4-a716-446655440001"
   */
  @IsString()
  @IsNotEmpty()
  customerId: string;

  /**
   * ID of the service
   * @example "550e8400-e29b-41d4-a716-446655440002"
   */
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  /**
   * ID of the subscription used (if applicable)
   * @example "550e8400-e29b-41d4-a716-446655440007"
   */
  @IsString()
  @IsOptional()
  usedSubscriptionId?: string;

  /**
   * ID of the payment associated (if applicable)
   * @example "550e8400-e29b-41d4-a716-446655440008"
   */
  @IsOptional()
  @IsString()
  paymentId?: string;
}
