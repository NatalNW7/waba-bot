import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from '../prisma/prisma.service';
import { parseInclude } from '../common/utils/prisma-include.util';

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

  findOne(id: string, include?: string) {
    const includeObj = parseInclude(include, [
      'tenant',
      'appointments',
      'plans',
    ]);
    return this.prisma.service.findUnique({
      where: { id },
      include: includeObj,
    });
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    await this.validateRelatedEntities(updateServiceDto);
    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  async remove(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return this.prisma.service.delete({ where: { id } });
  }
}
