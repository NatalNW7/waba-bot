import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class MercadoPagoWebhooksService {
  private readonly logger = new Logger(MercadoPagoWebhooksService.name);

  constructor(
    @InjectQueue('payment-notifications') private readonly paymentQueue: Queue,
  ) {}

  async handleNotification(
    topic: string,
    resourceId: string,
    targetId: string,
  ) {
    this.logger.log(
      `Queueing notification for ${targetId}: ${topic} - ${resourceId}`,
    );

    await this.paymentQueue.add(
      'handle-notification',
      {
        topic,
        resourceId,
        targetId,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
      },
    );
  }
}
