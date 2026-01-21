import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './interfaces/jwt-payload.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login with email/password' })
  @ApiOkResponse({ description: 'Returns JWT token and user info' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  /**
   * Verify token validity and get expiration info
   */
  @Public()
  @Post('verify')
  @ApiOperation({ summary: 'Verify a JWT token' })
  @ApiOkResponse({ description: 'Returns token validity status and TTL' })
  @ApiUnauthorizedResponse({
    description:
      'Token expired (code: TOKEN_EXPIRED) or invalid (code: INVALID_TOKEN)',
  })
  verifyToken(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return { valid: false, expiresAt: null, remainingMs: null };
    }
    return this.authService.verifyToken(token);
  }

  /**
   * Send email verification code
   */
  @Post('send-verification')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Send email verification code' })
  @ApiOkResponse({ description: 'Verification code sent' })
  @ApiBadRequestResponse({ description: 'User not found' })
  async sendVerification(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.sendVerificationCode(user.id);
  }

  /**
   * Verify email with code
   */
  @Post('verify-email')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Verify email with code' })
  @ApiOkResponse({ description: 'Email verified successfully' })
  @ApiBadRequestResponse({ description: 'Invalid or expired code' })
  async verifyEmail(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: VerifyEmailDto,
  ) {
    return this.authService.verifyEmailCode(user.id, dto.code);
  }

  /**
   * Initiate Google OAuth flow
   */
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  googleAuth() {
    // Guard redirects to Google
  }

  /**
   * Google OAuth callback - exchanges code for JWT
   */
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiExcludeEndpoint()
  googleCallback(
    @Req() req: { user: AuthenticatedUser },
    @Res() res: Response,
  ) {
    const result = this.authService.handleOAuthLogin(req.user as any);
    const frontendUrl = process.env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}`);
  }

  /**
   * Get current session info with onboarding status
   */
  @Get('me')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current user session' })
  @ApiOkResponse({ description: 'Returns user session with onboarding status' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  getSession(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getSession(user);
  }
}
