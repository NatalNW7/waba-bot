import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek } from '@prisma/client';

/**
 * Operating Hour entity
 */
export class OperatingHourEntity {
  /** Unique identifier */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440004' })
  id: string;

  /** Day of the week */
  @ApiProperty({ enum: DayOfWeek, example: 'MONDAY' })
  day: DayOfWeek;

  /** Opening time */
  @ApiProperty({ example: '08:00' })
  startTime: string;

  /** Closing time */
  @ApiProperty({ example: '18:00' })
  endTime: string;

  /** Is closed status */
  @ApiProperty({ example: false })
  isClosed: boolean;

  /** For subscribers only status */
  @ApiProperty({ example: false })
  onlyForSubscribers: boolean;

  /** Tenant ID */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  tenantId: string;
}
