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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CalendarsService } from './calendars.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { CalendarEntity } from './entities/calendar.entity';

@ApiTags('Calendars')
@ApiBearerAuth('JWT')
@Controller('calendars')
export class CalendarsController {
  constructor(private readonly calendarsService: CalendarsService) {}

  /** Create a calendar integration */
  @Post()
  @ApiOperation({ summary: 'Create calendar' })
  @ApiCreatedResponse({
    type: CalendarEntity,
    description: 'Calendar created successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  create(@Body() createCalendarDto: CreateCalendarDto) {
    return this.calendarsService.create(createCalendarDto);
  }

  /** Get all calendars */
  @Get()
  @ApiOperation({ summary: 'List all calendars' })
  @ApiOkResponse({
    type: [CalendarEntity],
    description: 'List of calendars',
  })
  findAll() {
    return this.calendarsService.findAll();
  }

  /** Get a calendar by ID */
  @Get(':id')
  @ApiOperation({ summary: 'Get calendar by ID' })
  @ApiOkResponse({ type: CalendarEntity, description: 'Calendar found' })
  @ApiNotFoundResponse({ description: 'Calendar not found' })
  findOne(@Param('id') id: string) {
    return this.calendarsService.findOne(id);
  }

  /** Update a calendar integration */
  @Patch(':id')
  @ApiOperation({ summary: 'Update calendar' })
  @ApiOkResponse({
    type: CalendarEntity,
    description: 'Calendar updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Calendar not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  update(
    @Param('id') id: string,
    @Body() updateCalendarDto: UpdateCalendarDto,
  ) {
    return this.calendarsService.update(id, updateCalendarDto);
  }

  /** Delete a calendar integration */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete calendar' })
  @ApiOkResponse({
    type: CalendarEntity,
    description: 'Calendar deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Calendar not found' })
  remove(@Param('id') id: string) {
    return this.calendarsService.remove(id);
  }
}
