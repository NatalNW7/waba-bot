import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';

/**
 * Appointment entity
 */
export class AppointmentEntity {
  /** Unique identifier */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440009' })
  id: string;

  /** Appointment date and time */
  @ApiProperty({ example: '2025-12-31T10:00:00Z' })
  date: Date;

  /** Appointment status */
  @ApiProperty({ enum: AppointmentStatus, example: 'PENDING' })
  status: AppointmentStatus;

  /** Cancellation reason */
  @ApiProperty({ example: 'Customer could not attend', required: false })
  cancellationReason?: string;

  /** Cancellation timestamp */
  @ApiProperty({ example: '2025-12-31T09:00:00Z', required: false })
  canceledAt?: Date;

  /** Price snapshot */
  @ApiProperty({ example: '30.00', description: 'Price in BRL (Decimal)' })
  price: string;

  /** External calendar event ID */
  @ApiProperty({ example: 'evt_123', required: false })
  externalEventId?: string;

  /** Tenant ID */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  tenantId: string;

  /** Customer ID */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  customerId: string;

  /** Service ID */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  serviceId: string;

  /** Payment ID */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440008', required: false })
  paymentId?: string;

  /** Used subscription ID */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440007', required: false })
  usedSubscriptionId?: string;

  /** Creation timestamp */
  @ApiProperty()
  createdAt: Date;

  /** Last update timestamp */
  @ApiProperty()
  updatedAt: Date;
}
