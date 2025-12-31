import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from '@prisma/client';

/**
 * Subscription entity
 */
export class SubscriptionEntity {
  /** Unique identifier */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440007' })
  id: string;

  /** Subscription status */
  @ApiProperty({ enum: SubscriptionStatus, example: 'ACTIVE' })
  status: SubscriptionStatus;

  /** Subscription start date */
  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  startDate: Date;

  /** Next billing date */
  @ApiProperty({ example: '2025-02-01T00:00:00Z' })
  nextBilling: Date;

  /** Payment card token ID */
  @ApiProperty({ example: 'card_123...', required: false })
  cardTokenId?: string;

  /** Plan ID */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440006' })
  planId: string;

  /** Customer ID */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  customerId: string;

  /** Creation timestamp */
  @ApiProperty()
  createdAt: Date;

  /** Last update timestamp */
  @ApiProperty()
  updatedAt: Date;
}
