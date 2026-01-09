import { AppointmentStatus } from '../enums';

/**
 * Appointment entity interface
 */
export interface IAppointment {
  id: string;
  date: Date | string;
  status: AppointmentStatus;
  cancellationReason?: string | null;
  canceledAt?: Date | string | null;
  price: string | number;
  externalEventId?: string | null;
  tenantId: string;
  customerId: string;
  serviceId?: string | null;
  paymentId?: string | null;
  usedSubscriptionId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Create appointment request interface
 */
export interface ICreateAppointment {
  date: string;
  tenantId: string;
  customerId: string;
  status?: AppointmentStatus;
  cancellationReason?: string;
  price?: number;
  externalEventId?: string;
  serviceId?: string;
  usedSubscriptionId?: string;
  paymentId?: string;
}

/**
 * Update appointment request interface
 */
export interface IUpdateAppointment extends Partial<Omit<ICreateAppointment, 'tenantId' | 'customerId'>> {}
