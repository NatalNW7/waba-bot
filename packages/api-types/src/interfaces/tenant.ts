import { SubscriptionStatus } from '../enums';

/**
 * Tenant entity interface
 */
export interface ITenant {
  id: string;
  name: string;
  wabaId?: string | null;
  phoneId?: string | null;
  accessToken?: string | null;
  email: string;
  phone: string;
  mpAccessToken?: string | null;
  mpPublicKey?: string | null;
  mpRefToken?: string | null;
  saasStatus: SubscriptionStatus;
  saasNextBilling?: Date | string | null;
  saasPaymentMethodId?: string | null;
  saasPlanId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Create tenant request interface
 */
export interface ICreateTenant {
  name: string;
  email: string;
  phone: string;
  saasPlanId: string;
  wabaId?: string;
  phoneId?: string;
  accessToken?: string;
  mpAccessToken?: string;
  mpPublicKey?: string;
  mpRefToken?: string;
  saasStatus?: SubscriptionStatus;
  saasNextBilling?: string;
  saasPaymentMethodId?: string;
}

/**
 * Update tenant request interface
 */
export interface IUpdateTenant extends Partial<ICreateTenant> {}
