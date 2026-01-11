import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TokenExpiredException } from '../exceptions/token-expired.exception';
import { InvalidTokenException } from '../exceptions/invalid-token.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  /**
   * Handles JWT validation errors and maps them to specific exceptions.
   * This allows frontend to distinguish between expired and invalid tokens.
   */
  handleRequest<TUser = any>(
    err: Error | null,
    user: TUser,
    info: Error | undefined,
  ): TUser {
    if (info) {
      if (info.name === 'TokenExpiredError') {
        throw new TokenExpiredException();
      }
      if (info.name === 'JsonWebTokenError' || info.name === 'NotBeforeError') {
        throw new InvalidTokenException();
      }
    }

    if (err || !user) {
      throw err || new InvalidTokenException('Authentication required');
    }

    return user;
  }
}
