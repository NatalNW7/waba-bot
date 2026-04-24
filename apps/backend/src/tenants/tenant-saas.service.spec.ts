import { Test, TestingModule } from '@nestjs/testing';
import { TenantSaasService } from './tenant-saas.service';
import { TenantRepository } from './tenant-repository.service';
import { MercadoPagoService } from '../payments/mercadopago.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PreApproval, PreApprovalPlan } from 'mercadopago';
import { NotFoundException, BadRequestException } from '@nestjs/common';

jest.mock('mercadopago');

describe('TenantSaasService', () => {
  let service: TenantSaasService;
  let repo: TenantRepository;
  let prisma: PrismaService;

  const configValues: Record<string, string> = {
    MP_BACK_URL: 'http://localhost:8080/dashboard/settings/finance',
    NODE_ENV: 'test',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantSaasService,
        {
          provide: TenantRepository,
          useValue: {
            findUnique: jest.fn(),
            update: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: MercadoPagoService,
          useValue: {
            getPlatformClient: jest.fn().mockReturnValue({}),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            saasPlan: {
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => configValues[key]),
          },
        },
      ],
    }).compile();

    service = module.get<TenantSaasService>(TenantSaasService);
    repo = module.get<TenantRepository>(TenantRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // -------------------------------------------------------
  // syncPlansWithMercadoPago
  // -------------------------------------------------------
  describe('syncPlansWithMercadoPago', () => {
    it('should skip when all plans are already synced', async () => {
      (prisma.saasPlan.findMany as jest.Mock).mockResolvedValue([]);

      await service.syncPlansWithMercadoPago();

      expect(prisma.saasPlan.findMany).toHaveBeenCalledWith({
        where: { mpPlanId: null },
      });
      // No PreApprovalPlan calls should have been made
      expect(PreApprovalPlan).not.toHaveBeenCalled();
    });

    it('should create MP plans for un-synced SaaS plans', async () => {
      const unsyncedPlans = [
        {
          id: 'starter-monthly',
          name: 'Starter',
          price: 49,
          interval: 'MONTHLY',
          mpPlanId: null,
        },
      ];
      (prisma.saasPlan.findMany as jest.Mock).mockResolvedValue(unsyncedPlans);

      const mockCreate = jest.fn().mockResolvedValue({
        id: 'mp-plan-abc',
      });
      (PreApprovalPlan as jest.Mock).mockImplementation(() => ({
        create: mockCreate,
      }));

      await service.syncPlansWithMercadoPago();

      expect(mockCreate).toHaveBeenCalledWith({
        body: {
          reason: 'Assinatura SaaS - Starter (MONTHLY)',
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: 49,
            currency_id: 'BRL',
          },
          back_url: 'http://localhost:8080/dashboard/settings/finance',
        },
      });

      expect(prisma.saasPlan.update).toHaveBeenCalledWith({
        where: { id: 'starter-monthly' },
        data: { mpPlanId: 'mp-plan-abc' },
      });
    });

    it('should throw when MP_BACK_URL is not configured', async () => {
      const unsyncedPlans = [
        {
          id: 'starter-monthly',
          name: 'Starter',
          price: 49,
          interval: 'MONTHLY',
          mpPlanId: null,
        },
      ];
      (prisma.saasPlan.findMany as jest.Mock).mockResolvedValue(unsyncedPlans);

      // Remove MP_BACK_URL from config
      const configService = service['configService'] as any;
      configService.get.mockImplementation((key: string) => {
        if (key === 'MP_BACK_URL') return undefined;
        return configValues[key];
      });

      await expect(service.syncPlansWithMercadoPago()).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // -------------------------------------------------------
  // createSubscription
  // -------------------------------------------------------
  describe('createSubscription', () => {
    it('should throw NotFoundException if tenant not found', async () => {
      jest.spyOn(repo, 'findUnique').mockResolvedValue(null);

      await expect(service.createSubscription('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should sync plans and retry subscription if saasPlan has no mpPlanId', async () => {
      const mockTenantWithoutPlan = {
        id: 't1',
        email: 't@t.com',
        saasPlan: {
          id: 'plan-1',
          name: 'Gold',
          price: 100,
          interval: 'MONTHLY',
          mpPlanId: null,
        },
      };

      const mockTenantWithPlan = {
        ...mockTenantWithoutPlan,
        saasPlan: {
          ...mockTenantWithoutPlan.saasPlan,
          mpPlanId: 'mp-plan-xyz',
        },
      };

      jest
        .spyOn(repo, 'findUnique')
        .mockResolvedValueOnce(mockTenantWithoutPlan as any)
        .mockResolvedValueOnce(mockTenantWithPlan as any);

      const syncSpy = jest
        .spyOn(service, 'syncPlansWithMercadoPago')
        .mockResolvedValue();

      const mockPreApprovalCreate = jest.fn().mockResolvedValue({
        init_point: 'http://mp.com/pay',
        id: 'mp-sub-123',
      });
      (PreApproval as jest.Mock).mockImplementation(() => ({
        create: mockPreApprovalCreate,
      }));

      const result = await service.createSubscription('t1');

      expect(syncSpy).toHaveBeenCalled();
      expect(result.initPoint).toBe('http://mp.com/pay');
      expect(result.externalId).toBe('mp-sub-123');
    });

    it('should create a subscription using preapproval_plan_id and return initPoint (without cardTokenId)', async () => {
      const mockTenant = {
        id: 't1',
        email: 't@t.com',
        saasPlan: {
          id: 'plan-1',
          name: 'Gold',
          price: 100,
          interval: 'MONTHLY',
          mpPlanId: 'mp-plan-xyz',
        },
      };
      jest.spyOn(repo, 'findUnique').mockResolvedValue(mockTenant as any);

      const mockPreApprovalCreate = jest.fn().mockResolvedValue({
        init_point: 'http://mp.com/pay',
        id: 'mp-sub-123',
      });
      (PreApproval as jest.Mock).mockImplementation(() => ({
        create: mockPreApprovalCreate,
      }));

      const result = await service.createSubscription('t1');

      expect(result.initPoint).toBe('http://mp.com/pay');
      expect(result.externalId).toBe('mp-sub-123');
      expect(mockPreApprovalCreate).toHaveBeenCalledWith({
        body: {
          preapproval_plan_id: 'mp-plan-xyz',
          reason: 'Assinatura SaaS - Gold',
          back_url: 'http://localhost:8080/dashboard/settings/finance',
          external_reference: 't1',
          status: 'pending',
          payer_email: undefined,
        },
      });
      // payer_email should always be present in the body (value comes from caller)
      const callBody = mockPreApprovalCreate.mock.calls[0][0].body;
      expect(callBody).toHaveProperty('payer_email');
      expect(callBody).not.toHaveProperty('auto_recurring');
    });

    it('should create a subscription with card_token_id and status authorized when provided', async () => {
      const mockTenant = {
        id: 't2',
        email: 't2@t.com',
        saasPlan: {
          id: 'plan-2',
          name: 'Pro',
          price: 200,
          interval: 'MONTHLY',
          mpPlanId: 'mp-plan-abc',
        },
      };
      jest.spyOn(repo, 'findUnique').mockResolvedValue(mockTenant as any);

      const mockPreApprovalCreate = jest.fn().mockResolvedValue({
        init_point: 'http://mp.com/pay2',
        id: 'mp-sub-456',
      });
      (PreApproval as jest.Mock).mockImplementation(() => ({
        create: mockPreApprovalCreate,
      }));

      const result = await service.createSubscription(
        't2',
        'token-123',
        'payer@test.com',
      );

      expect(result.initPoint).toBe('http://mp.com/pay2');
      expect(result.externalId).toBe('mp-sub-456');
      expect(mockPreApprovalCreate).toHaveBeenCalledWith({
        body: {
          preapproval_plan_id: 'mp-plan-abc',
          reason: 'Assinatura SaaS - Pro',
          back_url: 'http://localhost:8080/dashboard/settings/finance',
          external_reference: 't2',
          status: 'authorized',
          card_token_id: 'token-123',
          payer_email: 'payer@test.com',
        },
      });
    });
  });

  // -------------------------------------------------------
  // calculateNextBilling
  // -------------------------------------------------------
  describe('calculateNextBilling', () => {
    it('should return 1 month ahead for MONTHLY', () => {
      const result = service.calculateNextBilling('MONTHLY');
      expect(result.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return 3 months ahead for QUARTERLY', () => {
      const result = service.calculateNextBilling('QUARTERLY');
      const threeMonths = new Date();
      threeMonths.setMonth(threeMonths.getMonth() + 3);
      // Allow 5-second tolerance
      expect(Math.abs(result.getTime() - threeMonths.getTime())).toBeLessThan(
        5000,
      );
    });

    it('should return 1 year ahead for YEARLY', () => {
      const result = service.calculateNextBilling('YEARLY');
      const oneYear = new Date();
      oneYear.setFullYear(oneYear.getFullYear() + 1);
      expect(Math.abs(result.getTime() - oneYear.getTime())).toBeLessThan(5000);
    });
  });
});
