import { ApiProperty } from '@nestjs/swagger';

/**
 * Customer entity representing a client of a tenant
 */
export class CustomerEntity {
  /** Unique identifier */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id: string;

  /** WhatsApp phone number */
  @ApiProperty({ example: '+5511999999999' })
  phone: string;

  /** Customer name */
  @ApiProperty({ example: 'João Silva', required: false })
  name?: string;

  /** Customer email */
  @ApiProperty({ example: 'joao@email.com', required: false })
  email?: string;

  /** Whether customer opted in for promotional notifications */
  @ApiProperty({ example: true })
  offerNotification: boolean;

  /** ID of the tenant this customer belongs to */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  tenantId: string;

  /** Mercado Pago customer ID for payments */
  @ApiProperty({ example: 'mp_cust_123', required: false })
  mpCustomerId?: string;

  /** Creation timestamp */
  @ApiProperty()
  createdAt: Date;

  /** Last update timestamp */
  @ApiProperty()
  updatedAt: Date;
}
