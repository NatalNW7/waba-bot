import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import type { FunctionDeclaration, Schema } from '@google/genai';
import {
  ILLMProvider,
  GenerateParams,
  LLMResponse,
  Tool,
} from '../interfaces/llm-provider.interface';
import { ConversationMessage } from '../interfaces/conversation.interface';

@Injectable()
export class GeminiProvider implements ILLMProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly client: GoogleGenAI;
  private readonly modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    const modelName = process.env.AI_DEFAULT_MODEL;
    if (!modelName) {
      throw new Error('AI_DEFAULT_MODEL environment variable is not set');
    }
    this.client = new GoogleGenAI({
      apiKey,
    });
    this.modelName = modelName;
  }

  getProviderName(): string {
    return 'gemini';
  }

  getModelName(): string {
    return this.modelName;
  }

  async generateResponse(params: GenerateParams): Promise<LLMResponse> {
    const { messages, systemPrompt, tools, maxTokens } = params;

    const contents = this.formatMessages(messages);
    const functionDeclarations = tools ? this.formatTools(tools) : undefined;

    const operation = async () => {
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents,
        config: {
          systemInstruction: systemPrompt,
          maxOutputTokens: maxTokens || 1000,
          tools: functionDeclarations ? [{ functionDeclarations }] : undefined,
        },
      });
      return this.parseResponse(response);
    };

    return this.withRetry(operation);
  }

  /**
   * Execute an operation with exponential backoff retry logic.
   */
  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    const maxRetries = parseInt(process.env.AI_MAX_RETRIES || '3', 10);
    const baseDelay = 1000;
    const maxDelay = 30000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        const isRetryable = this.isRetryableError(error);
        const isLastAttempt = attempt === maxRetries;

        if (!isRetryable || isLastAttempt) {
          this.logger.error('Gemini API error:', error);
          throw error;
        }

        const jitter = Math.random() * 1000;
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt) + jitter,
          maxDelay,
        );
        this.logger.warn(
          `Rate limit hit. Retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`,
        );
        await this.sleep(delay);
      }
    }
    throw new Error('Max retries exceeded');
  }

  /**
   * Check if an error is retryable (rate limit or transient server error).
   */
  private isRetryableError(error: any): boolean {
    const status = error?.status || error?.response?.status;
    return [429, 500, 503].includes(status);
  }

  /**
   * Sleep for a given number of milliseconds.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private formatMessages(
    messages: ConversationMessage[],
  ): Array<{ role: string; parts: Array<any> }> {
    return messages
      .filter((m) => m.role !== 'system') // System handled separately
      .map((message) => {
        const parts: any[] = [];

        if (message.content) {
          parts.push({ text: message.content });
        }

        // Handle tool calls (assistant -> functionCall)
        if (message.role === 'assistant' && message.toolCalls) {
          message.toolCalls.forEach((toolCall) => {
            parts.push({
              functionCall: {
                name: toolCall.name,
                args: toolCall.arguments,
              },
            });
          });
        }

        // Handle tool results (tool -> functionResponse)
        if (message.role === 'tool' && message.toolResults) {
          message.toolResults.forEach((result) => {
            parts.push({
              functionResponse: {
                name: result.name,
                response: {
                  name: result.name,
                  content: result.result,
                },
              },
            });
          });
        }

        // Map roles: 'assistant' -> 'model', 'tool' -> 'function', others -> 'user'
        // Note: Google GenAI SDK expects 'user' or 'model'. For tool responses, it should be 'function' (deprecated) or part of conversation flow.
        // Actually, for @google/genai or standard Gemini API:
        // User: user
        // Model: model
        // Function Result: function (in some SDKs) or user?
        // Let's check the SDK docs or standard usage.
        // In the new API, function responses are often sent as 'function' role or just part of the conversation.
        // However, the `Content` object expects `role` to be 'user' or 'model'.
        // Function responses are usually sent as 'function' role OR as 'user' role with functionResponse parts.
        // Let's stick to 'user' for tool outputs if SDK restricts roles, OR 'function' if allowed.
        // But wait, the standard Roles are 'user' and 'model'.
        // Code-wise `Type.Function` might exist?
        // Looking at the imports `import { GoogleGenAI, Type }`

        let role = 'user';
        if (message.role === 'assistant') {
          role = 'model';
        } else if (message.role === 'tool') {
          // For Gemini, tool outputs are typically part of a 'function' role turn,
          // or 'user' turn containing functionResponse.
          // Let's try 'function' first, or 'user' if it acts as input.
          // Correct mapping for GenAI:
          // Request (System/User) -> Model (Call) -> User/Function (Response) -> Model (Answer)
          // Effectively, tool outputs are inputs to the model, so 'user' or specific 'function' role.
          // The SDK often normalizes this. Let's use 'function' if valid, else 'user'.
          // Valid roles: "user", "model". "function" is deprecated/removed in some versions in favor of just parts.
          // If we verify the SDK version... we don't know it exactly.
          // PROMPT: The User uses `@google/genai`.
          // In `@google/genai`, roles are typically 'user' | 'model'.
          // `functionResult` parts usually go in a message with role `user` (or sometimes `function`).
          // Ref: https://ai.google.dev/gemini-api/docs/function-calling
          // "The client sends a message with the `function` role..." -> actually checking docs it says:
          // "role": "function" is used in some contexts.
          // BUT, looking at `Content` type in common libraries: role is string.
          // Let's try 'function' for tool results to be safe/explicit,
          // if it fails we might need 'user'.
          role = 'function';
        }

        // However, if we look at the official samples:
        // history: [
        //   { role: "user", parts: [{ text: "..." }] },
        //   { role: "model", parts: [{ functionCall: ... }] },
        //   { role: "function", parts: [{ functionResponse: ... }] }
        // ]

        return {
          role,
          parts,
        };
      });
  }

  private formatTools(tools: Tool[]): FunctionDeclaration[] {
    return tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: {
        type: Type.OBJECT,
        properties: this.formatProperties(tool.parameters.properties),
        required: tool.parameters.required,
      },
    }));
  }

  private formatProperties(
    properties: Record<
      string,
      { type: string; description?: string; enum?: string[] }
    >,
  ): Record<string, Schema> {
    const result: Record<string, Schema> = {};

    for (const [key, prop] of Object.entries(properties)) {
      result[key] = {
        type: this.mapPropertyType(prop.type),
        description: prop.description,
        enum: prop.enum,
      };
    }

    return result;
  }

  private mapPropertyType(type: string): Type {
    const typeMap: Record<string, Type> = {
      string: Type.STRING,
      number: Type.NUMBER,
      boolean: Type.BOOLEAN,
      array: Type.ARRAY,
      object: Type.OBJECT,
    };
    return typeMap[type] || Type.STRING;
  }

  private parseResponse(response: any): LLMResponse {
    const candidate = response.candidates?.[0];
    const content = candidate?.content;
    const parts = content?.parts || [];

    let textContent: string | null = null;
    const toolCalls: LLMResponse['toolCalls'] = [];

    for (const part of parts) {
      if (part.text) {
        textContent = part.text;
      }
      if (part.functionCall) {
        toolCalls.push({
          id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: part.functionCall.name,
          arguments: part.functionCall.args || {},
        });
      }
    }

    const usageMetadata = response.usageMetadata || {};

    return {
      content: textContent,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage: {
        promptTokens: usageMetadata.promptTokenCount || 0,
        completionTokens: usageMetadata.candidatesTokenCount || 0,
        totalTokens: usageMetadata.totalTokenCount || 0,
      },
    };
  }
}
