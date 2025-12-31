import { ApiProperty } from '@nestjs/swagger';

/**
 * SaaS Plan entity representing a subscription plan for tenants
 */
export class SaasPlanEntity {
  /** Unique identifier */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440003' })
  id: string;

  /** Plan name */
  @ApiProperty({ example: 'Pro' })
  name: string;

  /** Monthly price in BRL */
  @ApiProperty({
    example: '99.00',
    description: 'Monthly price in BRL (Decimal)',
  })
  price: string;

  /** Plan description */
  @ApiProperty({ example: 'Full access to all features', required: false })
  description?: string;

  /** Creation timestamp */
  @ApiProperty()
  createdAt: Date;

  /** Last update timestamp */
  @ApiProperty()
  updatedAt: Date;
}
