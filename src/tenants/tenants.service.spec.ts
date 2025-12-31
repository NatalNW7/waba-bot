import { Test, TestingModule } from '@nestjs/testing';
import { TenantsService } from './tenants.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('TenantsService', () => {
  let service: TenantsService;
  let prisma: PrismaService;

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
            tenant: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    prisma = module.get<PrismaService>(PrismaService);
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
      saasPlanId: 'plan123',
    };

    it('should throw BadRequestException if saasPlan does not exist', async () => {
      jest.spyOn(prisma.saasPlan, 'findUnique').mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException('this saas plan does not exists'),
      );
    });

    it('should create tenant if saasPlan exists', async () => {
      jest.spyOn(prisma.saasPlan, 'findUnique').mockResolvedValue({ id: 'plan123' } as any);
      jest.spyOn(prisma.tenant, 'create').mockResolvedValue({ id: 'tenant123', ...createDto } as any);

      const result = await service.create(createDto);
      expect(result).toBeDefined();
      expect(prisma.tenant.create).toHaveBeenCalledWith({ data: createDto });
    });

    it('should create tenant if no saasPlanId is provided', async () => {
      const dtoNoPlan = { ...createDto, saasPlanId: undefined };
      jest.spyOn(prisma.tenant, 'create').mockResolvedValue({ id: 'tenant123', ...dtoNoPlan } as any);

      const result = await service.create(dtoNoPlan);
      expect(result).toBeDefined();
      expect(prisma.saasPlan.findUnique).not.toHaveBeenCalled();
      expect(prisma.tenant.create).toHaveBeenCalledWith({ data: dtoNoPlan });
    });
  });

  describe('findOne', () => {
    it('should find tenant without inclusions if none provided', async () => {
      jest.spyOn(prisma.tenant, 'findUnique').mockResolvedValue({ id: 'tenant123', name: 'Test' } as any);

      const result = await service.findOne('tenant123');
      expect(result).toBeDefined();
      expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
        where: { id: 'tenant123' },
        include: undefined,
      });
    });

    it('should find tenant with valid inclusions', async () => {
      jest.spyOn(prisma.tenant, 'findUnique').mockResolvedValue({ id: 'tenant123', services: [] } as any);

      const result = await service.findOne('tenant123', 'services,saasPlan');
      expect(result).toBeDefined();
      expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
        where: { id: 'tenant123' },
        include: { services: true, saasPlan: true },
      });
    });

    it('should ignore invalid inclusions', async () => {
      jest.spyOn(prisma.tenant, 'findUnique').mockResolvedValue({ id: 'tenant123' } as any);

      const result = await service.findOne('tenant123', 'services,invalidRel');
      expect(result).toBeDefined();
      expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
        where: { id: 'tenant123' },
        include: { services: true },
      });
    });
  });
});
