import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';

export class TextDto {
  @ApiProperty({ example: 'Olá' })
  @IsString()
  body: string;
}

export class ProfileDto {
  @ApiProperty({ example: 'Natanael Weslley' })
  @IsString()
  name: string;
}

export class MessageDto {
  @ApiProperty({ example: '5511913339320' })
  @IsString()
  from: string;

  @ApiProperty({
    example:
      'wamid.HBgNNTUxMTkxMzMzOTMyMBUCABIYFDNBRjY2NTc0MzZGQzAwMDEwOTFDAA==',
  })
  @IsString()
  id: string;

  @ApiProperty({ example: '1769114508' })
  @IsString()
  timestamp: string;

  @ApiProperty({ type: TextDto })
  @ValidateNested()
  @Type(() => TextDto)
  @IsOptional()
  text?: TextDto;

  @ApiProperty({ example: 'text' })
  @IsString()
  type: string;
}

export class ContactDto {
  @ApiProperty({ type: ProfileDto })
  @ValidateNested()
  @Type(() => ProfileDto)
  profile: ProfileDto;

  @ApiProperty({ example: '5511913339320' })
  @IsString()
  wa_id: string;
}

export class MetadataDto {
  @ApiProperty({ example: '15550026824' })
  @IsString()
  display_phone_number: string;

  @ApiProperty({ example: '929301416928714' })
  @IsString()
  phone_number_id: string;
}

export class ValueDto {
  @ApiProperty({ example: 'whatsapp' })
  @IsString()
  messaging_product: string;

  @ApiProperty({ type: MetadataDto })
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata: MetadataDto;

  @ApiProperty({ type: [ContactDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactDto)
  @IsOptional()
  contacts?: ContactDto[];

  @ApiProperty({ type: [MessageDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  @IsOptional()
  messages?: MessageDto[];
}

export class ChangeDto {
  @ApiProperty({ type: ValueDto })
  @ValidateNested()
  @Type(() => ValueDto)
  value: ValueDto;

  @ApiProperty({ example: 'messages' })
  @IsString()
  field: string;
}

export class EntryDto {
  @ApiProperty({ example: '4066592260320700' })
  @IsString()
  id: string;

  @ApiProperty({ type: [ChangeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChangeDto)
  changes: ChangeDto[];
}

export class WebhookPayloadDto {
  @ApiProperty({ example: 'whatsapp_business_account' })
  @IsString()
  object: string;

  @ApiProperty({ type: [EntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntryDto)
  entry: EntryDto[];
}
