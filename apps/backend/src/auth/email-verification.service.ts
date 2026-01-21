import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

/**
 * Verification code configuration
 */
const VERIFICATION_CODE_LENGTH = 6;
const VERIFICATION_CODE_EXPIRY_MINUTES = 15;

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Generate a random verification code
   */
  private generateCode(): string {
    const min = Math.pow(10, VERIFICATION_CODE_LENGTH - 1);
    const max = Math.pow(10, VERIFICATION_CODE_LENGTH) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }

  /**
   * Calculate expiry date for verification code
   */
  private getExpiryDate(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + VERIFICATION_CODE_EXPIRY_MINUTES);
    return expiry;
  }

  /**
   * Send email verification code to user
   */
  async sendVerificationCode(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (user.emailVerified) {
      return { message: 'Email já verificado' };
    }

    const code = this.generateCode();
    const expiry = this.getExpiryDate();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: code,
        emailVerificationExpiry: expiry,
      },
    });

    await this.emailService.sendVerificationEmail(user.email, code);

    return { message: 'Código de verificação enviado' };
  }

  /**
   * Verify email with provided code
   */
  async verifyEmailCode(
    userId: string,
    code: string,
  ): Promise<{ verified: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (user.emailVerified) {
      return { verified: true };
    }

    if (!user.emailVerificationToken || !user.emailVerificationExpiry) {
      throw new BadRequestException(
        'Nenhum código de verificação pendente. Solicite um novo código.',
      );
    }

    if (new Date() > user.emailVerificationExpiry) {
      throw new BadRequestException(
        'Código expirado. Solicite um novo código.',
      );
    }

    if (user.emailVerificationToken !== code) {
      throw new BadRequestException('Código inválido');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return { verified: true };
  }

  /**
   * Check if user email is verified
   */
  async isEmailVerified(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true },
    });

    return user?.emailVerified ?? false;
  }
}
