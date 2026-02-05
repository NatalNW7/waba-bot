import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantAuthorizationService } from '../common';
import { CreateOperatingHourDto } from './dto/create-operating-hour.dto';
import { UpdateOperatingHourDto } from './dto/update-operating-hour.dto';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class OperatingHoursService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantAuth: TenantAuthorizationService,
  ) {}

  create(dto: CreateOperatingHourDto, user: AuthenticatedUser) {
    const tenantId = this.tenantAuth.resolveTenantId(dto, user);
    return this.prisma.operatingHour.create({
      data: { ...dto, tenantId },
    });
  }

  findAll() {
    return this.prisma.operatingHour.findMany();
  }

  findOne(id: string) {
    return this.prisma.operatingHour.findUnique({
      where: { id },
    });
  }

  update(id: string, updateOperatingHourDto: UpdateOperatingHourDto) {
    return this.prisma.operatingHour.update({
      where: { id },
      data: updateOperatingHourDto,
    });
  }

  async remove(id: string) {
    const operatingHour = await this.prisma.operatingHour.findUnique({
      where: { id },
    });
    if (!operatingHour) {
      throw new NotFoundException(`Operating Hour with ID ${id} not found`);
    }
    return this.prisma.operatingHour.delete({ where: { id } });
  }
}
