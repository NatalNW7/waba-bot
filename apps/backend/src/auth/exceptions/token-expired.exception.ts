import { UnauthorizedException } from '@nestjs/common';

/**
 * Exception thrown when a JWT token has expired.
 * Frontend can detect this via the 'code' field and trigger token refresh or logout.
 */
export class TokenExpiredException extends UnauthorizedException {
  constructor(message = 'Token has expired') {
    super({
      statusCode: 401,
      message,
      error: 'Unauthorized',
      code: 'TOKEN_EXPIRED',
    });
  }
}
