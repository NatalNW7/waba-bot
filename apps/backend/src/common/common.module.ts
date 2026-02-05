import { Module, Global } from '@nestjs/common';
import { TenantAuthorizationService } from './services/tenant-authorization.service';

/**
 * CommonModule provides shared services across the application.
 * Marked as @Global() so services are available without explicit imports.
 */
@Global()
@Module({
  providers: [TenantAuthorizationService],
  exports: [TenantAuthorizationService],
})
export class CommonModule {}
