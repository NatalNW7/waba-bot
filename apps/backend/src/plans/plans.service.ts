import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { parseInclude } from '../common/utils/prisma-include.util';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPlanDto: CreatePlanDto) {
    return this.prisma.plan.create({
      data: createPlanDto,
    });
  }

  findAll() {
    return this.prisma.plan.findMany();
  }

  findOne(id: string, include?: string) {
    const includeObj = parseInclude(include, [
      'tenant',
      'subscriptions',
      'services',
    ]);
    return this.prisma.plan.findUnique({
      where: { id },
      include: includeObj,
    });
  }

  update(id: string, updatePlanDto: UpdatePlanDto) {
    return this.prisma.plan.update({
      where: { id },
      data: updatePlanDto,
    });
  }

  remove(id: string) {
    return this.prisma.plan.delete({
      where: { id },
    });
  }
}
