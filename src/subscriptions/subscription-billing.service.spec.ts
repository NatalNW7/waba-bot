import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionBillingService } from './subscription-billing.service';

describe('SubscriptionBillingService', () => {
  let service: SubscriptionBillingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscriptionBillingService],
    }).compile();

    service = module.get<SubscriptionBillingService>(
      SubscriptionBillingService,
    );
  });

  it('should calculate next billing date correctly for MONTHLY', () => {
    const startDate = new Date('2025-01-01T00:00:00Z');
    const result = service.calculateNextBilling(startDate, 'MONTHLY');
    expect(result.getUTCMonth()).toBe(1); // February
    expect(result.getUTCFullYear()).toBe(2025);
  });

  it('should calculate next billing date correctly for QUARTERLY', () => {
    const startDate = new Date('2025-01-01T00:00:00Z');
    const result = service.calculateNextBilling(startDate, 'QUARTERLY');
    expect(result.getUTCMonth()).toBe(3); // April
  });

  it('should calculate next billing date correctly for YEARLY', () => {
    const startDate = new Date('2025-01-01T00:00:00Z');
    const result = service.calculateNextBilling(startDate, 'YEARLY');
    expect(result.getUTCFullYear()).toBe(2026);
  });
});
