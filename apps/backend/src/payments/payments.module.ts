import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MercadoPagoService } from './mercadopago.service';
import { WebhooksController } from './webhooks.controller';
import { InfinitePayWebhooksController } from './infinite-pay-webhooks.controller';
import { MercadoPagoWebhooksService } from './mercadopago-webhooks.service';
import { BullModule } from '@nestjs/bull';
import { PaymentQueueProcessor } from './processors/payment-webhook.processor';
import { PaymentRepository } from './payment-repository.service';
import { PaymentPreferenceService } from './payment-preference.service';
import { InfinitePayService } from './infinite-pay.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    BullModule.registerQueue({
      name: 'payment-notifications',
    }),
  ],
  controllers: [
    PaymentsController,
    WebhooksController,
    InfinitePayWebhooksController,
  ],
  providers: [
    PaymentsService,
    MercadoPagoService,
    MercadoPagoWebhooksService,
    PaymentQueueProcessor,
    PaymentRepository,
    PaymentPreferenceService,
    InfinitePayService,
  ],
  exports: [MercadoPagoService, PaymentRepository, InfinitePayService],
})
export class PaymentsModule {}
