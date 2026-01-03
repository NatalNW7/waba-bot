import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DateTimeUtils } from './utils/date-time.utils';

@Injectable()
export class AppointmentOperatingHoursValidator {
  constructor(private readonly prisma: PrismaService) {}

  async assertWithinOperatingHours(
    tenantId: string,
    dateUtc: Date,
  ): Promise<void> {
    const dayOfWeekMap: Record<number, string> = {
      0: 'SUNDAY',
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY',
    };

    const dayName = dayOfWeekMap[dateUtc.getUTCDay()];
    const operatingHour = await this.prisma.operatingHour.findFirst({
      where: {
        tenantId,
        day: dayName as any,
      },
    });

    if (!operatingHour || operatingHour.isClosed) {
      throw new BadRequestException(
        'The business is closed on the chosen date.',
      );
    }

    const appointmentTime = DateTimeUtils.formatTimeUTC(dateUtc);

    if (
      appointmentTime < operatingHour.startTime ||
      appointmentTime > operatingHour.endTime
    ) {
      throw new BadRequestException(
        'The chosen time is outside of operating hours.',
      );
    }
  }
}
