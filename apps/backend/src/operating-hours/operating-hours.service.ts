import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOperatingHourDto } from './dto/create-operating-hour.dto';
import { UpdateOperatingHourDto } from './dto/update-operating-hour.dto';

@Injectable()
export class OperatingHoursService {
  constructor(private readonly prisma: PrismaService) {}

  create(createOperatingHourDto: CreateOperatingHourDto) {
    return this.prisma.operatingHour.create({
      data: createOperatingHourDto,
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
