import { Injectable } from '@nestjs/common';

@Injectable()
export class SubscriptionBillingService {
  calculateNextBilling(startDate: Date, interval: string): Date {
    const nextBilling = new Date(startDate);
    switch (interval) {
      case 'MONTHLY':
        nextBilling.setUTCMonth(nextBilling.getUTCMonth() + 1);
        break;
      case 'QUARTERLY':
        nextBilling.setUTCMonth(nextBilling.getUTCMonth() + 3);
        break;
      case 'YEARLY':
        nextBilling.setUTCFullYear(nextBilling.getUTCFullYear() + 1);
        break;
      default:
        // Default to monthly if unknown
        nextBilling.setUTCMonth(nextBilling.getUTCMonth() + 1);
    }
    return nextBilling;
  }
}
