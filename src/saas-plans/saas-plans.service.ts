import { Injectable } from '@nestjs/common';
import { CreateSaasPlanDto } from './dto/create-saas-plan.dto';
import { UpdateSaasPlanDto } from './dto/update-saas-plan.dto';
import { PrismaService } from '../prisma/prisma.service';

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

  findOne(id: string) {
    return this.prisma.saasPlan.findUnique({
      where: { id },
    });
  }

  update(id: string, updateSaasPlanDto: UpdateSaasPlanDto) {
    return this.prisma.saasPlan.update({
      where: { id },
      data: updateSaasPlanDto,
    });
  }

  remove(id: string) {
    return this.prisma.saasPlan.delete({
      where: { id },
    });
  }
}
