import { Test, TestingModule } from '@nestjs/testing';
import { EmailVerificationService } from './email-verification.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { BadRequestException } from '@nestjs/common';

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;
  let prisma: PrismaService;

  const mockEmailService = {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationService,
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
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<EmailVerificationService>(EmailVerificationService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('sendVerificationCode', () => {
    it('should generate and send 6-digit verification code', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        emailVerified: false,
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.sendVerificationCode('user-1');

      expect(result.message).toBe('Código de verificação enviado');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            emailVerificationToken: expect.stringMatching(/^\d{6}$/),
            emailVerificationExpiry: expect.any(Date),
          }),
        }),
      );
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        'test@test.com',
        expect.stringMatching(/^\d{6}$/),
      );
    });

    it('should return "already verified" if email is verified', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        emailVerified: true,
      });

      const result = await service.sendVerificationCode('user-1');

      expect(result.message).toBe('Email já verificado');
      expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.sendVerificationCode('fake-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyEmailCode', () => {
    it('should verify email with valid code', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 10);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        emailVerified: false,
        emailVerificationToken: '123456',
        emailVerificationExpiry: futureDate,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await service.verifyEmailCode('user-1', '123456');

      expect(result.verified).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpiry: null,
          }),
        }),
      );
    });

    it('should return verified=true if already verified', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        emailVerified: true,
      });

      const result = await service.verifyEmailCode('user-1', '123456');

      expect(result.verified).toBe(true);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for wrong code', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 10);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        emailVerified: false,
        emailVerificationToken: '123456',
        emailVerificationExpiry: futureDate,
      });

      await expect(service.verifyEmailCode('user-1', '000000')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for expired code', async () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 10);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        emailVerified: false,
        emailVerificationToken: '123456',
        emailVerificationExpiry: pastDate,
      });

      await expect(service.verifyEmailCode('user-1', '123456')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if no pending verification', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        emailVerified: false,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      });

      await expect(service.verifyEmailCode('user-1', '123456')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.verifyEmailCode('fake-id', '123456'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('isEmailVerified', () => {
    it('should return true for verified email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        emailVerified: true,
      });

      const result = await service.isEmailVerified('user-1');

      expect(result).toBe(true);
    });

    it('should return false for unverified email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        emailVerified: false,
      });

      const result = await service.isEmailVerified('user-1');

      expect(result).toBe(false);
    });

    it('should return false for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.isEmailVerified('fake-id');

      expect(result).toBe(false);
    });
  });
});
