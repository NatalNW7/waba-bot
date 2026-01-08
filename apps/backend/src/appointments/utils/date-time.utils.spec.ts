import { DateTimeUtils } from './date-time.utils';

describe('DateTimeUtils', () => {
  it('should return start and end of day in UTC', () => {
    const date = new Date('2026-01-03T12:00:00Z');
    const { start, end } = DateTimeUtils.dayRangeUtc(date);

    expect(start.toISOString()).toBe('2026-01-03T00:00:00.000Z');
    expect(end.toISOString()).toBe('2026-01-03T23:59:59.999Z');
  });

  it('should format time as HH:mm in UTC', () => {
    const date = new Date('2026-01-03T15:45:00Z');
    expect(DateTimeUtils.formatTimeUTC(date)).toBe('15:45');

    const date2 = new Date('2026-01-03T08:05:00Z');
    expect(DateTimeUtils.formatTimeUTC(date2)).toBe('08:05');
  });
});
