import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { TokenExpiredException } from './exceptions/token-expired.exception';
import { InvalidTokenException } from './exceptions/invalid-token.exception';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
  };

  beforeEach(async () => {
    // Set required env variable
    process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough-for-testing';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('validateSecretStrength', () => {
    it('should not throw when JWT_SECRET is set and strong enough', () => {
      process.env.JWT_SECRET = 'a-very-strong-secret-key-with-good-length';
      expect(() => service.validateSecretStrength()).not.toThrow();
    });

    it('should throw when JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET;
      expect(() => service.validateSecretStrength()).toThrow(
        'JWT_SECRET environment variable is required',
      );
    });

    it('should warn but not throw when JWT_SECRET is short', () => {
      process.env.JWT_SECRET = 'short';
      const loggerSpy = jest.spyOn((service as any).logger, 'warn');
      service.validateSecretStrength();
      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {
    it('should return decoded payload for valid token', () => {
      const mockPayload = {
        sub: 'user-1',
        email: 'test@test.com',
        role: 'ADMIN',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = service.validateToken('valid-token');

      expect(result).toEqual(mockPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token', {
        algorithms: ['HS256'],
      });
    });

    it('should throw TokenExpiredException for expired token', () => {
      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError';
      mockJwtService.verify.mockImplementation(() => {
        throw error;
      });

      expect(() => service.validateToken('expired-token')).toThrow(
        TokenExpiredException,
      );
    });

    it('should throw InvalidTokenException for malformed token', () => {
      const error = new Error('jwt malformed');
      error.name = 'JsonWebTokenError';
      mockJwtService.verify.mockImplementation(() => {
        throw error;
      });

      expect(() => service.validateToken('malformed-token')).toThrow(
        InvalidTokenException,
      );
    });

    it('should throw InvalidTokenException for token not yet valid', () => {
      const error = new Error('jwt not active');
      error.name = 'NotBeforeError';
      mockJwtService.verify.mockImplementation(() => {
        throw error;
      });

      expect(() => service.validateToken('not-before-token')).toThrow(
        InvalidTokenException,
      );
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid non-expired token', () => {
      mockJwtService.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      expect(service.isTokenExpired('valid-token')).toBe(false);
    });

    it('should return true for expired token', () => {
      mockJwtService.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) - 3600,
      });

      expect(service.isTokenExpired('expired-token')).toBe(true);
    });

    it('should return true for token without exp claim', () => {
      mockJwtService.decode.mockReturnValue({});

      expect(service.isTokenExpired('no-exp-token')).toBe(true);
    });

    it('should return true for invalid token', () => {
      mockJwtService.decode.mockReturnValue(null);

      expect(service.isTokenExpired('invalid-token')).toBe(true);
    });
  });

  describe('getTokenExpiration', () => {
    it('should return expiration date for valid token', () => {
      const expTime = Math.floor(Date.now() / 1000) + 3600;
      mockJwtService.decode.mockReturnValue({ exp: expTime });

      const result = service.getTokenExpiration('valid-token');

      expect(result).toEqual(new Date(expTime * 1000));
    });

    it('should return null for token without exp', () => {
      mockJwtService.decode.mockReturnValue({});

      expect(service.getTokenExpiration('no-exp-token')).toBeNull();
    });

    it('should return null for invalid token', () => {
      mockJwtService.decode.mockReturnValue(null);

      expect(service.getTokenExpiration('invalid-token')).toBeNull();
    });
  });

  describe('createToken', () => {
    it('should create token with HS256 algorithm', () => {
      const payload = {
        sub: 'user-1',
        email: 'test@test.com',
        role: 'ADMIN',
      };

      mockJwtService.sign.mockReturnValue('signed-token');

      const result = service.createToken(payload);

      expect(result).toBe('signed-token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(payload, {
        algorithm: 'HS256',
      });
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      const mockPayload = {
        sub: 'user-1',
        email: 'test@test.com',
      };
      mockJwtService.decode.mockReturnValue(mockPayload);

      const result = service.decodeToken('any-token');

      expect(result).toEqual(mockPayload);
    });

    it('should return null for invalid token', () => {
      mockJwtService.decode.mockReturnValue(null);

      expect(service.decodeToken('invalid-token')).toBeNull();
    });
  });
});
