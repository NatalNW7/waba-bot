import { PaymentInterval } from '../enums';

/**
 * Plan entity interface (customer subscription plans)
 */
export interface IPlan {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  interval: PaymentInterval;
  maxAppointments: number;
  tenantId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Create plan request interface
 */
export interface ICreatePlan {
  name: string;
  price: number;
  tenantId: string;
  maxAppointments: number;
  description?: string;
  interval?: PaymentInterval;
}

/**
 * Update plan request interface
 */
export interface IUpdatePlan extends Partial<Omit<ICreatePlan, 'tenantId'>> {}
