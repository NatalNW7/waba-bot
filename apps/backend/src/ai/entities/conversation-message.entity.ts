import { ApiProperty } from '@nestjs/swagger';

export class ConversationMessageEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id: string;

  @ApiProperty({
    example: 'user',
    enum: ['user', 'assistant', 'system', 'tool'],
  })
  role: string;

  @ApiProperty({ example: 'Olá, gostaria de agendar um horário.' })
  content: string;

  @ApiProperty({ required: false, type: Object })
  toolCalls?: any;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  tenantId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  customerId: string;

  @ApiProperty()
  createdAt: Date;
}
