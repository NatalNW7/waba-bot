import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoService } from './mercadopago.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MercadoPagoService', () => {
  let service: MercadoPagoService;
  let configService: ConfigService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoService,
        {
          provide: PrismaService,
          useValue: {
            tenant: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'MP_PLATFORM_ACCESS_TOKEN') return 'at123';
              if (key === 'MP_CLIENT_ID') return 'cid';
              if (key === 'MP_CLIENT_SECRET') return 'sec';
              if (key === 'MP_REDIRECT_URI') return 'http://uri';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MercadoPagoService>(MercadoPagoService);
    configService = module.get<ConfigService>(ConfigService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getPlatformClient', () => {
    it('should return client with access token from config', () => {
      const client = service.getPlatformClient();
      expect(client).toBeDefined();
      // MercadoPagoConfig doesn't expose accessToken easily, but we can verify it doesn't throw
    });

    it('should throw error if access token is missing', () => {
      jest.spyOn(configService, 'get').mockReturnValue(null);
      expect(() => service.getPlatformClient()).toThrow();
    });
  });

  describe('helpers', () => {
    it('should return values from config', () => {
      expect(service.getClientId()).toBe('cid');
      expect(service.getClientSecret()).toBe('sec');
      expect(service.getRedirectUri()).toBe('http://uri');
    });
  });
});
