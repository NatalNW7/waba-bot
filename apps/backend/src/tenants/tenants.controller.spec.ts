import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { PrismaService } from '../prisma/prisma.service';
import { MercadoPagoService } from '../payments/mercadopago.service';
import { TenantRepository } from './tenant-repository.service';
import { TenantSaasService } from './tenant-saas.service';
import { TenantMpAuthService } from './tenant-mp-auth.service';

describe('TenantsController', () => {
  let controller: TenantsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [
        TenantsService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: TenantRepository,
          useValue: {},
        },
        {
          provide: TenantSaasService,
          useValue: {},
        },
        {
          provide: TenantMpAuthService,
          useValue: {},
        },
        {
          provide: MercadoPagoService,
          useValue: {
            getPlatformClient: jest.fn(),
            getTenantClient: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
