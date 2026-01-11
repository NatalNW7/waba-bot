import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { TokenExpiredException } from './exceptions/token-expired.exception';
import { InvalidTokenException } from './exceptions/invalid-token.exception';

/**
 * Minimum required length for JWT_SECRET (256 bits = 32 bytes = 64 hex characters)
 */
const MIN_SECRET_LENGTH = 32;

/**
 * Service for centralized token operations.
 * Handles token validation, creation, and security checks.
 */
@Injectable()
export class TokenService implements OnModuleInit {
  private readonly logger = new Logger(TokenService.name);

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Validates JWT_SECRET strength on module initialization.
   * Logs a warning if the secret is too short.
   */
  onModuleInit(): void {
    this.validateSecretStrength();
  }

  /**
   * Validates that JWT_SECRET meets minimum security requirements.
   * @throws Error if JWT_SECRET is not configured
   */
  validateSecretStrength(): void {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    if (secret.length < MIN_SECRET_LENGTH) {
      this.logger.warn(
        `JWT_SECRET is shorter than recommended (${MIN_SECRET_LENGTH} characters). ` +
          'Consider using a stronger secret for production.',
      );
    }
  }

  /**
   * Validates and decodes a JWT token.
   * @param token - The JWT token to validate
   * @returns The decoded payload
   * @throws TokenExpiredException if the token has expired
   * @throws InvalidTokenException if the token is invalid or malformed
   */
  validateToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        algorithms: ['HS256'],
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TokenExpiredError') {
          throw new TokenExpiredException();
        }
        if (
          error.name === 'JsonWebTokenError' ||
          error.name === 'NotBeforeError'
        ) {
          throw new InvalidTokenException();
        }
      }
      throw new InvalidTokenException('Token validation failed');
    }
  }

  /**
   * Checks if a token is expired without throwing an exception.
   * @param token - The JWT token to check
   * @returns true if expired, false otherwise
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.jwtService.decode(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  /**
   * Gets the expiration date of a token.
   * @param token - The JWT token
   * @returns The expiration date or null if invalid
   */
  getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.jwtService.decode(token);
      if (!decoded || !decoded.exp) {
        return null;
      }
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }

  /**
   * Creates a signed JWT token.
   * @param payload - The payload to include in the token
   * @returns The signed JWT token
   */
  createToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return this.jwtService.sign(payload, {
      algorithm: 'HS256',
    });
  }

  /**
   * Decodes a token without verification (for inspection only).
   * @param token - The JWT token to decode
   * @returns The decoded payload or null if invalid
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.decode(token);
    } catch {
      return null;
    }
  }
}
