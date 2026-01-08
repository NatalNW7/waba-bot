import { Test, TestingModule } from '@nestjs/testing';
import { RelatedEntitiesValidator } from './related-entities-validator.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentRepository } from './appointment-repository.service';
import { BadRequestException } from '@nestjs/common';

describe('RelatedEntitiesValidator', () => {
  let service: RelatedEntitiesValidator;
  let prisma: PrismaService;

  const mockPrisma = {
    tenant: { findUnique: jest.fn() },
    customer: { findUnique: jest.fn() },
    service: { findUnique: jest.fn() },
    payment: { findUnique: jest.fn() },
    subscription: { findUnique: jest.fn() },
    appointment: { findFirst: jest.fn() },
    plan: { findUnique: jest.fn() },
  };

  const mockRepo = {
    countSubscriptionUsage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RelatedEntitiesValidator,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AppointmentRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<RelatedEntitiesValidator>(RelatedEntitiesValidator);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('validateForCreate', () => {
    it('should throw if tenant does not exist', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null);
      await expect(
        service.validateForCreate({ tenantId: 'not-exists' } as any),
      ).rejects.toThrow(
        new BadRequestException('The provided tenantId does not exist.'),
      );
    });

    it('should throw if customer does not exist', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: 't1' });
      mockPrisma.customer.findUnique.mockResolvedValue(null);
      await expect(
        service.validateForCreate({
          tenantId: 't1',
          customerId: 'not-exists',
        } as any),
      ).rejects.toThrow(
        new BadRequestException('The provided customerId does not exist.'),
      );
    });

    it('should throw if payment is already associated', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue({ id: 't1' });
      mockPrisma.customer.findUnique.mockResolvedValue({ id: 'c1' });
      mockPrisma.payment.findUnique.mockResolvedValue({ id: 'p1' });
      mockPrisma.appointment.findFirst.mockResolvedValue({ id: 'a1' });

      await expect(
        service.validateForCreate({
          tenantId: 't1',
          customerId: 'c1',
          paymentId: 'p1',
        } as any),
      ).rejects.toThrow(
        new BadRequestException(
          'The provided paymentId is already associated with another appointment.',
        ),
      );
    });
  });
});
