import { Injectable, Logger } from '@nestjs/common';
import {
  ITool,
  ToolExecutionContext,
  ToolExecutionResult,
} from '../interfaces/tool.interface';
import { ToolCall } from '../interfaces/conversation.interface';

/**
 * Coordinates execution of LLM function calls/tools.
 * Currently a placeholder - actual tools will be added in Phase 2.
 */
@Injectable()
export class ToolCoordinatorService {
  private readonly logger = new Logger(ToolCoordinatorService.name);
  private readonly tools = new Map<string, ITool>();

  /**
   * Register a tool for use by the LLM.
   */
  registerTool(tool: ITool): void {
    this.tools.set(tool.name, tool);
    this.logger.log(`Registered tool: ${tool.name}`);
  }

  /**
   * Get all available tool definitions for the LLM.
   */
  getToolDefinitions(): ReturnType<ITool['getDefinition']>[] {
    return Array.from(this.tools.values()).map((t) => t.getDefinition());
  }

  /**
   * Execute a tool call from the LLM.
   */
  async executeToolCall(
    toolCall: ToolCall,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult> {
    const tool = this.tools.get(toolCall.name);

    if (!tool) {
      this.logger.warn(`Unknown tool called: ${toolCall.name}`);
      return {
        success: false,
        error: `Ferramenta desconhecida: ${toolCall.name}`,
      };
    }

    try {
      this.logger.debug(`Executing tool: ${toolCall.name}`, toolCall.arguments);
      const result = await tool.execute(toolCall.arguments, context);
      return result;
    } catch (error) {
      this.logger.error(`Tool execution failed: ${toolCall.name}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao executar ação',
      };
    }
  }

  /**
   * Check if any tools are registered.
   */
  hasTools(): boolean {
    return this.tools.size > 0;
  }
}
