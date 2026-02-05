import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common';
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
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    CommonModule,
    AuthModule,
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
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
