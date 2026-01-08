import { PartialType } from '@nestjs/mapped-types';
import { CreateSaasPlanDto } from './create-saas-plan.dto';

export class UpdateSaasPlanDto extends PartialType(CreateSaasPlanDto) {}
