import { Test, TestingModule } from '@nestjs/testing';
import { ToolCoordinatorService } from './tool-coordinator.service';
import {
  ITool,
  ToolExecutionResult,
  ToolName,
} from '../interfaces/tool.interface';
import { Tool } from '../interfaces/llm-provider.interface';

// Mock tool for testing
class MockTool implements ITool {
  readonly name: ToolName = 'list_services';
  private shouldFail = false;

  constructor(config?: { shouldFail?: boolean }) {
    if (config?.shouldFail) this.shouldFail = true;
  }

  getDefinition(): Tool {
    return {
      name: this.name,
      description: 'Mock tool for testing',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    };
  }

  async execute(): Promise<ToolExecutionResult> {
    if (this.shouldFail) {
      throw new Error('Mock tool error');
    }
    return { success: true, data: { mock: 'data' } };
  }
}

describe('ToolCoordinatorService', () => {
  let service: ToolCoordinatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ToolCoordinatorService],
    }).compile();

    service = module.get<ToolCoordinatorService>(ToolCoordinatorService);
  });

  describe('registerTool', () => {
    it('should register a tool successfully', () => {
      const mockTool = new MockTool();

      service.registerTool(mockTool);

      expect(service.hasTools()).toBe(true);
    });

    it('should allow multiple tools to be registered', () => {
      const tool1 = new MockTool();

      // Create a second mock tool with different name
      class MockTool2 implements ITool {
        readonly name: ToolName = 'check_availability';
        getDefinition(): Tool {
          return {
            name: this.name,
            description: 'Second mock tool',
            parameters: { type: 'object', properties: {}, required: [] },
          };
        }
        async execute(): Promise<ToolExecutionResult> {
          return { success: true, data: {} };
        }
      }

      const tool2 = new MockTool2();

      service.registerTool(tool1);
      service.registerTool(tool2);

      expect(service.getToolDefinitions()).toHaveLength(2);
    });
  });

  describe('getToolDefinitions', () => {
    it('should return empty array when no tools registered', () => {
      expect(service.getToolDefinitions()).toEqual([]);
    });

    it('should return tool definitions', () => {
      service.registerTool(new MockTool());

      const definitions = service.getToolDefinitions();

      expect(definitions).toHaveLength(1);
      expect(definitions[0].name).toBe('list_services');
      expect(definitions[0].description).toBe('Mock tool for testing');
    });
  });

  describe('hasTools', () => {
    it('should return false when no tools registered', () => {
      expect(service.hasTools()).toBe(false);
    });

    it('should return true when tools are registered', () => {
      service.registerTool(new MockTool());
      expect(service.hasTools()).toBe(true);
    });
  });

  describe('executeToolCall', () => {
    it('should execute registered tool successfully', async () => {
      service.registerTool(new MockTool());

      const result = await service.executeToolCall(
        { id: 'call-123', name: 'list_services', arguments: {} },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ mock: 'data' });
    });

    it('should return error for unknown tool', async () => {
      const result = await service.executeToolCall(
        { id: 'call-123', name: 'unknown_tool', arguments: {} },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('desconhecida');
    });

    it('should handle tool execution errors', async () => {
      service.registerTool(new MockTool({ shouldFail: true }));

      const result = await service.executeToolCall(
        { id: 'call-123', name: 'list_services', arguments: {} },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Mock tool error');
    });
  });
});
