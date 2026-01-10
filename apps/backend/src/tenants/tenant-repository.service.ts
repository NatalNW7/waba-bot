import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TenantUncheckedCreateInput) {
    return this.prisma.tenant.create({
      data,
    });
  }

  async findAll(args?: Prisma.TenantFindManyArgs) {
    return this.prisma.tenant.findMany(args);
  }

  async findUnique(args: Prisma.TenantFindUniqueArgs) {
    return this.prisma.tenant.findUnique(args);
  }

  async update(id: string, data: Prisma.TenantUncheckedUpdateInput) {
    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return this.prisma.tenant.delete({ where: { id } });
  }
}
