import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { parseInclude } from '../common/utils/prisma-include.util';
import { SubscriptionRepository } from './subscription-repository.service';
import { SubscriptionBillingService } from './subscription-billing.service';
import { CustomerSubscriptionService } from './customer-subscription.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: SubscriptionRepository,
    private readonly billingService: SubscriptionBillingService,
    private readonly customerSubService: CustomerSubscriptionService,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto) {
    const {
      planId,
      customerId,
      cardTokenId,
      nextBilling: dtoNextBilling,
      startDate: dtoStartDate,
      ...rest
    } = createSubscriptionDto;

    // 1. Fetch Plan and Customer
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${planId} not found.`);
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found.`);
    }

    const tenantId = plan.tenantId;

    return this.prisma.$transaction(async (tx) => {
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

      // 3. Billing Logic
      const startDate = dtoStartDate ? new Date(dtoStartDate) : new Date();
      const nextBilling = dtoNextBilling
        ? new Date(dtoNextBilling)
        : this.billingService.calculateNextBilling(startDate, plan.interval);

      // 4. Create Subscription in Mercado Pago
      const mpResult = await this.customerSubService.createMpSubscription({
        tenantId,
        plan: {
          name: plan.name,
          price: Number(plan.price),
          interval: plan.interval,
        },
        customer: { id: customerId, email: customer.email ?? undefined },
        cardTokenId,
      });

      // 5. Create Subscription in our DB
      return tx.subscription.create({
        data: {
          ...rest,
          cardTokenId,
          startDate,
          nextBilling,
          planId,
          tenantCustomerId: tenantCustomer.id,
          status: 'ACTIVE',
          externalId: mpResult.id as string,
        },
      });
    });
  }

  findAll() {
    return this.repo.findAll();
  }

  findOne(id: string, include?: string) {
    const includeObj = parseInclude(include, [
      'plan',
      'tenantCustomer',
      'appointments',
      'payments',
    ]);
    return this.repo.findUnique({
      where: { id },
      include: includeObj,
    });
  }

  update(id: string, updateSubscriptionDto: UpdateSubscriptionDto) {
    const { nextBilling, startDate, ...rest } = updateSubscriptionDto;

    return this.repo.update(id, {
      ...rest,
      nextBilling: nextBilling ? new Date(nextBilling) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
    });
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
