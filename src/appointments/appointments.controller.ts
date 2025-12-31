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
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentEntity } from './entities/appointment.entity';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /** Create a new appointment */
  @Post()
  @ApiOperation({ summary: 'Create appointment' })
  @ApiCreatedResponse({
    type: AppointmentEntity,
    description: 'Appointment created successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  /** Get all appointments */
  @Get()
  @ApiOperation({ summary: 'List all appointments' })
  @ApiOkResponse({
    type: [AppointmentEntity],
    description: 'List of appointments',
  })
  findAll() {
    return this.appointmentsService.findAll();
  }

  /** Get an appointment by ID */
  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiOkResponse({ type: AppointmentEntity, description: 'Appointment found' })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  /** Update an appointment */
  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiOkResponse({
    type: AppointmentEntity,
    description: 'Appointment updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  /** Delete an appointment */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete appointment' })
  @ApiOkResponse({
    type: AppointmentEntity,
    description: 'Appointment deleted successfully',
  })
  @ApiNotFoundResponse({ description: 'Appointment not found' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
