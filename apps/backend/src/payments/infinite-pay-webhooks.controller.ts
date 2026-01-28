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
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Webhooks')
@Controller('webhooks/infinitepay')
@Public()
export class InfinitePayWebhooksController {
  private readonly logger = new Logger(InfinitePayWebhooksController.name);

  constructor(
    @InjectQueue('payment-notifications') private readonly paymentQueue: Queue,
  ) {}

  @Post(':tenantId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle InfinitePay Webhook' })
  async handleWebhook(@Param('tenantId') tenantId: string, @Body() body: any) {
    this.logger.log(`Received InfinitePay webhook for tenant ${tenantId}`);

    // Basic validation / extraction
    // We expect 'order_nsu' to be our internal Payment ID if possible.
    // Or we might need to rely on the body content.

    await this.paymentQueue.add(
      'handle-notification',
      {
        topic: 'infinitepay_payment',
        resourceId: body.order_nsu, // We use order_nsu as the resource ID (our Payment ID)
        targetId: tenantId,
        payload: body, // Pass the full payload to avoid re-fetching if possible, or for the processor to use
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

    return { received: true };
  }
}
