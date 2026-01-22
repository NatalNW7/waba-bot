import { Injectable, Logger } from '@nestjs/common';
import { GeminiProvider } from '../providers/gemini.provider';
import { ConversationService } from './conversation.service';
import { PromptBuilderService } from './prompt-builder.service';
import { ToolCoordinatorService } from './tool-coordinator.service';
import { AIAnalyticsService } from './ai-analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ConversationContext,
  ConversationMessage,
} from '../interfaces/conversation.interface';

/**
 * Input for processing a customer message.
 */
export interface ProcessMessageInput {
  tenantId: string;
  customerPhone: string;
  messageText: string;
}

/**
 * Result from processing a message.
 */
export interface ProcessMessageResult {
  response: string;
  conversationId: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
}

/**
 * Main orchestrator for AI message processing.
 * Coordinates between conversation context, prompt building, LLM, and tools.
 */
@Injectable()
export class LLMOrchestratorService {
  private readonly logger = new Logger(LLMOrchestratorService.name);

  constructor(
    private readonly geminiProvider: GeminiProvider,
    private readonly conversationService: ConversationService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly toolCoordinator: ToolCoordinatorService,
    private readonly analyticsService: AIAnalyticsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Process an incoming customer message and generate a response.
   */
  async processMessage(
    input: ProcessMessageInput,
  ): Promise<ProcessMessageResult> {
    const { tenantId, customerPhone, messageText } = input;

    this.logger.debug(
      `Processing message from ${customerPhone} for tenant ${tenantId}`,
    );

    // Get or create conversation context
    const context = await this.conversationService.getOrCreateContext(
      tenantId,
      customerPhone,
    );

    // Add user message to context
    const userMessage: ConversationMessage = {
      role: 'user',
      content: messageText,
    };
    this.conversationService.appendMessage(context, userMessage);

    // Build system prompt
    const systemPrompt = this.promptBuilder.buildSystemPrompt(context.tenant);

    // Get available tools
    const tools = this.toolCoordinator.hasTools()
      ? this.toolCoordinator.getToolDefinitions()
      : undefined;

    // Generate LLM response
    let response = await this.geminiProvider.generateResponse({
      messages: this.conversationService.getRecentMessages(context),
      systemPrompt,
      tools,
      tenantContext: context.tenant,
    });

    // Handle tool calls if present
    if (response.toolCalls && response.toolCalls.length > 0) {
      response = await this.handleToolCalls(context, response, systemPrompt);
    }

    // Extract final response text
    const responseText =
      response.content || 'Desculpe, não consegui processar sua mensagem.';

    // Add assistant message to context
    const assistantMessage: ConversationMessage = {
      role: 'assistant',
      content: responseText,
    };
    this.conversationService.appendMessage(context, assistantMessage);

    // Track usage (async, don't await)
    this.trackUsage(tenantId, response.usage).catch((err) => {
      this.logger.error('Failed to track AI usage:', err);
    });

    return {
      response: responseText,
      conversationId: context.conversationId,
      usage: {
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
      },
    };
  }

  private async handleToolCalls(
    context: ConversationContext,
    initialResponse: Awaited<ReturnType<GeminiProvider['generateResponse']>>,
    systemPrompt: string,
  ): Promise<Awaited<ReturnType<GeminiProvider['generateResponse']>>> {
    const toolCalls = initialResponse.toolCalls!;

    // Execute all tool calls
    const toolResults = await Promise.all(
      toolCalls.map(async (toolCall) => {
        const result = await this.toolCoordinator.executeToolCall(toolCall, {
          tenantId: context.tenant.tenantId,
          customerId: context.customer.customerId,
        });
        return {
          toolCallId: toolCall.id,
          name: toolCall.name,
          result: result.success ? result.data : { error: result.error },
          isError: !result.success,
        };
      }),
    );

    // Add tool results to context
    const toolMessage: ConversationMessage = {
      role: 'tool',
      content: JSON.stringify(toolResults),
      toolResults,
    };
    this.conversationService.appendMessage(context, toolMessage);

    // Generate follow-up response with tool results
    const followUpResponse = await this.geminiProvider.generateResponse({
      messages: this.conversationService.getRecentMessages(context),
      systemPrompt,
      tools: this.toolCoordinator.getToolDefinitions(),
      tenantContext: context.tenant,
    });

    return followUpResponse;
  }

  private async trackUsage(
    tenantId: string,
    usage: { promptTokens: number; completionTokens: number },
  ): Promise<void> {
    // Track to database via analytics service
    await this.analyticsService.trackUsage({
      tenantId,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      model: this.geminiProvider.getModelName(),
    });
  }
}
