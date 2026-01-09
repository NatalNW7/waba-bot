import { PaymentInterval } from '../enums';

/**
 * SaaS Plan entity interface
 */
export interface ISaasPlan {
  id: string;
  name: string;
  price: string | number;
  description?: string | null;
  interval: PaymentInterval;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Create SaaS plan request interface
 */
export interface ICreateSaasPlan {
  name: string;
  price: number;
  description?: string;
  interval?: PaymentInterval;
}

/**
 * Update SaaS plan request interface
 */
export interface IUpdateSaasPlan extends Partial<ICreateSaasPlan> {}
