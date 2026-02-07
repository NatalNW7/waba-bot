import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantAuthorizationService } from '../common';
import { CreateOperatingHourDto } from './dto/create-operating-hour.dto';
import { UpdateOperatingHourDto } from './dto/update-operating-hour.dto';
import { ERROR_MESSAGES } from './operating-hours.constants';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import type { OperatingHour, DayOfWeek } from '@prisma/client';

@Injectable()
export class OperatingHoursService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantAuth: TenantAuthorizationService,
  ) {}

  /**
   * Validates that endTime is after startTime
   */
  private validateTimeRange(startTime: string, endTime: string): void {
    if (endTime <= startTime) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_TIME_RANGE);
    }
  }

  /**
   * Checks if two time ranges overlap (adjacent times are allowed)
   */
  private hasOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    // Ranges overlap if: start1 < end2 AND start2 < end1
    // Adjacent ranges (end1 === start2) are NOT considered overlapping
    return start1 < end2 && start2 < end1;
  }

  /**
   * Checks for overlapping operating hours on the same day
   * @param tenantId - Tenant to check against
   * @param day - Day of week
   * @param startTime - Start time to check
   * @param endTime - End time to check
   * @param excludeId - Optional ID to exclude (for updates)
   */
  private async checkForOverlaps(
    tenantId: string,
    day: DayOfWeek,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<void> {
    const existingHours = await this.prisma.operatingHour.findMany({
      where: {
        tenantId,
        day,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    for (const existing of existingHours) {
      if (
        this.hasOverlap(
          startTime,
          endTime,
          existing.startTime,
          existing.endTime,
        )
      ) {
        throw new ConflictException(ERROR_MESSAGES.OVERLAP);
      }
    }
  }

  async create(
    dto: CreateOperatingHourDto,
    user: AuthenticatedUser,
  ): Promise<OperatingHour> {
    const tenantId = this.tenantAuth.resolveTenantId(dto, user);

    this.validateTimeRange(dto.startTime, dto.endTime);
    await this.checkForOverlaps(tenantId, dto.day, dto.startTime, dto.endTime);

    return this.prisma.operatingHour.create({
      data: { ...dto, tenantId },
    });
  }

  findAll(): Promise<OperatingHour[]> {
    return this.prisma.operatingHour.findMany();
  }

  findOne(id: string): Promise<OperatingHour | null> {
    return this.prisma.operatingHour.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    dto: UpdateOperatingHourDto,
  ): Promise<OperatingHour> {
    const existing = await this.prisma.operatingHour.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND(id));
    }

    // Merge existing values with updates for validation
    const startTime = dto.startTime ?? existing.startTime;
    const endTime = dto.endTime ?? existing.endTime;
    const day = dto.day ?? existing.day;

    this.validateTimeRange(startTime, endTime);
    await this.checkForOverlaps(existing.tenantId, day, startTime, endTime, id);

    return this.prisma.operatingHour.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string): Promise<OperatingHour> {
    const operatingHour = await this.prisma.operatingHour.findUnique({
      where: { id },
    });
    if (!operatingHour) {
      throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND(id));
    }
    return this.prisma.operatingHour.delete({ where: { id } });
  }
}
