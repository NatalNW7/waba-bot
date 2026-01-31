import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus, PaymentType, PaymentMethod } from '@prisma/client';

/**
 * Payment entity
 */
export class PaymentEntity {
  /** Unique identifier */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440008' })
  id: string;

  /** External ID from gateway */
  @ApiProperty({ example: 'mp_123456789' })
  externalId: string;

  /** Gross amount */
  @ApiProperty({ example: '30.00', description: 'Price in BRL (Decimal)' })
  amount: string;

  /** Net amount after fees */
  @ApiProperty({
    example: '28.50',
    description: 'Net amount in BRL (Decimal)',
    required: false,
  })
  netAmount?: string;

  /** Gateway fee */
  @ApiProperty({
    example: '1.50',
    description: 'Fee in BRL (Decimal)',
    required: false,
  })
  fee?: string;

  /** Payment status */
  @ApiProperty({ enum: PaymentStatus, example: 'APPROVED' })
  status: PaymentStatus;

  /** Payment type */
  @ApiProperty({ enum: PaymentType, example: 'APPOINTMENT' })
  type: PaymentType;

  /** Payment method */
  @ApiProperty({ enum: PaymentMethod, example: 'PIX' })
  method: PaymentMethod;

  /** InfinitePay payment slug */
  @ApiProperty({
    example: 'txn_abc123',
    required: false,
    description: 'InfinitePay transaction identifier',
  })
  infinitePaySlug?: string;

  /** Tenant ID */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  tenantId: string;

  /** Customer ID */
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  customerId?: string;

  /** Subscription ID */
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440007',
    required: false,
  })
  subscriptionId?: string;

  /** Creation timestamp */
  @ApiProperty()
  createdAt: Date;

  /** Last update timestamp */
  @ApiProperty()
  updatedAt: Date;
}
