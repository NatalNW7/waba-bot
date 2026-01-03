import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class TenantCustomerService {
  private readonly logger = new Logger(TenantCustomerService.name);

  async ensureTenantCustomerLink(
    tx: Prisma.TransactionClient,
    tenantId: string,
    customerId: string,
  ): Promise<void> {
    const link = await tx.tenantCustomer.findUnique({
      where: {
        tenantId_customerId: {
          tenantId,
          customerId,
        },
      },
    });

    if (!link) {
      this.logger.debug(
        `Creating TenantCustomer link for tenant ${tenantId} and customer ${customerId}`,
      );
      await tx.tenantCustomer.create({
        data: {
          tenantId,
          customerId,
        },
      });
    } else {
      this.logger.debug(
        `TenantCustomer link already exists for tenant ${tenantId} and customer ${customerId}`,
      );
    }
  }
}
