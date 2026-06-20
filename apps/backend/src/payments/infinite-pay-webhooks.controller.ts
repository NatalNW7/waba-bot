import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { PgBossService } from '../queue/pgboss.service';

@ApiTags('Webhooks')
@Controller('webhooks/infinitepay')
@Public()
export class InfinitePayWebhooksController {
  private readonly logger = new Logger(InfinitePayWebhooksController.name);

  constructor(private readonly pgBoss: PgBossService) {}

  @Post(':tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle InfinitePay Webhook' })
  async handleWebhook(@Param('tenantId') tenantId: string, @Body() body: any) {
    this.logger.log(`Received InfinitePay webhook for tenant ${tenantId}`);

    await this.pgBoss.send(
      'payment-notifications',
      {
        topic: 'infinitepay_payment',
        resourceId: body.order_nsu,
        targetId: tenantId,
        payload: body,
      },
      {
        retryLimit: 3,
        retryDelay: 5,
        retryBackoff: true,
      },
    );

    return { received: true };
  }
}
