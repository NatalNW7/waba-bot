import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { SubscriptionRepository } from './subscription-repository.service';
import { SubscriptionBillingService } from './subscription-billing.service';
import { CustomerSubscriptionService } from './customer-subscription.service';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let prisma: PrismaService;
  let repo: SubscriptionRepository;
  let billingService: SubscriptionBillingService;
  let customerSubService: CustomerSubscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn().mockImplementation((cb) => cb(prisma)),
            plan: {
              findUnique: jest.fn(),
            },
            customer: {
              findUnique: jest.fn(),
            },
            tenantCustomer: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            subscription: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: SubscriptionRepository,
          useValue: {
            findAll: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: SubscriptionBillingService,
          useValue: {
            calculateNextBilling: jest.fn(),
          },
        },
        {
          provide: CustomerSubscriptionService,
          useValue: {
            createMpSubscription: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    prisma = module.get<PrismaService>(PrismaService);
    repo = module.get<SubscriptionRepository>(SubscriptionRepository);
    billingService = module.get<SubscriptionBillingService>(
      SubscriptionBillingService,
    );
    customerSubService = module.get<CustomerSubscriptionService>(
      CustomerSubscriptionService,
    );
  });

  describe('create', () => {
    const createDto = {
      planId: 'plan-1',
      customerId: 'cust-1',
      nextBilling: '2025-02-01T00:00:00Z',
      cardTokenId: 'token-1',
    };

    const mockPlan = {
      id: 'plan-1',
      name: 'Plan 1',
      price: 100,
      tenantId: 'tenant-1',
      interval: 'MONTHLY',
    };

    const mockCustomer = {
      id: 'cust-1',
      email: 'c@c.com',
    };

    beforeEach(() => {
      (prisma.$transaction as jest.Mock).mockImplementation((cb) => cb(prisma));
      (prisma.plan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer);
      (prisma.tenantCustomer.findUnique as jest.Mock).mockResolvedValue({
        id: 'tc-1',
      });
      (customerSubService.createMpSubscription as jest.Mock).mockResolvedValue({
        id: 'mp-sub-789',
      });
      (billingService.calculateNextBilling as jest.Mock).mockReturnValue(
        new Date('2025-02-01T00:00:00Z'),
      );
    });

    it('should throw NotFoundException if plan not found', async () => {
      (prisma.plan.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if customer not found', async () => {
      (prisma.customer.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create subscription, link to MP and store externalId', async () => {
      (prisma.subscription.create as jest.Mock).mockResolvedValue({
        id: 'sub-1',
      });

      const result = await service.create(createDto);

      expect(customerSubService.createMpSubscription).toHaveBeenCalled();
      expect(prisma.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          externalId: 'mp-sub-789',
          tenantCustomerId: 'tc-1',
        }),
      });
      expect(result).toEqual({ id: 'sub-1' });
    });

    it('should calculate nextBilling if not provided', async () => {
      await service.create({
        ...createDto,
        nextBilling: undefined,
      });

      expect(billingService.calculateNextBilling).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should call repo.findAll', async () => {
      jest.spyOn(repo, 'findAll').mockResolvedValue([]);
      await service.findAll();
      expect(repo.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call repo.findUnique', async () => {
      jest.spyOn(repo, 'findUnique').mockResolvedValue({ id: '1' } as any);
      await service.findOne('1');
      expect(repo.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: undefined,
      });
    });
  });

  describe('update', () => {
    it('should call repo.update', async () => {
      jest.spyOn(repo, 'update').mockResolvedValue({ id: '1' } as any);
      await service.update('1', { status: 'ACTIVE' });
      expect(repo.update).toHaveBeenCalledWith('1', expect.anything());
    });
  });

  describe('remove', () => {
    it('should call repo.delete', async () => {
      jest.spyOn(repo, 'delete').mockResolvedValue({ id: '1' } as any);
      await service.remove('1');
      expect(repo.delete).toHaveBeenCalledWith('1');
    });
  });
});
