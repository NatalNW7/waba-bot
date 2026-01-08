import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
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
  });
});
