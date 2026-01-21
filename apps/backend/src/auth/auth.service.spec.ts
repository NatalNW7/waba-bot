import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './token.service';
import { EmailVerificationService } from './email-verification.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { TokenExpiredException } from './exceptions/token-expired.exception';
import { InvalidTokenException } from './exceptions/invalid-token.exception';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockTokenService = {
    createToken: jest.fn().mockReturnValue('mock-jwt-token'),
    validateToken: jest.fn(),
    isTokenExpired: jest.fn(),
    getTokenExpiration: jest.fn(),
  };

  const mockEmailVerificationService = {
    sendVerificationCode: jest.fn(),
    verifyEmailCode: jest.fn(),
    isEmailVerified: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: EmailVerificationService,
          useValue: mockEmailVerificationService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return a JWT token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        tenantId: null,
        customerId: null,
      });

      const result = await service.login('admin@test.com', 'password123');

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('admin@test.com');
      expect(mockTokenService.createToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'admin@test.com',
        password: await bcrypt.hash('different', 10),
        isActive: true,
      });

      await expect(service.login('admin@test.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'admin@test.com',
        password: await bcrypt.hash('password', 10),
        isActive: false,
      });

      await expect(service.login('admin@test.com', 'password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.login('nonexistent@test.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for OAuth users without password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'oauth@test.com',
        password: null, // OAuth users have no password
        isActive: true,
        googleId: 'google-123',
      });

      await expect(service.login('oauth@test.com', 'password')).rejects.toThrow(
        'This account uses social login. Please sign in with Google.',
      );
    });
  });

  describe('verifyToken', () => {
    it('should return valid status for valid token', () => {
      const expTime = Math.floor(Date.now() / 1000) + 3600;
      mockTokenService.validateToken.mockReturnValue({
        sub: 'user-1',
        email: 'test@test.com',
        exp: expTime,
      });

      const result = service.verifyToken('valid-token');

      expect(result.valid).toBe(true);
      expect(result.expiresAt).toEqual(new Date(expTime * 1000));
      expect(result.remainingMs).toBeGreaterThan(0);
    });

    it('should throw TokenExpiredException for expired token', () => {
      mockTokenService.validateToken.mockImplementation(() => {
        throw new TokenExpiredException();
      });

      expect(() => service.verifyToken('expired-token')).toThrow(
        TokenExpiredException,
      );
    });

    it('should throw InvalidTokenException for invalid token', () => {
      mockTokenService.validateToken.mockImplementation(() => {
        throw new InvalidTokenException();
      });

      expect(() => service.verifyToken('invalid-token')).toThrow(
        InvalidTokenException,
      );
    });
  });

  describe('sendVerificationCode', () => {
    it('should delegate to EmailVerificationService', async () => {
      mockEmailVerificationService.sendVerificationCode.mockResolvedValue({
        message: 'Código de verificação enviado',
      });

      const result = await service.sendVerificationCode('user-1');

      expect(result.message).toBe('Código de verificação enviado');
      expect(
        mockEmailVerificationService.sendVerificationCode,
      ).toHaveBeenCalledWith('user-1');
    });
  });

  describe('verifyEmailCode', () => {
    it('should delegate to EmailVerificationService', async () => {
      mockEmailVerificationService.verifyEmailCode.mockResolvedValue({
        verified: true,
      });

      const result = await service.verifyEmailCode('user-1', '123456');

      expect(result.verified).toBe(true);
      expect(mockEmailVerificationService.verifyEmailCode).toHaveBeenCalledWith(
        'user-1',
        '123456',
      );
    });
  });

  describe('isEmailVerified', () => {
    it('should delegate to EmailVerificationService', async () => {
      mockEmailVerificationService.isEmailVerified.mockResolvedValue(true);

      const result = await service.isEmailVerified('user-1');

      expect(result).toBe(true);
      expect(mockEmailVerificationService.isEmailVerified).toHaveBeenCalledWith(
        'user-1',
      );
    });
  });

  describe('getSession', () => {
    it('should return session with COMPLETE status for user with tenant', () => {
      const user = {
        id: 'user-1',
        email: 'test@test.com',
        role: 'TENANT',
        tenantId: 'tenant-1',
        customerId: null,
      };

      const result = service.getSession(user);

      expect(result.id).toBe('user-1');
      expect(result.onboardingStatus).toBe('COMPLETE');
    });

    it('should return session with PENDING status for user without tenant', () => {
      const user = {
        id: 'user-1',
        email: 'test@test.com',
        role: 'TENANT',
        tenantId: null,
        customerId: null,
      };

      const result = service.getSession(user);

      expect(result.onboardingStatus).toBe('PENDING');
    });
  });
});
