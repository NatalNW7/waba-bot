import {
  Controller,
  Post,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MercadoPagoWebhooksService } from './mercadopago-webhooks.service';
import * as crypto from 'crypto';

@ApiTags('Webhooks')
@Controller('webhooks/mercadopago')
export class WebhooksController {
  constructor(private readonly webhooksService: MercadoPagoWebhooksService) {}

  /**
   * Universal Webhook for Mercado Pago
   * URL format: /webhooks/mercadopago/:id (where id can be 'platform' or a tenantId)
   */
  @Post(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Mercado Pago Webhook' })
  async handleWebhook(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('x-signature') signatureHeader: string,
    @Headers('x-request-id') requestId: string,
    @Query('topic') queryTopic?: string,
    @Query('id') queryId?: string,
  ) {
    const topic = queryTopic || body.type || body.topic;
    const resourceId = queryId || (body.data ? body.data.id : body.id);

    // Signature Validation
    if (process.env.MP_WEBHOOK_SECRET && signatureHeader) {
      this.validateSignature(signatureHeader, requestId, resourceId);
    }

    if (topic && resourceId) {
      await this.webhooksService.handleNotification(topic, resourceId, id);
    }

    return { received: true };
  }

  private validateSignature(
    signatureHeader: string,
    requestId: string,
    resourceId: string,
  ) {
    const parts = signatureHeader.split(',');
    const tsPart = parts.find((p) => p.startsWith('ts='));
    const v1Part = parts.find((p) => p.startsWith('v1='));

    if (!tsPart || !v1Part) {
      throw new BadRequestException('Invalid signature format');
    }

    const ts = tsPart.split('=')[1];
    const v1 = v1Part.split('=')[1];
    const secret = process.env.MP_WEBHOOK_SECRET || '';

    const manifest = `id:${resourceId};request-id:${requestId};ts:${ts};`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const calculatedSignature = hmac.digest('hex');

    if (calculatedSignature !== v1) {
      throw new BadRequestException('Invalid signature');
    }
  }
}
