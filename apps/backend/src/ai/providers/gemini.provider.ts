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

    this.client = new GoogleGenAI({ apiKey });
    this.modelName = process.env.AI_DEFAULT_MODEL || 'gemini-1.5-flash';
  }

  getProviderName(): string {
    return 'gemini';
  }

  getModelName(): string {
    return this.modelName;
  }

  async generateResponse(params: GenerateParams): Promise<LLMResponse> {
    const { messages, systemPrompt, tools, maxTokens } = params;

    try {
      const contents = this.formatMessages(messages);
      const functionDeclarations = tools ? this.formatTools(tools) : undefined;

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
    } catch (error) {
      this.logger.error('Gemini API error:', error);
      throw error;
    }
  }

  private formatMessages(
    messages: ConversationMessage[],
  ): Array<{ role: string; parts: Array<{ text: string }> }> {
    return messages
      .filter((m) => m.role !== 'system') // System handled separately
      .map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      }));
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
