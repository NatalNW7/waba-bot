import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
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
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantMpAuthService,
        {
          provide: TenantRepository,
          useValue: {
            update: jest.fn(),
            findUnique: jest.fn(),
          },
        },
        {
          provide: MercadoPagoService,
          useValue: {
            getPlatformClient: jest.fn().mockReturnValue({}),
            getClientId: jest.fn().mockReturnValue('cid123'),
            getClientSecret: jest.fn().mockReturnValue('sec123'),
            getRedirectUri: jest.fn().mockReturnValue('http://red.ir'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'NODE_ENV') return 'development';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TenantMpAuthService>(TenantMpAuthService);
    repo = module.get<TenantRepository>(TenantRepository);
    mpService = module.get<MercadoPagoService>(MercadoPagoService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('getMpAuthorizationUrl', () => {
    it('should throw BadRequestException if clientId or redirectUri are missing', () => {
      jest.spyOn(mpService, 'getClientId').mockReturnValue(null);
      expect(() => service.getMpAuthorizationUrl('t1')).toThrow(
        BadRequestException,
      );
    });

    it('should return correct auth URL', () => {
      const url = service.getMpAuthorizationUrl('t1');
      expect(url).toContain('client_id=cid123');
      expect(url).toContain('state=t1');
      expect(url).toContain(encodeURIComponent('http://red.ir'));
    });
  });

  describe('exchangeMpCode', () => {
    it('should exchange code and update tenant with test_token: true in dev', async () => {
      const mockOAuthCreate = jest.fn().mockResolvedValue({
        access_token: 'at',
        public_key: 'pk',
        refresh_token: 'rt',
      });
      (OAuth as jest.Mock).mockImplementation(() => ({
        create: mockOAuthCreate,
      }));

      await service.exchangeMpCode('code123', 't1');

      expect(mockOAuthCreate).toHaveBeenCalledWith({
        body: expect.objectContaining({
          test_token: true,
        }),
      });

      expect(repo.update).toHaveBeenCalledWith('t1', {
        mpAccessToken: 'at',
        mpPublicKey: 'pk',
        mpRefToken: 'rt',
      });
    });

    it('should exchange code with test_token: false in production', async () => {
      jest.spyOn(configService, 'get').mockReturnValue('production');
      const mockOAuthCreate = jest.fn().mockResolvedValue({
        access_token: 'at',
        public_key: 'pk',
        refresh_token: 'rt',
      });
      (OAuth as jest.Mock).mockImplementation(() => ({
        create: mockOAuthCreate,
      }));

      await service.exchangeMpCode('code123', 't1');

      expect(mockOAuthCreate).toHaveBeenCalledWith({
        body: expect.objectContaining({
          test_token: false,
        }),
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

  describe('refreshTenantToken', () => {
    it('should refresh token and update repo', async () => {
      jest
        .spyOn(repo, 'findUnique')
        .mockResolvedValue({ mpRefToken: 'old-rt' } as any);
      const mockOAuthRefresh = jest.fn().mockResolvedValue({
        access_token: 'new-at',
        refresh_token: 'new-rt',
      });
      (OAuth as jest.Mock).mockImplementation(() => ({
        refresh: mockOAuthRefresh,
      }));

      await service.refreshTenantToken('t1');

      expect(mockOAuthRefresh).toHaveBeenCalledWith({
        body: {
          client_id: 'cid123',
          client_secret: 'sec123',
          refresh_token: 'old-rt',
        },
      });

      expect(repo.update).toHaveBeenCalledWith('t1', {
        mpAccessToken: 'new-at',
        mpRefToken: 'new-rt',
      });
    });

    it('should throw BadRequestException if tenant has no refresh token', async () => {
      jest
        .spyOn(repo, 'findUnique')
        .mockResolvedValue({ mpRefToken: null } as any);
      await expect(service.refreshTenantToken('t1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
