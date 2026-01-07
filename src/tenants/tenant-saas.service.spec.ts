import { Test, TestingModule } from '@nestjs/testing';
import { TenantSaasService } from './tenant-saas.service';
import { TenantRepository } from './tenant-repository.service';
import { MercadoPagoService } from '../payments/mercadopago.service';
import { PreApproval } from 'mercadopago';
import { NotFoundException } from '@nestjs/common';

jest.mock('mercadopago');

describe('TenantSaasService', () => {
  let service: TenantSaasService;
  let repo: TenantRepository;
  let mpService: MercadoPagoService;

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
      ],
    }).compile();

    service = module.get<TenantSaasService>(TenantSaasService);
    repo = module.get<TenantRepository>(TenantRepository);
    mpService = module.get<MercadoPagoService>(MercadoPagoService);
  });

  describe('createSubscription', () => {
    it('should throw NotFoundException if tenant not found', async () => {
      jest.spyOn(repo, 'findUnique').mockResolvedValue(null);

      await expect(service.createSubscription('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create a subscription and return initPoint', async () => {
      const mockTenant = {
        id: 't1',
        email: 't@t.com',
        saasPlan: { name: 'Gold', price: 100, interval: 'MONTHLY' },
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
      expect(mockPreApprovalCreate).toHaveBeenCalled();
    });
  });
});
