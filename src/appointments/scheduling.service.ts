import { Injectable, BadRequestException } from '@nestjs/common';
import { AppointmentRepository } from './appointment-repository.service';
import { DateTimeUtils } from './utils/date-time.utils';

export const DEFAULT_SERVICE_DURATION_MINUTES = 30;

@Injectable()
export class SchedulingService {
  constructor(private readonly repo: AppointmentRepository) {}

  async assertNoConflict(
    tenantId: string,
    startUtc: Date,
    durationMinutes: number,
    excludeId?: string,
  ): Promise<void> {
    const { start: dayStart, end: dayEnd } =
      DateTimeUtils.dayRangeUtc(startUtc);
    const dayAppointments = await this.repo.findDayAppointments(
      tenantId,
      dayStart,
      dayEnd,
    );

    const start = startUtc.getTime();
    const end = start + durationMinutes * 60_000;

    for (const app of dayAppointments) {
      if (app.id === excludeId) continue;

      const aStart = new Date(app.date).getTime();
      const aDuration =
        app.service?.duration || DEFAULT_SERVICE_DURATION_MINUTES;
      const aEnd = aStart + aDuration * 60_000;

      if (start < aEnd && aStart < end) {
        const conflictStart = new Date(aStart);
        const conflictEnd = new Date(aEnd);
        throw new BadRequestException(
          `Time slot conflict: an appointment already exists from ${DateTimeUtils.formatTimeUTC(
            conflictStart,
          )} to ${DateTimeUtils.formatTimeUTC(conflictEnd)}.`,
        );
      }
    }
  }
}
