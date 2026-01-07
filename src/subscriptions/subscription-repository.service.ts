import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.SubscriptionUncheckedCreateInput) {
    return this.prisma.subscription.create({
      data,
    });
  }

  async findAll(args?: Prisma.SubscriptionFindManyArgs) {
    return this.prisma.subscription.findMany(args);
  }

  async findUnique(args: Prisma.SubscriptionFindUniqueArgs) {
    return this.prisma.subscription.findUnique(args);
  }

  async findFirst(args: Prisma.SubscriptionFindFirstArgs) {
    return this.prisma.subscription.findFirst(args);
  }

  async update(id: string, data: Prisma.SubscriptionUncheckedUpdateInput) {
    return this.prisma.subscription.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.subscription.delete({
      where: { id },
    });
  }
}
