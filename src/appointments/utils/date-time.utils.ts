export class DateTimeUtils {
  /**
   * Converts a date or string to a UTC Date object.
   */
  static toUtcDate(dateOrString: Date | string): Date {
    return new Date(dateOrString);
  }

  /**
   * Returns the start and end of the day in UTC for a given date.
   */
  static dayRangeUtc(date: Date): { start: Date; end: Date } {
    const start = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
    const end = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );
    return { start, end };
  }

  /**
   * Formats a date as "HH:mm" in UTC.
   */
  static formatTimeUTC(date: Date): string {
    return (
      date.getUTCHours().toString().padStart(2, '0') +
      ':' +
      date.getUTCMinutes().toString().padStart(2, '0')
    );
  }

  /**
   * Returns the current UTC Date.
   */
  static now(): Date {
    return new Date();
  }
}
