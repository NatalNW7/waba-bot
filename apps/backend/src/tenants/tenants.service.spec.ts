import { Test, TestingModule } from '@nestjs/testing';
import { TenantsService } from './tenants.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TenantRepository } from './tenant-repository.service';
import { TenantSaasService } from './tenant-saas.service';
import { TenantMpAuthService } from './tenant-mp-auth.service';

describe('TenantsService', () => {
  let service: TenantsService;
  let prisma: PrismaService;
  let repo: TenantRepository;
  let saasService: TenantSaasService;
  let mpAuthService: TenantMpAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: PrismaService,
          useValue: {
            saasPlan: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: TenantRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: TenantSaasService,
          useValue: {
            createSubscription: jest.fn(),
          },
        },
        {
          provide: TenantMpAuthService,
          useValue: {
            getMpAuthorizationUrl: jest.fn(),
            exchangeMpCode: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    prisma = module.get<PrismaService>(PrismaService);
    repo = module.get<TenantRepository>(TenantRepository);
    saasService = module.get<TenantSaasService>(TenantSaasService);
    mpAuthService = module.get<TenantMpAuthService>(TenantMpAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      name: 'Test Tenant',
      wabaId: 'waba123',
      phoneId: 'phone123',
      accessToken: 'token123',
      email: 'test@tenant.com',
      phone: '+1234567890',
      saasNextBilling: new Date().toISOString(),
      saasPaymentMethodId: 'pm_123',
      saasPlanId: 'plan123',
    };

    it('should throw BadRequestException if saasPlan does not exist', async () => {
      jest.spyOn(prisma.saasPlan, 'findUnique').mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException('this saas plan does not exists'),
      );
    });

    it('should create tenant if saasPlan exists', async () => {
      jest
        .spyOn(prisma.saasPlan, 'findUnique')
        .mockResolvedValue({ id: 'plan123' } as any);
      jest
        .spyOn(repo, 'create')
        .mockResolvedValue({ id: 'tenant123', ...createDto } as any);

      const result = await service.create(createDto);
      expect(result).toBeDefined();
      expect(repo.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('createSubscription', () => {
    it('should delegate to saasService', async () => {
      jest
        .spyOn(saasService, 'createSubscription')
        .mockResolvedValue({ initPoint: 'url' } as any);
      const result = await service.createSubscription('t1');
      expect(result.initPoint).toBe('url');
      expect(saasService.createSubscription).toHaveBeenCalledWith('t1');
    });
  });

  describe('getMpAuthorizationUrl', () => {
    it('should delegate to mpAuthService', () => {
      jest.spyOn(mpAuthService, 'getMpAuthorizationUrl').mockReturnValue('url');
      const result = service.getMpAuthorizationUrl('t1');
      expect(result).toBe('url');
      expect(mpAuthService.getMpAuthorizationUrl).toHaveBeenCalledWith('t1');
    });
  });

  describe('exchangeMpCode', () => {
    it('should delegate to mpAuthService', async () => {
      jest
        .spyOn(mpAuthService, 'exchangeMpCode')
        .mockResolvedValue({ id: 't1' } as any);
      await service.exchangeMpCode('code', 't1');
      expect(mpAuthService.exchangeMpCode).toHaveBeenCalledWith('code', 't1');
    });
  });

  describe('findOne', () => {
    it('should find tenant without inclusions if none provided', async () => {
      jest
        .spyOn(repo, 'findUnique')
        .mockResolvedValue({ id: 'tenant123', name: 'Test' } as any);

      const result = await service.findOne('tenant123');
      expect(result).toBeDefined();
      expect(repo.findUnique).toHaveBeenCalledWith({
        where: { id: 'tenant123' },
        include: undefined,
      });
    });
  });
});
