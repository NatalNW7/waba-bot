import { ApiProperty } from '@nestjs/swagger';

/**
 * Service entity representing a service offered by a tenant
 */
export class ServiceEntity {
  /** Unique identifier */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  id: string;

  /** Service name */
  @ApiProperty({ example: 'Haircut' })
  name: string;

  /** Price in BRL */
  @ApiProperty({ example: '30.00', description: 'Price in BRL (Decimal)' })
  price: string;

  /** Duration in minutes */
  @ApiProperty({ example: 30, description: 'Duration in minutes' })
  duration: number;

  /** ID of the tenant offering this service */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  tenantId: string;
}
