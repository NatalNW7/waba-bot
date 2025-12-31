import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WabaModule } from './waba/waba.module';
import { PrismaModule } from './prisma/prisma.module';
import { SaasPlansModule } from './saas-plans/saas-plans.module';
import { TenantsModule } from './tenants/tenants.module';
import { ServicesModule } from './services/services.module';
import { CustomersModule } from './customers/customers.module';
import { OperatingHoursModule } from './operating-hours/operating-hours.module';
import { CalendarsModule } from './calendars/calendars.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    WabaModule,
    PrismaModule,
    SaasPlansModule,
    TenantsModule,
    ServicesModule,
    CustomersModule,
    OperatingHoursModule,
    CalendarsModule,
    PlansModule,
    SubscriptionsModule,
    AppointmentsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
