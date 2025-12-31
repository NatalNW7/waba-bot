import { PartialType } from '@nestjs/swagger';
import { CreateOperatingHourDto } from './create-operating-hour.dto';

export class UpdateOperatingHourDto extends PartialType(CreateOperatingHourDto) {}
