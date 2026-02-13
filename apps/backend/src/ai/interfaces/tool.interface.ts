import { Tool } from './llm-provider.interface';

/**
 * Re-export Tool types for convenience.
 */
export type { Tool } from './llm-provider.interface';

/**
 * Names of available AI tools.
 */
export type ToolName =
  | 'check_availability'
  | 'list_services'
  | 'book_appointment'
  | 'cancel_appointment'
  | 'get_customer_appointments'
  | 'update_customer_email'
  | 'generate_payment_link';

/**
 * Result from executing a tool.
 */
export interface ToolExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Context required for tool execution.
 */
export interface ToolExecutionContext {
  tenantId: string;
  customerId: string;
}

/**
 * Interface for tool implementations.
 */
export interface ITool {
  /** Tool name for the LLM */
  readonly name: ToolName;

  /** Get the tool definition for the LLM */
  getDefinition(): Tool;

  /** Execute the tool with given arguments */
  execute(
    args: Record<string, unknown>,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult>;
}

/**
 * Arguments for the update_customer_email tool.
 */
export interface UpdateCustomerEmailArgs {
  email: string;
}

/**
 * Arguments for the generate_payment_link tool.
 */
export interface GeneratePaymentLinkArgs {
  appointmentId: string;
}
