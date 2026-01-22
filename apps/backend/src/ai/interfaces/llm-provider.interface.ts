import {
  ConversationMessage,
  TenantContext,
  ToolCall,
} from './conversation.interface';

/**
 * Response from any LLM provider.
 */
export interface LLMResponse {
  /** Text content of the response (null if only tool calls) */
  content: string | null;
  /** Tool/function calls requested by the model */
  toolCalls?: ToolCall[];
  /** Token usage for billing/tracking */
  usage: TokenUsage;
  /** Provider-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Token usage information for cost tracking.
 */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Parameters for generating an LLM response.
 */
export interface GenerateParams {
  /** Conversation history */
  messages: ConversationMessage[];
  /** System prompt with instructions */
  systemPrompt: string;
  /** Available tools/functions */
  tools?: Tool[];
  /** Tenant context for logging/tracking */
  tenantContext: TenantContext;
  /** Maximum tokens to generate */
  maxTokens?: number;
}

/**
 * Definition of a tool/function the LLM can call.
 */
export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameters;
}

/**
 * JSON Schema-like parameter definition for tools.
 */
export interface ToolParameters {
  type: 'object';
  properties: Record<string, ToolProperty>;
  required?: string[];
}

/**
 * Individual property definition for tool parameters.
 */
export interface ToolProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  enum?: string[];
  items?: ToolProperty;
}

/**
 * Abstract interface for LLM providers.
 * Implementations: GeminiProvider, (future: OpenAIProvider)
 */
export interface ILLMProvider {
  /**
   * Generate a response from the LLM.
   */
  generateResponse(params: GenerateParams): Promise<LLMResponse>;

  /**
   * Get the provider name for logging/tracking.
   */
  getProviderName(): string;

  /**
   * Get the model name being used.
   */
  getModelName(): string;
}
