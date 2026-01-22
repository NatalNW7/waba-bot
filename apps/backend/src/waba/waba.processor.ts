import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { WebhookPayload } from './waba.interface';
import { MessageRouterService } from './services/message-router.service';
import { MessageFormatterService } from './services/message-formatter.service';
import WabaAPI from './waba.api';

@Processor('waba-messages')
export class WabaProcessor {
  private readonly logger = new Logger(WabaProcessor.name);

  constructor(
    private readonly messageRouter: MessageRouterService,
    private readonly messageFormatter: MessageFormatterService,
  ) {}

  @Process('process-message')
  async handleProcessMessage(job: Job<WebhookPayload>) {
    const data = job.data;

    try {
      this.logger.debug('Processing incoming WhatsApp message');

      // Extract message details for response
      const entry = data.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;

      // Skip if no messages
      if (!value?.messages || value.messages.length === 0) {
        this.logger.debug('No message in payload, skipping');
        return;
      }

      const phoneId = value.metadata.phone_number_id;
      const customerPhone = value.messages[0].from;

      // Route through AI
      const result = await this.messageRouter.routeMessage(data);

      if (!result.success) {
        this.logger.warn(`Message routing failed: ${result.error}`);
        // Could send error message to user here
        return;
      }

      // Skip if no response (e.g., non-text message or AI disabled)
      if (
        !result.response ||
        result.response.includes('skipping') ||
        result.response.includes('not enabled')
      ) {
        this.logger.debug(`Skipping response: ${result.response}`);
        return;
      }

      // Format and send the response
      const formattedResponse = this.messageFormatter.formatForWhatsApp(
        result.response,
      );
      const wabaApi = WabaAPI();

      this.logger.debug(`Sending AI response to ${customerPhone}`);
      const sendResult = await wabaApi.sendMessage(
        phoneId,
        customerPhone,
        formattedResponse,
      );

      if (sendResult.error) {
        this.logger.error('Failed to send WhatsApp message:', sendResult);
      } else {
        this.logger.log(`AI response sent successfully to ${customerPhone}`);
      }
    } catch (error) {
      this.logger.error('Error processing message:', error);

      // Attempt to send error message to user
      try {
        const entry = data.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;

        if (value?.messages?.[0]) {
          const phoneId = value.metadata.phone_number_id;
          const customerPhone = value.messages[0].from;
          const wabaApi = WabaAPI();
          const errorMessage = this.messageFormatter.formatErrorMessage();

          await wabaApi.sendMessage(phoneId, customerPhone, errorMessage);
        }
      } catch (sendError) {
        this.logger.error('Failed to send error message:', sendError);
      }
    }
  }
}
