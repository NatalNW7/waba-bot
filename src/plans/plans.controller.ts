import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanEntity } from './entities/plan.entity';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  /** Create a plan for customers */
  @Post()
  @ApiOperation({ summary: 'Create plan' })
  @ApiCreatedResponse({
    type: PlanEntity,
    description: 'Plan created successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  /** Get all plans */
  @Get()
  @ApiOperation({ summary: 'List all plans' })
  @ApiOkResponse({
    type: [PlanEntity],
    description: 'List of plans',
  })
  findAll() {
    return this.plansService.findAll();
  }

  /** Get a plan by ID */
  @Get(':id')
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiOkResponse({ type: PlanEntity, description: 'Plan found' })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  /** Update a plan */
  @Patch(':id')
  @ApiOperation({ summary: 'Update plan' })
  @ApiOkResponse({
    type: PlanEntity,
    description: 'Plan updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto);
  }

  /** Delete a plan */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete plan' })
  @ApiOkResponse({
    type: PlanEntity,
    description: 'Plan deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Plan not found' })
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }
}
