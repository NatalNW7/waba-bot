import { ApiProperty } from '@nestjs/swagger';

/**
 * Tenant entity representing a WhatsApp Business account holder
 */
export class TenantEntity {
  /** Unique identifier */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  /** Business name */
  @ApiProperty({ example: 'My Barber Shop' })
  name: string;

  /** WhatsApp Business Account ID */
  @ApiProperty({ example: 'waba_123456789' })
  wabaId: string;

  /** WhatsApp phone number ID */
  @ApiProperty({ example: 'phone_987654321' })
  phoneId: string;

  /** Meta API access token */
  @ApiProperty({ example: 'EAAG...' })
  accessToken: string;

  /** Business email address */
  @ApiProperty({ example: 'contact@barbershop.com' })
  email: string;

  /** Contact phone number */
  @ApiProperty({ example: '+5511999999999', required: false })
  phone?: string;

  /** Creation timestamp */
  @ApiProperty()
  createdAt: Date;

  /** Last update timestamp */
  @ApiProperty()
  updatedAt: Date;
}
