import { DayOfWeek } from '../enums';

/**
 * Operating hour entity interface
 */
export interface IOperatingHour {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  isClosed: boolean;
  onlyForSubscribers: boolean;
  tenantId: string;
}

/**
 * Create operating hour request interface
 */
export interface ICreateOperatingHour {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  tenantId: string;
  isClosed?: boolean;
  onlyForSubscribers?: boolean;
}

/**
 * Update operating hour request interface
 */
export interface IUpdateOperatingHour extends Partial<Omit<ICreateOperatingHour, 'tenantId'>> {}
