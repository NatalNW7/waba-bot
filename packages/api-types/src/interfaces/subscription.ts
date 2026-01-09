import { SubscriptionStatus } from '../enums';

/**
 * Subscription entity interface
 */
export interface ISubscription {
  id: string;
  status: SubscriptionStatus;
  startDate: Date | string;
  nextBilling: Date | string;
  cardTokenId?: string;
  externalId?: string | null;
  planId: string;
  tenantCustomerId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Create subscription request interface
 */
export interface ICreateSubscription {
  cardTokenId: string;
  planId: string;
  customerId: string;
  status?: SubscriptionStatus;
  startDate?: string;
  nextBilling?: string;
}

/**
 * Update subscription request interface
 */
export interface IUpdateSubscription extends Partial<Omit<ICreateSubscription, 'planId' | 'customerId' | 'cardTokenId'>> {}
