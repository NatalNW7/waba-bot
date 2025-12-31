import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    if (createTenantDto.saasPlanId) {
      const plan = await this.prisma.saasPlan.findUnique({
        where: { id: createTenantDto.saasPlanId },
      });

      if (!plan) {
        throw new BadRequestException('this saas plan does not exists');
      }
    }

    return this.prisma.tenant.create({
      data: createTenantDto,
    });
  }

  findAll() {
    return this.prisma.tenant.findMany();
  }

  findOne(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
    });
  }

  update(id: string, updateTenantDto: UpdateTenantDto) {
    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  remove(id: string) {
    return this.prisma.tenant.delete({
      where: { id },
    });
  }
}
