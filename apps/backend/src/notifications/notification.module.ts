import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AppointmentPaymentHandlerService } from './appointment-payment-handler.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [NotificationService, AppointmentPaymentHandlerService],
  exports: [NotificationService, AppointmentPaymentHandlerService],
})
export class NotificationModule {}
