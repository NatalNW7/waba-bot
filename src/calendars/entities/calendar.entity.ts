import { ApiProperty } from '@nestjs/swagger';
import { CalendarProvider } from '@prisma/client';

/**
 * Calendar entity
 */
export class CalendarEntity {
  /** Unique identifier */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440005' })
  id: string;

  /** Calendar provider */
  @ApiProperty({ enum: CalendarProvider, example: 'GOOGLE' })
  provider: CalendarProvider;

  /** Associated email */
  @ApiProperty({ example: 'owner@barbershop.com' })
  email: string;

  /** OAuth access token */
  @ApiProperty({ example: 'ya29...' })
  accessToken: string;

  /** OAuth refresh token */
  @ApiProperty({ example: '1//...' })
  refreshToken: string;

  /** Token expiry timestamp */
  @ApiProperty({ example: '2025-12-31T23:59:59Z', required: false })
  tokenExpiry?: Date;

  /** Tenant ID */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  tenantId: string;
}
