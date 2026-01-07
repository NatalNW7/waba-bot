import { Test, TestingModule } from '@nestjs/testing';
import { TenantMpAuthService } from './tenant-mp-auth.service';
import { TenantRepository } from './tenant-repository.service';
import { MercadoPagoService } from '../payments/mercadopago.service';
import { OAuth } from 'mercadopago';
import { BadRequestException } from '@nestjs/common';

jest.mock('mercadopago');

describe('TenantMpAuthService', () => {
  let service: TenantMpAuthService;
  let repo: TenantRepository;
  let mpService: MercadoPagoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantMpAuthService,
        {
          provide: TenantRepository,
          useValue: {
            update: jest.fn(),
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

    service = module.get<TenantMpAuthService>(TenantMpAuthService);
    repo = module.get<TenantRepository>(TenantRepository);
    mpService = module.get<MercadoPagoService>(MercadoPagoService);
  });

  describe('getMpAuthorizationUrl', () => {
    it('should throw BadRequestException if env vars are missing', () => {
      delete process.env.MP_CLIENT_ID;
      expect(() => service.getMpAuthorizationUrl('t1')).toThrow(
        BadRequestException,
      );
    });

    it('should return correct auth URL', () => {
      process.env.MP_CLIENT_ID = 'cid123';
      process.env.MP_REDIRECT_URI = 'http://red.ir';
      const url = service.getMpAuthorizationUrl('t1');
      expect(url).toContain('client_id=cid123');
      expect(url).toContain('state=t1');
      expect(url).toContain(encodeURIComponent('http://red.ir'));
    });
  });

  describe('exchangeMpCode', () => {
    it('should exchange code and update tenant', async () => {
      process.env.MP_CLIENT_ID = 'cid';
      process.env.MP_CLIENT_SECRET = 'sec';
      process.env.MP_REDIRECT_URI = 'http://uri';

      const mockOAuthCreate = jest.fn().mockResolvedValue({
        access_token: 'at',
        public_key: 'pk',
        refresh_token: 'rt',
      });
      (OAuth as jest.Mock).mockImplementation(() => ({
        create: mockOAuthCreate,
      }));

      await service.exchangeMpCode('code123', 't1');

      expect(repo.update).toHaveBeenCalledWith('t1', {
        mpAccessToken: 'at',
        mpPublicKey: 'pk',
        mpRefToken: 'rt',
      });
    });

    it('should throw BadRequestException on failure', async () => {
      (OAuth as jest.Mock).mockImplementation(() => ({
        create: jest.fn().mockRejectedValue(new Error('MP Error')),
      }));

      await expect(service.exchangeMpCode('c', 't')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
