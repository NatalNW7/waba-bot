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
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceEntity } from './entities/service.entity';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /** Create a new service */
  @Post()
  @ApiOperation({ summary: 'Create service' })
  @ApiCreatedResponse({
    type: ServiceEntity,
    description: 'Service created successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  /** Get all services */
  @Get()
  @ApiOperation({ summary: 'List all services' })
  @ApiOkResponse({ type: [ServiceEntity], description: 'List of services' })
  findAll() {
    return this.servicesService.findAll();
  }

  /** Get a service by ID */
  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiOkResponse({ type: ServiceEntity, description: 'Service found' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  /** Update a service */
  @Patch(':id')
  @ApiOperation({ summary: 'Update service' })
  @ApiOkResponse({
    type: ServiceEntity,
    description: 'Service updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Service not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  /** Delete a service */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete service' })
  @ApiOkResponse({
    type: ServiceEntity,
    description: 'Service deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Service not found' })
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
