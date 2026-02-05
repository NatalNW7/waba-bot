import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';

/**
 * DTO interface for operations that may include a tenantId
 */
export interface TenantAwareDto {
  tenantId?: string;
}

/**
 * Service for tenant-level authorization logic.
 * Centralizes tenant resolution and access control checks.
 */
@Injectable()
export class TenantAuthorizationService {
  /**
   * Resolves the tenantId based on user role and DTO.
   *
   * Rules:
   * - ADMIN: must provide tenantId in DTO (can operate on any tenant)
   * - TENANT: uses their own tenantId, cannot override to another tenant
   * - Others: throws BadRequestException
   *
   * @param dto - The DTO containing optional tenantId
   * @param user - The authenticated user
   * @returns The resolved tenantId
   * @throws BadRequestException if tenantId cannot be determined
   * @throws ForbiddenException if non-admin tries to access another tenant
   */
  resolveTenantId(dto: TenantAwareDto, user: AuthenticatedUser): string {
    if (user.role === UserRole.ADMIN) {
      if (!dto.tenantId) {
        throw new BadRequestException('Admin must specify tenantId');
      }
      return dto.tenantId;
    }

    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    if (dto.tenantId && !this.canAccessTenant(user, dto.tenantId)) {
      throw new ForbiddenException(
        'You cannot perform this operation for another tenant',
      );
    }

    return user.tenantId;
  }

  /**
   * Checks if user has access to the specified tenant.
   *
   * @param user - The authenticated user
   * @param tenantId - The tenant to check access for
   * @returns true if user can access the tenant
   */
  canAccessTenant(user: AuthenticatedUser, tenantId: string): boolean {
    if (user.role === UserRole.ADMIN) {
      return true;
    }
    return user.tenantId === tenantId;
  }
}
