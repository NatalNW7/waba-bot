import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';

@Injectable()
export class CalendarsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCalendarDto: CreateCalendarDto) {
    return this.prisma.calendar.create({
      data: createCalendarDto,
    });
  }

  findAll() {
    return this.prisma.calendar.findMany();
  }

  findOne(id: string) {
    return this.prisma.calendar.findUnique({
      where: { id },
    });
  }

  update(id: string, updateCalendarDto: UpdateCalendarDto) {
    return this.prisma.calendar.update({
      where: { id },
      data: updateCalendarDto,
    });
  }

  async remove(id: string) {
    const calendar = await this.prisma.calendar.findUnique({ where: { id } });
    if (!calendar) {
      throw new NotFoundException(`Calendar with ID ${id} not found`);
    }
    return this.prisma.calendar.delete({ where: { id } });
  }
}
