import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsModule } from '../payments/payments.module';
import { SubscriptionRepository } from './subscription-repository.service';
import { SubscriptionBillingService } from './subscription-billing.service';
import { CustomerSubscriptionService } from './customer-subscription.service';

@Module({
  imports: [PrismaModule, PaymentsModule],
  providers: [
    SubscriptionsService,
    SubscriptionRepository,
    SubscriptionBillingService,
    CustomerSubscriptionService,
  ],
  controllers: [SubscriptionsController],
})
export class SubscriptionsModule {}
