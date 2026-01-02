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

  // Note: offerNotification, mpCustomerId, and tenantId are now part of the TenantCustomer join table
  // but flattened in the Tenant response for convenience.

  /** Creation timestamp */
  @ApiProperty()
  createdAt: Date;

  /** Last update timestamp */
  @ApiProperty()
  updatedAt: Date;
}
