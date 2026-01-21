import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Verification code sent to email',
    example: '123456',
  })
  @IsString()
  @Length(6, 6, { message: 'O código deve ter 6 dígitos' })
  code: string;
}
