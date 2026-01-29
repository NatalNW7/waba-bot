import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SaasPlansService } from './saas-plans.service';
import { CreateSaasPlanDto } from './dto/create-saas-plan.dto';
import { UpdateSaasPlanDto } from './dto/update-saas-plan.dto';
import { SaasPlanEntity } from './entities/saas-plan.entity';
import { Public } from '../auth';

@ApiTags('SaaS Plans')
@ApiBearerAuth('JWT')
@Controller('saas-plans')
export class SaasPlansController {
  constructor(private readonly saasPlansService: SaasPlansService) {}

  /** Create a new SaaS plan */
  @Post()
  @ApiOperation({ summary: 'Create SaaS plan' })
  @ApiCreatedResponse({
    type: SaasPlanEntity,
    description: 'SaaS plan created successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  create(@Body() createSaasPlanDto: CreateSaasPlanDto) {
    return this.saasPlansService.create(createSaasPlanDto);
  }

  /** Get all SaaS plans */
  @Public()
  @Get()
  @ApiOperation({ summary: 'List all SaaS plans' })
  @ApiOkResponse({ type: [SaasPlanEntity], description: 'List of SaaS plans' })
  findAll() {
    return this.saasPlansService.findAll();
  }

  /** Get a SaaS plan by ID */
  @Get(':id')
  @ApiOperation({ summary: 'Get SaaS plan by ID' })
  @ApiOkResponse({ type: SaasPlanEntity, description: 'SaaS plan found' })
  @ApiNotFoundResponse({ description: 'SaaS plan not found' })
  @ApiQuery({
    name: 'include',
    required: false,
    description: 'Comma-separated list of relations to include',
    example: 'tenants',
  })
  findOne(@Param('id') id: string, @Query('include') include?: string) {
    return this.saasPlansService.findOne(id, include);
  }

  /** Update a SaaS plan */
  @Patch(':id')
  @ApiOperation({ summary: 'Update SaaS plan' })
  @ApiOkResponse({
    type: SaasPlanEntity,
    description: 'SaaS plan updated successfully',
  })
  @ApiNotFoundResponse({ description: 'SaaS plan not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  update(
    @Param('id') id: string,
    @Body() updateSaasPlanDto: UpdateSaasPlanDto,
  ) {
    return this.saasPlansService.update(id, updateSaasPlanDto);
  }

  /** Delete a SaaS plan */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete SaaS plan' })
  @ApiOkResponse({
    type: SaasPlanEntity,
    description: 'SaaS plan deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'SaaS plan not found' })
  remove(@Param('id') id: string) {
    return this.saasPlansService.remove(id);
  }
}
