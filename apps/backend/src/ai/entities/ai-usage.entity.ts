import { ApiProperty } from '@nestjs/swagger';

export class AIUsageEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440003' })
  id: string;

  @ApiProperty({ example: 150 })
  promptTokens: number;

  @ApiProperty({ example: 300 })
  completionTokens: number;

  @ApiProperty({ example: 'gemini-1.5-flash' })
  model: string;

  @ApiProperty({ example: '2026-01' })
  billingMonth: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  tenantId: string;

  @ApiProperty()
  createdAt: Date;
}
