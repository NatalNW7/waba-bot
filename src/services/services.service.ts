import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto) {
    await this.validateRelatedEntities(createServiceDto);
    return this.prisma.service.create({
      data: createServiceDto,
    });
  }

  private async validateRelatedEntities(
    dto: CreateServiceDto | UpdateServiceDto,
  ) {
    // 1. Validate Tenant
    if (dto.tenantId) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: dto.tenantId },
      });
      if (!tenant) {
        throw new BadRequestException('The provided tenantId does not exist.');
      }
    }
  }

  findAll() {
    return this.prisma.service.findMany();
  }

  findOne(id: string) {
    return this.prisma.service.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    await this.validateRelatedEntities(updateServiceDto);
    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  remove(id: string) {
    return this.prisma.service.delete({
      where: { id },
    });
  }
}
