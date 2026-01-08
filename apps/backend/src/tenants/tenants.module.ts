import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { PaymentsModule } from '../payments/payments.module';
import { TenantRepository } from './tenant-repository.service';
import { TenantSaasService } from './tenant-saas.service';
import { TenantMpAuthService } from './tenant-mp-auth.service';

@Module({
  imports: [PaymentsModule],
  providers: [
    TenantsService,
    TenantRepository,
    TenantSaasService,
    TenantMpAuthService,
  ],
  controllers: [TenantsController],
})
export class TenantsModule {}
