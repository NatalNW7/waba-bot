import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MercadoPagoService } from './mercadopago.service';
import { WebhooksController } from './webhooks.controller';
import { MercadoPagoWebhooksService } from './mercadopago-webhooks.service';
import { BullModule } from '@nestjs/bull';
import { PaymentQueueProcessor } from './processors/payment-webhook.processor';
import { PaymentRepository } from './payment-repository.service';
import { PaymentPreferenceService } from './payment-preference.service';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'payment-notifications',
    }),
  ],
  controllers: [PaymentsController, WebhooksController],
  providers: [
    PaymentsService,
    MercadoPagoService,
    MercadoPagoWebhooksService,
    PaymentQueueProcessor,
    PaymentRepository,
    PaymentPreferenceService,
  ],
  exports: [MercadoPagoService, PaymentRepository],
})
export class PaymentsModule {}
