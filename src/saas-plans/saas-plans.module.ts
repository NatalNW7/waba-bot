import { Module } from '@nestjs/common';
import { SaasPlansService } from './saas-plans.service';
import { SaasPlansController } from './saas-plans.controller';

@Module({
  providers: [SaasPlansService],
  controllers: [SaasPlansController]
})
export class SaasPlansModule {}
