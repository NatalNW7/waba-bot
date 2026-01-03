import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { parseInclude } from '../common/utils/prisma-include.util';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    const {
      planId,
      customerId,
      nextBilling: dtoNextBilling,
      startDate: dtoStartDate,
      ...rest
    } = createSubscriptionDto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch Plan to identify Tenant and Interval
      const plan = await tx.plan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        throw new NotFoundException(`Plan with ID ${planId} not found.`);
      }

      const tenantId = plan.tenantId;

      // 2. Find or Create TenantCustomer relationship
      let tenantCustomer = await tx.tenantCustomer.findUnique({
        where: {
          tenantId_customerId: {
            tenantId,
            customerId,
          },
        },
      });

      if (!tenantCustomer) {
        tenantCustomer = await tx.tenantCustomer.create({
          data: {
            tenantId,
            customerId,
          },
        });
      }

      // 3. Calculate nextBilling if not provided
      let nextBilling = dtoNextBilling ? new Date(dtoNextBilling) : null;
      const startDate = dtoStartDate ? new Date(dtoStartDate) : new Date();

      if (!nextBilling) {
        nextBilling = new Date(startDate);
        switch (plan.interval) {
          case 'MONTHLY':
            nextBilling.setMonth(nextBilling.getMonth() + 1);
            break;
          case 'QUARTERLY':
            nextBilling.setMonth(nextBilling.getMonth() + 3);
            break;
          case 'YEARLY':
            nextBilling.setFullYear(nextBilling.getFullYear() + 1);
            break;
        }
      }

      // 4. Create Subscription
      return tx.subscription.create({
        data: {
          ...rest,
          startDate,
          nextBilling,
          planId,
          tenantCustomerId: tenantCustomer.id,
        },
      });
    });
  }

  findAll() {
    return this.prisma.subscription.findMany();
  }

  findOne(id: string, include?: string) {
    const includeObj = parseInclude(include, [
      'plan',
      'tenantCustomer',
      'appointments',
      'payments',
    ]);
    return this.prisma.subscription.findUnique({
      where: { id },
      include: includeObj,
    });
  }

  update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    return this.prisma.subscription.update({
      where: { id },
      data: updateSubscriptionDto,
    });
  }

  remove(id: string) {
    return this.prisma.subscription.delete({
      where: { id },
    });
  }
}
