import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AppointmentRepository } from './appointment-repository.service';
import { RelatedEntitiesValidator } from './related-entities-validator.service';
import { AppointmentOperatingHoursValidator } from './appointment-operating-hours.service';
import { SchedulingService } from './scheduling.service';
import { AppointmentPaymentValidator } from './appointment-payment.service';
import { TenantCustomerService } from './tenant-customer.service';

@Module({
  imports: [PrismaModule],
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
    AppointmentRepository,
    RelatedEntitiesValidator,
    AppointmentOperatingHoursValidator,
    SchedulingService,
    AppointmentPaymentValidator,
    TenantCustomerService,
  ],
})
export class AppointmentsModule {}
