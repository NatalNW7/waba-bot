import { PaymentStatus, PaymentType, PaymentMethod } from '../enums';

/**
 * Payment entity interface
 */
export interface IPayment {
  id: string;
  externalId?: string | null;
  amount: string | number;
  netAmount?: string | number | null;
  fee?: string | number | null;
  status: PaymentStatus;
  type: PaymentType;
  method: PaymentMethod;
  tenantId: string;
  customerId?: string | null;
  subscriptionId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Create payment request interface
 */
export interface ICreatePayment {
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  tenantId: string;
  externalId?: string;
  netAmount?: number;
  fee?: number;
  status?: PaymentStatus;
  customerId?: string;
  subscriptionId?: string;
}

/**
 * Update payment request interface
 */
export interface IUpdatePayment extends Partial<Omit<ICreatePayment, 'tenantId'>> {}
