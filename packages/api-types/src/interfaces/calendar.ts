import { CalendarProvider } from '../enums';

/**
 * Calendar entity interface
 */
export interface ICalendar {
  id: string;
  provider: CalendarProvider;
  email: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry?: Date | string | null;
  tenantId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Create calendar request interface
 */
export interface ICreateCalendar {
  provider: CalendarProvider;
  email: string;
  accessToken: string;
  refreshToken: string;
  tenantId: string;
  tokenExpiry?: string;
}

/**
 * Update calendar request interface
 */
export interface IUpdateCalendar extends Partial<Omit<ICreateCalendar, 'tenantId'>> {}
