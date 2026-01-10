import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PaymentUncheckedCreateInput) {
    return this.prisma.payment.create({
      data,
    });
  }

  async findAll(args?: Prisma.PaymentFindManyArgs) {
    return this.prisma.payment.findMany(args);
  }

  async findUnique(args: Prisma.PaymentFindUniqueArgs) {
    return this.prisma.payment.findUnique(args);
  }

  async findFirst(args: Prisma.PaymentFindFirstArgs) {
    return this.prisma.payment.findFirst(args);
  }

  async update(id: string, data: Prisma.PaymentUncheckedUpdateInput) {
    return this.prisma.payment.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return this.prisma.payment.delete({ where: { id } });
  }
}
