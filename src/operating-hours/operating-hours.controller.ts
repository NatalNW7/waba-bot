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
import { OperatingHoursService } from './operating-hours.service';
import { CreateOperatingHourDto } from './dto/create-operating-hour.dto';
import { UpdateOperatingHourDto } from './dto/update-operating-hour.dto';
import { OperatingHourEntity } from './entities/operating-hour.entity';

@ApiTags('Operating Hours')
@Controller('operating-hours')
export class OperatingHoursController {
  constructor(private readonly operatingHoursService: OperatingHoursService) {}

  /** Create an operating hour entry */
  @Post()
  @ApiOperation({ summary: 'Create operating hour' })
  @ApiCreatedResponse({
    type: OperatingHourEntity,
    description: 'Operating hour created successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  create(@Body() createOperatingHourDto: CreateOperatingHourDto) {
    return this.operatingHoursService.create(createOperatingHourDto);
  }

  /** Get all operating hours */
  @Get()
  @ApiOperation({ summary: 'List all operating hours' })
  @ApiOkResponse({
    type: [OperatingHourEntity],
    description: 'List of operating hours',
  })
  findAll() {
    return this.operatingHoursService.findAll();
  }

  /** Get an operating hour by ID */
  @Get(':id')
  @ApiOperation({ summary: 'Get operating hour by ID' })
  @ApiOkResponse({ type: OperatingHourEntity, description: 'Operating hour found' })
  @ApiNotFoundResponse({ description: 'Operating hour not found' })
  findOne(@Param('id') id: string) {
    return this.operatingHoursService.findOne(id);
  }

  /** Update an operating hour entry */
  @Patch(':id')
  @ApiOperation({ summary: 'Update operating hour' })
  @ApiOkResponse({
    type: OperatingHourEntity,
    description: 'Operating hour updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Operating hour not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  update(
    @Param('id') id: string,
    @Body() updateOperatingHourDto: UpdateOperatingHourDto,
  ) {
    return this.operatingHoursService.update(id, updateOperatingHourDto);
  }

  /** Delete an operating hour entry */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete operating hour' })
  @ApiOkResponse({
    type: OperatingHourEntity,
    description: 'Operating hour deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Operating hour not found' })
  remove(@Param('id') id: string) {
    return this.operatingHoursService.remove(id);
  }
}
