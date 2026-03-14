import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Queue } from 'bull';
import type { Response } from 'express';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
import { Public } from '../auth';

@ApiTags('WhatsApp Webhook')
@Controller('webhook/whatsapp')
export class WabaController {
  constructor(
    @InjectQueue('waba-messages') private readonly wabaQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Verify WhatsApp Webhook' })
  @ApiQuery({ name: 'hub.mode', required: true, type: String })
  @ApiQuery({ name: 'hub.challenge', required: true, type: String })
  @ApiQuery({ name: 'hub.verify_token', required: true, type: String })
  @ApiOkResponse({ description: 'Webhook verified successfully' })
  @ApiForbiddenResponse({ description: 'Verification failed' })
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string,
    @Res() res: Response,
  ): void {
    const verifyToken = this.configService.get<string>(
      'WABA_WEBHOOK_VERIFY_TOKEN',
    );

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('WEBHOOK VERIFIED');
      res.status(200).send(challenge);
    } else {
      throw new ForbiddenException('Webhook verification failed');
    }
  }

  /**
   * Receive and queue WhatsApp messages from Meta Webhook
   * @param body Webhook payload from Meta
   */
  @Public()
  @Post()
  @ApiOperation({ summary: 'WhatsApp Webhook' })
  @ApiCreatedResponse({
    description: 'Message received and queued successfully',
  })
  async handleMessage(@Body() body: WebhookPayloadDto) {
    await this.wabaQueue.add('process-message', body, {
      removeOnComplete: true,
    });
    return { status: 'Message queued' };
  }
}
