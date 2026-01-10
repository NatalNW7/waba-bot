import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaasPlanDto } from './dto/create-saas-plan.dto';
import { UpdateSaasPlanDto } from './dto/update-saas-plan.dto';
import { PrismaService } from '../prisma/prisma.service';
import { parseInclude } from '../common/utils/prisma-include.util';

@Injectable()
export class SaasPlansService {
  constructor(private readonly prisma: PrismaService) {}

  create(createSaasPlanDto: CreateSaasPlanDto) {
    return this.prisma.saasPlan.create({
      data: createSaasPlanDto,
    });
  }

  findAll() {
    return this.prisma.saasPlan.findMany();
  }

  findOne(id: string, include?: string) {
    const includeObj = parseInclude(include, ['tenants']);
    return this.prisma.saasPlan.findUnique({
      where: { id },
      include: includeObj,
    });
  }

  update(id: string, updateSaasPlanDto: UpdateSaasPlanDto) {
    return this.prisma.saasPlan.update({
      where: { id },
      data: updateSaasPlanDto,
    });
  }

  async remove(id: string) {
    const plan = await this.prisma.saasPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`SaaS Plan with ID ${id} not found`);
    }
    return this.prisma.saasPlan.delete({ where: { id } });
  }
}
