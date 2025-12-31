import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WabaModule } from './waba/waba.module';
import { PrismaModule } from './prisma/prisma.module';
import { SaasPlansModule } from './saas-plans/saas-plans.module';
import { TenantsModule } from './tenants/tenants.module';
import { ServicesModule } from './services/services.module';
import { CustomersModule } from './customers/customers.module';

@Module({
  imports: [WabaModule, PrismaModule, SaasPlansModule, TenantsModule, ServicesModule, CustomersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
