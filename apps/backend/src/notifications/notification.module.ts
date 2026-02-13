import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { AppointmentPaymentHandlerService } from './appointment-payment-handler.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [NotificationService, AppointmentPaymentHandlerService],
  exports: [NotificationService, AppointmentPaymentHandlerService],
})
export class NotificationModule {}
