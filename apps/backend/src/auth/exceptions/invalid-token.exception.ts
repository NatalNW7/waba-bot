import { UnauthorizedException } from '@nestjs/common';

/**
 * Exception thrown when a JWT token is invalid, malformed, or has an invalid signature.
 * Frontend can detect this via the 'code' field and force logout.
 */
export class InvalidTokenException extends UnauthorizedException {
  constructor(message = 'Invalid or malformed token') {
    super({
      statusCode: 401,
      message,
      error: 'Unauthorized',
      code: 'INVALID_TOKEN',
    });
  }
}
