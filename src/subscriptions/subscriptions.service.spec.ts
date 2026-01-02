import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            plan: {
              findUnique: jest.fn(),
            },
            tenantCustomer: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            subscription: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    const createDto = {
      planId: 'plan-1',
      customerId: 'cust-1',
      nextBilling: '2025-02-01T00:00:00Z',
      cardTokenId: 'token-1',
    };

    it('should create subscription and link if link does not exist', async () => {
      // Mock transaction
      (prisma.$transaction as jest.Mock).mockImplementation((cb) => cb(prisma));

      // Mock Plan
      (prisma.plan.findUnique as jest.Mock).mockResolvedValue({
        id: 'plan-1',
        tenantId: 'tenant-1',
        interval: 'MONTHLY',
      });

      // Mock TenantCustomer (not found)
      (prisma.tenantCustomer.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.tenantCustomer.create as jest.Mock).mockResolvedValue({
        id: 'tc-1',
      });

      // Mock Subscription Create
      (prisma.subscription.create as jest.Mock).mockResolvedValue({
        id: 'sub-1',
      });

      const fixedNextBilling = '2025-02-01T00:00:00Z';
      const result = await service.create({
        ...createDto,
        nextBilling: fixedNextBilling,
      });

      expect(prisma.plan.findUnique).toHaveBeenCalledWith({
        where: { id: 'plan-1' },
      });
      expect(prisma.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          nextBilling: new Date(fixedNextBilling),
          tenantCustomerId: 'tc-1',
        }),
      });
      expect(result).toEqual({ id: 'sub-1' });
    });

    it('should calculate nextBilling for MONTHLY interval', async () => {
      (prisma.$transaction as jest.Mock).mockImplementation((cb) => cb(prisma));
      const startDate = new Date('2025-01-01T00:00:00Z');
      (prisma.plan.findUnique as jest.Mock).mockResolvedValue({
        id: 'p1',
        tenantId: 't1',
        interval: 'MONTHLY',
      });
      (prisma.tenantCustomer.findUnique as jest.Mock).mockResolvedValue({
        id: 'tc1',
      });

      await service.create({
        planId: 'p1',
        customerId: 'c1',
        cardTokenId: 'tok',
        startDate: startDate.toISOString(),
      });

      const expected = new Date(startDate);
      expected.setMonth(expected.getMonth() + 1);
      expect(prisma.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ nextBilling: expected }),
      });
    });

    it('should calculate nextBilling for QUARTERLY interval', async () => {
      (prisma.$transaction as jest.Mock).mockImplementation((cb) => cb(prisma));
      const startDate = new Date('2025-01-01T00:00:00Z');
      (prisma.plan.findUnique as jest.Mock).mockResolvedValue({
        id: 'p1',
        tenantId: 't1',
        interval: 'QUARTERLY',
      });
      (prisma.tenantCustomer.findUnique as jest.Mock).mockResolvedValue({
        id: 'tc1',
      });

      await service.create({
        planId: 'p1',
        customerId: 'c1',
        cardTokenId: 'tok',
        startDate: startDate.toISOString(),
      });

      const expected = new Date(startDate);
      expected.setMonth(expected.getMonth() + 3);
      expect(prisma.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ nextBilling: expected }),
      });
    });

    it('should calculate nextBilling for YEARLY interval', async () => {
      (prisma.$transaction as jest.Mock).mockImplementation((cb) => cb(prisma));
      const startDate = new Date('2025-01-01T00:00:00Z');
      (prisma.plan.findUnique as jest.Mock).mockResolvedValue({
        id: 'p1',
        tenantId: 't1',
        interval: 'YEARLY',
      });
      (prisma.tenantCustomer.findUnique as jest.Mock).mockResolvedValue({
        id: 'tc1',
      });

      await service.create({
        planId: 'p1',
        customerId: 'c1',
        cardTokenId: 'tok',
        startDate: startDate.toISOString(),
      });

      const expected = new Date(startDate);
      expected.setFullYear(expected.getFullYear() + 1);
      expect(prisma.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ nextBilling: expected }),
      });
    });

    it('should use current date if startDate is not provided', async () => {
      (prisma.$transaction as jest.Mock).mockImplementation((cb) => cb(prisma));
      (prisma.plan.findUnique as jest.Mock).mockResolvedValue({
        id: 'p1',
        tenantId: 't1',
        interval: 'MONTHLY',
      });
      (prisma.tenantCustomer.findUnique as jest.Mock).mockResolvedValue({
        id: 'tc1',
      });

      await service.create({
        planId: 'p1',
        customerId: 'c1',
        cardTokenId: 'tok',
      });

      expect(prisma.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          startDate: expect.any(Date),
          nextBilling: expect.any(Date),
        }),
      });
    });

    it('should throw NotFoundException if plan not found', async () => {
      (prisma.$transaction as jest.Mock).mockImplementation((cb) => cb(prisma));
      (prisma.plan.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
