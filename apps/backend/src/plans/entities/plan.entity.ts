import { ApiProperty } from '@nestjs/swagger';
import { PaymentInterval } from '@prisma/client';

/**
 * Plan entity
 */
export class PlanEntity {
  /** Unique identifier */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440006' })
  id: string;

  /** Plan name */
  @ApiProperty({ example: 'Mensal Barba' })
  name: string;

  /** Plan description */
  @ApiProperty({
    example: 'Acesso ilimitado a barba por um mês',
    required: false,
  })
  description?: string;

  /** Plan price */
  @ApiProperty({ example: '80.00', description: 'Price in BRL (Decimal)' })
  price: string;

  /** Payment interval */
  @ApiProperty({ enum: PaymentInterval, example: 'MONTHLY' })
  interval: PaymentInterval;

  /** Tenant ID */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  tenantId: string;

  /** Maximum appointments allowed per cycle */
  @ApiProperty({ example: 4, description: 'Max appointments per interval' })
  maxAppointments: number;

  /** Creation timestamp */
  @ApiProperty()
  createdAt: Date;

  /** Last update timestamp */
  @ApiProperty()
  updatedAt: Date;
}
