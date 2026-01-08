import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string, include?: Prisma.AppointmentInclude) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include,
    });
  }

  async findMany(args: Prisma.AppointmentFindManyArgs) {
    return this.prisma.appointment.findMany(args);
  }

  async findDayAppointments(tenantId: string, start: Date, end: Date) {
    return this.prisma.appointment.findMany({
      where: {
        tenantId,
        status: { not: 'CANCELED' },
        date: {
          gte: start,
          lte: end,
        },
      },
      include: { service: true },
    });
  }

  async countSubscriptionUsage(
    subscriptionId: string,
    start: Date,
    end: Date,
  ): Promise<number> {
    return this.prisma.appointment.count({
      where: {
        usedSubscriptionId: subscriptionId,
        date: {
          gte: start,
          lt: end,
        },
        status: {
          not: 'CANCELED',
        },
      },
    });
  }

  async create(
    data: Prisma.AppointmentUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx || this.prisma;
    return client.appointment.create({ data: data as any });
  }

  async update(id: string, data: Prisma.AppointmentUpdateInput) {
    return this.prisma.appointment.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  async findStalePending(oneHourAgo: Date) {
    return this.prisma.appointment.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: oneHourAgo,
        },
      },
      include: {
        payment: true,
      },
    });
  }

  async withTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(fn);
  }
}
