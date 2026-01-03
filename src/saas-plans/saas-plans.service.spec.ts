import { Test, TestingModule } from '@nestjs/testing';
import { SaasPlansService } from './saas-plans.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SaasPlansService', () => {
  let service: SaasPlansService;
  let prisma: PrismaService;

  const mockPrismaService = {
    saasPlan: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaasPlansService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SaasPlansService>(SaasPlansService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should call prisma.saasPlan.findUnique with include if provided', async () => {
      const id = 'some-id';
      const include = 'tenants';
      const mockResult = { id, name: 'Pro', tenants: [] };

      mockPrismaService.saasPlan.findUnique.mockResolvedValue(mockResult);

      const result = await service.findOne(id, include);

      expect(prisma.saasPlan.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: { tenants: true },
      });
      expect(result).toEqual(mockResult);
    });

    it('should call prisma.saasPlan.findUnique without include if not provided', async () => {
      const id = 'some-id';
      const mockResult = { id, name: 'Pro' };

      mockPrismaService.saasPlan.findUnique.mockResolvedValue(mockResult);

      const result = await service.findOne(id);

      expect(prisma.saasPlan.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: undefined,
      });
      expect(result).toEqual(mockResult);
    });
  });
});
