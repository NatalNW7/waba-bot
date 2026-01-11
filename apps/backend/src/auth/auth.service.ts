import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tenant: true, customer: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // For OAuth users without password, they must use OAuth login
    if (!user.password) {
      throw new UnauthorizedException(
        'This account uses social login. Please sign in with Google.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    return this.generateLoginResponse(user);
  }

  /**
   * Handle OAuth login - generate JWT for authenticated user
   */
  async handleOAuthLogin(user: User) {
    if (!user) {
      throw new UnauthorizedException('No user from OAuth');
    }
    return this.generateLoginResponse(user);
  }

  /**
   * Verify a token and return its status
   * @param token - JWT token to verify
   * @returns Token validity status and expiration info
   */
  verifyToken(token: string): {
    valid: boolean;
    expiresAt: Date | null;
    remainingMs: number | null;
  } {
    const payload = this.tokenService.validateToken(token);
    const expiresAt = payload.exp ? new Date(payload.exp * 1000) : null;
    const remainingMs = expiresAt ? expiresAt.getTime() - Date.now() : null;

    return {
      valid: true,
      expiresAt,
      remainingMs,
    };
  }

  /**
   * Get current session with onboarding status
   */
  getSession(user: AuthenticatedUser) {
    const onboardingStatus = user.tenantId ? 'COMPLETE' : 'PENDING';

    return {
      id: user.id,
      email: user.email,
      name: (user as any).name || null,
      avatarUrl: (user as any).avatarUrl || null,
      role: user.role,
      tenantId: user.tenantId,
      onboardingStatus,
    };
  }

  /**
   * Generate JWT token and login response
   */
  private generateLoginResponse(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      customerId: user.customerId,
    };

    return {
      accessToken: this.tokenService.createToken(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        tenantId: user.tenantId,
        onboardingStatus: user.tenantId ? 'COMPLETE' : 'PENDING',
      },
    };
  }
}
