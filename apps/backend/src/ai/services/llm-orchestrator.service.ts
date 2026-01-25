import { Injectable, Logger } from '@nestjs/common';
import { GeminiProvider } from '../providers/gemini.provider';
import { ConversationService } from './conversation.service';
import { PromptBuilderService } from './prompt-builder.service';
import { ToolCoordinatorService } from './tool-coordinator.service';
import { AIAnalyticsService } from './ai-analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConversationMessage } from '../interfaces/conversation.interface';

/**
 * Input for processing a customer message.
 */
export interface ProcessMessageInput {
  tenantId: string;
  customerInfo: {
    name: string;
    phone: string;
  };
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
    const { tenantId, customerInfo, messageText } = input;

    this.logger.debug(
      `Processing message from ${customerInfo.phone} for tenant ${tenantId}`,
    );

    // Get or create conversation context
    const context = await this.conversationService.getOrCreateContext(
      tenantId,
      customerInfo,
    );

    // Add user message to context
    const userMessage: ConversationMessage = {
      role: 'user',
      content: messageText,
    };
    this.conversationService.appendMessage(context, userMessage);

    // Build system prompt
    const systemPrompt = this.promptBuilder.buildSystemPrompt(
      context.tenant,
      context.customer,
    );
    this.logger.debug(`System prompt lengths: ${systemPrompt.length}`);

    // Get available tools
    const tools = this.toolCoordinator.hasTools()
      ? this.toolCoordinator.getToolDefinitions()
      : undefined;

    let response: Awaited<ReturnType<GeminiProvider['generateResponse']>>;
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    // Recursive loop for handling function calls
    while (iterations < MAX_ITERATIONS) {
      iterations++;

      // Generate LLM response
      response = await this.geminiProvider.generateResponse({
        messages: this.conversationService.getRecentMessages(context),
        systemPrompt,
        tools,
        tenantContext: context.tenant,
      });

      // Check for tool calls
      if (response.toolCalls && response.toolCalls.length > 0) {
        this.logger.debug(
          `Received ${response.toolCalls.length} tool calls (Iteration ${iterations})`,
        );

        // Add assistant message with tool calls to history
        const assistantMessage: ConversationMessage = {
          role: 'assistant',
          content: response.content || '', // Content might be empty if just tool calls
          toolCalls: response.toolCalls,
        };
        this.conversationService.appendMessage(context, assistantMessage);

        // Execute tools
        const toolResults = await Promise.all(
          response.toolCalls.map(async (toolCall) => {
            const result = await this.toolCoordinator.executeToolCall(
              toolCall,
              {
                tenantId: context.tenant.tenantId,
                customerId: context.customer.customerId,
              },
            );
            return {
              toolCallId: toolCall.id,
              name: toolCall.name,
              result: result.success ? result.data : { error: result.error },
              isError: !result.success,
            };
          }),
        );

        // Add tool results to history
        const toolMessage: ConversationMessage = {
          role: 'tool',
          content: JSON.stringify(toolResults), // For fallback/logging
          toolResults, // For provider formatting
        };
        this.conversationService.appendMessage(context, toolMessage);

        // Loop continues to feed results back to AI
        continue;
      }

      // If no tool calls, we have the final text response
      break;
    }

    if (iterations >= MAX_ITERATIONS) {
      this.logger.warn(
        `Max iterations (${MAX_ITERATIONS}) reached for conversation ${context.conversationId}`,
      );
      // Fallback: use the last response content or a safe error message
      if (!response! || (!response.content && !response.toolCalls)) {
        return {
          response:
            'Desculpe, estou tendo dificuldades para processar seu pedido no momento.',
          conversationId: context.conversationId,
          usage: { promptTokens: 0, completionTokens: 0 },
        };
      }
    }

    // Extract final response text and clean internal tags
    let responseText =
      response!.content || 'Desculpe, não consegui processar sua mensagem.';

    // Remove <reasoning> blocks and markdown reasoning blocks
    responseText = responseText
      .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
      .replace(/```reasoning[\s\S]*?```/gi, '')
      .trim();

    // Add final assistant message to context
    const assistantMessage: ConversationMessage = {
      role: 'assistant',
      content: responseText,
    };
    this.conversationService.appendMessage(context, assistantMessage);

    // Track usage (async, don't await) specific only for final turn or aggregate?
    // Ideally we track total usage, but provider returns usage per turn.
    // For now, we track the last turn's usage.
    this.trackUsage(tenantId, response!.usage).catch((err) => {
      this.logger.error('Failed to track AI usage:', err);
    });

    return {
      response: responseText,
      conversationId: context.conversationId,
      usage: {
        promptTokens: response!.usage.promptTokens,
        completionTokens: response!.usage.completionTokens,
      },
    };
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
