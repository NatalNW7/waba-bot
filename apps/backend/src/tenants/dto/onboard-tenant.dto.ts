import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OnboardTenantDto {
  @ApiProperty({ description: 'Business name', example: 'Barbearia do João' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Business email',
    example: 'contact@barbershop.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Business phone', example: '+5511999999999' })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Selected SaaS plan ID',
    example: 'starter-monthly',
  })
  @IsString()
  saasPlanId: string;

  @ApiPropertyOptional({
    description:
      'Whether to create subscription and get payment URL (default: true)',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description:
      'Whether to create subscription and get payment URL (default: true)',
    default: true,
  })
  createSubscription?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Whether to enable the AI assistant (default: true)',
    default: true,
  })
  aiEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Custom system prompt for the AI assistant',
    example: 'Você é um assistente de barbearia...',
  })
  @IsOptional()
  @IsString()
  aiCustomPrompt?: string;
}
