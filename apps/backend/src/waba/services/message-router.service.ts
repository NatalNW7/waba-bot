import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LLMOrchestratorService } from '../../ai/services/llm-orchestrator.service';
import { WebhookPayload, Message } from '../waba.interface';

export interface RouterResult {
  success: boolean;
  response?: string;
  error?: string;
  tenantId?: string;
  customerId?: string;
}

/**
 * Routes incoming WhatsApp messages to the appropriate handler (AI or fallback).
 */
@Injectable()
export class MessageRouterService {
  private readonly logger = new Logger(MessageRouterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmOrchestrator: LLMOrchestratorService,
  ) {}

  /**
   * Process an incoming WhatsApp webhook payload.
   */
  async routeMessage(payload: WebhookPayload): Promise<RouterResult> {
    try {
      // Extract message details from webhook payload
      const entry = payload.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;

      // Skip if no messages (status updates, etc.)
      if (!value?.messages || value.messages.length === 0) {
        return { success: true, response: 'No message to process' };
      }

      const message = value.messages[0];
      const phoneNumberId = value.metadata.phone_number_id;
      const customerPhone = message.from;

      // Get message text
      const messageText = this.extractMessageText(message);
      if (!messageText) {
        return { success: true, response: 'Non-text message, skipping AI' };
      }

      // Find tenant by phoneId
      const tenant = await this.findTenantByPhoneId(phoneNumberId);
      if (!tenant) {
        this.logger.warn(`No tenant found for phone ID: ${phoneNumberId}`);
        return {
          success: false,
          error: 'Tenant not found for this WhatsApp number',
        };
      }

      // Check if AI is enabled for this tenant
      if (!tenant.aiEnabled) {
        this.logger.debug(`AI disabled for tenant ${tenant.id}, skipping`);
        return {
          success: true,
          response: 'AI not enabled for this tenant',
          tenantId: tenant.id,
        };
      }

      // Process through AI
      this.logger.debug(`Routing message to AI for tenant ${tenant.id}`);
      const aiResult = await this.llmOrchestrator.processMessage({
        tenantId: tenant.id,
        customerPhone,
        messageText,
      });

      return {
        success: true,
        response: aiResult.response,
        tenantId: tenant.id,
      };
    } catch (error) {
      this.logger.error('Message routing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Extract text content from a WhatsApp message.
   */
  private extractMessageText(message: Message): string | null {
    if (message.type === 'text' && message.text?.body) {
      return message.text.body;
    }
    // Future: handle other message types (buttons, lists, etc.)
    return null;
  }

  /**
   * Find tenant by their WhatsApp phone ID.
   */
  private async findTenantByPhoneId(phoneId: string) {
    return this.prisma.tenant.findUnique({
      where: { phoneId },
      select: {
        id: true,
        name: true,
        aiEnabled: true,
        accessToken: true,
      },
    });
  }
}
