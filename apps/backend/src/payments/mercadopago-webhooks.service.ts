import { Injectable, Logger } from '@nestjs/common';
import { PgBossService } from '../queue/pgboss.service';

@Injectable()
export class MercadoPagoWebhooksService {
  private readonly logger = new Logger(MercadoPagoWebhooksService.name);

  constructor(private readonly pgBoss: PgBossService) {}

  async handleNotification(
    topic: string,
    resourceId: string,
    targetId: string,
  ) {
    this.logger.log(
      `Queueing notification for ${targetId}: ${topic} - ${resourceId}`,
    );

    await this.pgBoss.send(
      'payment-notifications',
      {
        topic,
        resourceId,
        targetId,
      },
      {
        retryLimit: 3,
        retryDelay: 5,
        retryBackoff: true,
      },
    );
  }
}
