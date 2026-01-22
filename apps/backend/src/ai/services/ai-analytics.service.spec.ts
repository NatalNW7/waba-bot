import { Test, TestingModule } from '@nestjs/testing';
import { AIAnalyticsService } from './ai-analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('AIAnalyticsService', () => {
  let service: AIAnalyticsService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prisma = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIAnalyticsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AIAnalyticsService>(AIAnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('trackUsage', () => {
    it('should create AI usage record in database', async () => {
      prisma.aIUsage.create.mockResolvedValue({
        id: 'usage-123',
        tenantId: 'tenant-123',
        promptTokens: 100,
        completionTokens: 50,
        model: 'gemini-1.5-flash',
        billingMonth: '2026-01',
        createdAt: new Date(),
      } as any);

      await service.trackUsage({
        tenantId: 'tenant-123',
        promptTokens: 100,
        completionTokens: 50,
        model: 'gemini-1.5-flash',
      });

      expect(prisma.aIUsage.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 'tenant-123',
          promptTokens: 100,
          completionTokens: 50,
          model: 'gemini-1.5-flash',
          billingMonth: expect.stringMatching(/^\d{4}-\d{2}$/),
        }),
      });
    });

    it('should not throw on database error', async () => {
      prisma.aIUsage.create.mockRejectedValue(new Error('DB Error'));

      await expect(
        service.trackUsage({
          tenantId: 'tenant-123',
          promptTokens: 100,
          completionTokens: 50,
          model: 'gemini-1.5-flash',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('getUsageSummary', () => {
    it('should return usage summary for tenant', async () => {
      prisma.aIUsage.aggregate.mockResolvedValue({
        _sum: {
          promptTokens: 10000,
          completionTokens: 5000,
        },
        _count: {
          id: 150,
        },
      } as any);

      const summary = await service.getUsageSummary('tenant-123', '2026-01');

      expect(summary).toEqual({
        tenantId: 'tenant-123',
        billingMonth: '2026-01',
        totalPromptTokens: 10000,
        totalCompletionTokens: 5000,
        totalConversations: 150,
        estimatedCost: expect.any(Number),
      });
    });

    it('should calculate cost correctly for Gemini 1.5 Flash', async () => {
      prisma.aIUsage.aggregate.mockResolvedValue({
        _sum: {
          promptTokens: 1000000, // 1M tokens
          completionTokens: 1000000, // 1M tokens
        },
        _count: { id: 100 },
      } as any);

      const summary = await service.getUsageSummary('tenant-123');

      // Gemini 1.5 Flash: $0.075/1M prompt + $0.30/1M completion
      const expectedCost = 0.075 + 0.3;
      expect(summary.estimatedCost).toBeCloseTo(expectedCost, 4);
    });

    it('should handle zero usage', async () => {
      prisma.aIUsage.aggregate.mockResolvedValue({
        _sum: {
          promptTokens: null,
          completionTokens: null,
        },
        _count: { id: 0 },
      } as any);

      const summary = await service.getUsageSummary('tenant-123');

      expect(summary.totalPromptTokens).toBe(0);
      expect(summary.totalCompletionTokens).toBe(0);
      expect(summary.totalConversations).toBe(0);
      expect(summary.estimatedCost).toBe(0);
    });

    it('should use current month if not specified', async () => {
      prisma.aIUsage.aggregate.mockResolvedValue({
        _sum: { promptTokens: 1000, completionTokens: 500 },
        _count: { id: 10 },
      } as any);

      await service.getUsageSummary('tenant-123');

      const now = new Date();
      const expectedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      expect(prisma.aIUsage.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            billingMonth: expectedMonth,
          }),
        }),
      );
    });
  });

  describe('getAllTenantsUsage', () => {
    it('should return usage summary for all tenants', async () => {
      prisma.aIUsage.groupBy.mockResolvedValue([
        {
          tenantId: 'tenant-1',
          _sum: { promptTokens: 5000, completionTokens: 2500 },
          _count: { id: 50 },
        },
        {
          tenantId: 'tenant-2',
          _sum: { promptTokens: 3000, completionTokens: 1500 },
          _count: { id: 30 },
        },
      ] as any);

      const summaries = await service.getAllTenantsUsage('2026-01');

      expect(summaries).toHaveLength(2);
      expect(summaries[0].tenantId).toBe('tenant-1');
      expect(summaries[0].totalPromptTokens).toBe(5000);
      expect(summaries[1].tenantId).toBe('tenant-2');
      expect(summaries[1].totalPromptTokens).toBe(3000);
    });

    it('should return empty array when no usage', async () => {
      prisma.aIUsage.groupBy.mockResolvedValue([]);

      const summaries = await service.getAllTenantsUsage();

      expect(summaries).toEqual([]);
    });
  });

  describe('getDailyUsage', () => {
    it('should return daily breakdown', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      prisma.aIUsage.findMany.mockResolvedValue([
        { promptTokens: 100, completionTokens: 50, createdAt: today },
        { promptTokens: 200, completionTokens: 100, createdAt: today },
        { promptTokens: 150, completionTokens: 75, createdAt: yesterday },
      ] as any);

      const daily = await service.getDailyUsage('tenant-123', 7);

      expect(daily).toHaveLength(2);

      const todayData = daily.find(
        (d: any) => d.date === today.toISOString().split('T')[0],
      );
      expect(todayData?.promptTokens).toBe(300);
      expect(todayData?.completionTokens).toBe(150);
      expect(todayData?.count).toBe(2);
    });

    it('should filter by days parameter', async () => {
      prisma.aIUsage.findMany.mockResolvedValue([]);

      await service.getDailyUsage('tenant-123', 14);

      const expectedStartDate = new Date();
      expectedStartDate.setDate(expectedStartDate.getDate() - 14);
      expectedStartDate.setHours(0, 0, 0, 0);

      expect(prisma.aIUsage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-123',
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        }),
      );
    });
  });
});
