import {
  Controller,
  Post,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoWebhooksService } from './mercadopago-webhooks.service';
import { Public } from '../auth/decorators/public.decorator';
import type { Request } from 'express';
import * as crypto from 'crypto';

@ApiTags('Webhooks')
@Controller('webhooks/mercadopago')
@Public()
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly webhooksService: MercadoPagoWebhooksService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Mercado Pago Webhook — resolves targetId from body.user_id
   * MP sends query params: ?data.id=XXX&type=YYY
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Mercado Pago Webhook' })
  async handleWebhook(
    @Req() req: Request,
    @Body() body: any,
    @Headers('x-signature') signatureHeader: string,
    @Headers('x-request-id') requestId: string,
    @Query('type') queryType?: string,
  ) {
    // MP sends data.id as query param "data.id", not "id"
    const queryDataId = req.query['data.id'] as string | undefined;
    const topic = queryType || body.type || body.topic;
    const resourceId =
      queryDataId || String(body.data ? body.data.id : body.id);

    const targetId = this.resolveTargetId(body.user_id);
    const webhookSecret = this.configService.get<string>('MP_WEBHOOK_SECRET');

    if (webhookSecret && signatureHeader) {
      this.validateSignature(
        signatureHeader,
        requestId,
        queryDataId || resourceId,
        webhookSecret,
      );
    }

    this.logger.log(
      `Webhook received — target: ${targetId}, topic: ${topic}, resourceId: ${resourceId}`,
    );

    if (topic && resourceId) {
      await this.webhooksService.handleNotification(
        topic,
        resourceId,
        targetId,
      );
    }

    return { received: true };
  }

  /**
   * Resolves the targetId by comparing body.user_id against the platform MP user ID.
   * - If it matches the platform user → 'platform'
   * - Falls back to 'platform' if no match
   */
  private resolveTargetId(userId?: string | number): string {
    if (!userId) {
      return 'platform';
    }

    const userIdStr = String(userId);

    const platformToken = this.configService.get<string>(
      'MP_PLATFORM_ACCESS_TOKEN',
    );
    if (platformToken) {
      const platformUserId = platformToken.split('-').pop();
      if (platformUserId === userIdStr) {
        return 'platform';
      }
    }

    this.logger.warn(
      `MP user_id ${userIdStr} does not match platform, defaulting to platform`,
    );
    return 'platform';
  }

  private validateSignature(
    signatureHeader: string,
    requestId: string,
    dataId: string,
    secret: string,
  ) {
    const parts = signatureHeader.split(',');
    const tsPart = parts.find((p) => p.startsWith('ts='));
    const v1Part = parts.find((p) => p.startsWith('v1='));

    if (!tsPart || !v1Part) {
      throw new BadRequestException('Invalid signature format');
    }

    const ts = tsPart.split('=')[1];
    const v1 = v1Part.split('=')[1];

    // Build manifest per MP docs: id:[data.id];request-id:[x-request-id];ts:[ts];
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const calculatedSignature = hmac.digest('hex');

    if (calculatedSignature !== v1) {
      throw new BadRequestException('Invalid signature');
    }
  }
}
