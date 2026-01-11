import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenExpiredException } from '../exceptions/token-expired.exception';
import { InvalidTokenException } from '../exceptions/invalid-token.exception';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  describe('canActivate', () => {
    it('should return true for public routes', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const mockContext = {
        getHandler: () => jest.fn(),
        getClass: () => jest.fn(),
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });
  });

  describe('handleRequest', () => {
    it('should return user when no error and user exists', () => {
      const mockUser = { id: 'user-1', email: 'test@test.com' };

      const result = guard.handleRequest(null, mockUser, undefined);

      expect(result).toEqual(mockUser);
    });

    it('should throw TokenExpiredException when token is expired', () => {
      const expiredError = new Error('jwt expired');
      expiredError.name = 'TokenExpiredError';

      expect(() => guard.handleRequest(null, null, expiredError)).toThrow(
        TokenExpiredException,
      );
    });

    it('should throw InvalidTokenException when token is malformed', () => {
      const malformedError = new Error('jwt malformed');
      malformedError.name = 'JsonWebTokenError';

      expect(() => guard.handleRequest(null, null, malformedError)).toThrow(
        InvalidTokenException,
      );
    });

    it('should throw InvalidTokenException when token is not yet valid', () => {
      const notBeforeError = new Error('jwt not active');
      notBeforeError.name = 'NotBeforeError';

      expect(() => guard.handleRequest(null, null, notBeforeError)).toThrow(
        InvalidTokenException,
      );
    });

    it('should throw the original error when provided', () => {
      const customError = new Error('Custom error');

      expect(() => guard.handleRequest(customError, null, undefined)).toThrow(
        customError,
      );
    });

    it('should throw InvalidTokenException when no user and no error', () => {
      expect(() => guard.handleRequest(null, null, undefined)).toThrow(
        InvalidTokenException,
      );
    });
  });
});
