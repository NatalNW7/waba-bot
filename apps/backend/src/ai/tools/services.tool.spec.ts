import { Test, TestingModule } from '@nestjs/testing';
import { ListServicesTool } from './services.tool';
import { PrismaService } from '../../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('ListServicesTool', () => {
  let tool: ListServicesTool;
  let prisma: DeepMockProxy<PrismaService>;

  const mockServices = [
    {
      id: 'svc-1',
      name: 'Corte',
      price: 50,
      duration: 30,
      tenantId: 'tenant-123',
    },
    {
      id: 'svc-2',
      name: 'Barba',
      price: 25,
      duration: 15,
      tenantId: 'tenant-123',
    },
    {
      id: 'svc-3',
      name: 'Coloração',
      price: 150,
      duration: 90,
      tenantId: 'tenant-123',
    },
  ];

  beforeEach(async () => {
    prisma = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListServicesTool,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    tool = module.get<ListServicesTool>(ListServicesTool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDefinition', () => {
    it('should return correct tool definition', () => {
      const definition = tool.getDefinition();

      expect(definition.name).toBe('list_services');
      expect(definition.description).toContain('Lista todos os serviços');
      expect(definition.parameters.type).toBe('object');
    });
  });

  describe('execute', () => {
    it('should return all services for tenant', async () => {
      prisma.service.findMany.mockResolvedValue(mockServices as any);

      const result = await tool.execute(
        {},
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(true);
      expect(result.data?.services).toHaveLength(3);
      expect(result.data?.count).toBe(3);
    });

    it('should format prices correctly', async () => {
      prisma.service.findMany.mockResolvedValue(mockServices as any);

      const result = await tool.execute(
        {},
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.data?.services[0].price).toBe('R$ 50.00');
      expect(result.data?.services[1].price).toBe('R$ 25.00');
    });

    it('should format durations correctly', async () => {
      prisma.service.findMany.mockResolvedValue(mockServices as any);

      const result = await tool.execute(
        {},
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.data?.services[0].duration).toBe('30 minutos');
      expect(result.data?.services[2].duration).toBe('90 minutos');
    });

    it('should handle empty services list', async () => {
      prisma.service.findMany.mockResolvedValue([]);

      const result = await tool.execute(
        {},
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(true);
      expect(result.data?.services).toEqual([]);
      expect(result.data?.message).toContain('Nenhum serviço cadastrado');
    });

    it('should filter by tenant ID', async () => {
      prisma.service.findMany.mockResolvedValue([]);

      await tool.execute(
        {},
        { tenantId: 'tenant-456', customerId: 'customer-123' },
      );

      expect(prisma.service.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-456' },
        orderBy: { name: 'asc' },
      });
    });

    it('should handle database errors', async () => {
      prisma.service.findMany.mockRejectedValue(new Error('Database error'));

      const result = await tool.execute(
        {},
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });

    it('should include numeric price value for calculations', async () => {
      prisma.service.findMany.mockResolvedValue(mockServices as any);

      const result = await tool.execute(
        {},
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.data?.services[0].priceValue).toBe(50);
      expect(result.data?.services[0].durationMinutes).toBe(30);
    });
  });
});
