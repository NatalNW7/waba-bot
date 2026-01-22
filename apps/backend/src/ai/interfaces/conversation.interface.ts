/**
 * Represents a message in a conversation.
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

/**
 * Represents a tool/function call requested by the LLM.
 */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * Represents the result of executing a tool.
 */
export interface ToolResult {
  toolCallId: string;
  name: string;
  result: unknown;
  isError?: boolean;
}

/**
 * Context about the tenant for building prompts and processing.
 */
export interface TenantContext {
  tenantId: string;
  tenantName: string;
  phoneId: string;
  services: ServiceInfo[];
  operatingHours: OperatingHourInfo[];
}

/**
 * Simplified service info for prompt building.
 */
export interface ServiceInfo {
  id: string;
  name: string;
  price: number;
  duration: number;
}

/**
 * Simplified operating hours for prompt building.
 */
export interface OperatingHourInfo {
  day: string;
  startTime: string;
  endTime: string;
  isClosed: boolean;
}

/**
 * Context about the customer in the conversation.
 */
export interface CustomerContext {
  customerId: string;
  phone: string;
  name?: string;
}

/**
 * Full conversation context combining tenant and customer.
 */
export interface ConversationContext {
  conversationId: string;
  tenant: TenantContext;
  customer: CustomerContext;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}
