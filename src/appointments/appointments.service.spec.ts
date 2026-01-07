import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { AppointmentRepository } from './appointment-repository.service';
import { RelatedEntitiesValidator } from './related-entities-validator.service';
import { AppointmentOperatingHoursValidator } from './appointment-operating-hours.service';
import { SchedulingService } from './scheduling.service';
import { AppointmentPaymentValidator } from './appointment-payment.service';
import { TenantCustomerService } from './tenant-customer.service';
import { BadRequestException } from '@nestjs/common';
import { AppointmentStatus, PaymentStatus } from '@prisma/client';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let repo: AppointmentRepository;
  let validator: RelatedEntitiesValidator;
  let scheduling: SchedulingService;
  let pmValidator: AppointmentPaymentValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: AppointmentRepository,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findStalePending: jest.fn(),
            withTransaction: jest.fn().mockImplementation((cb) => cb({})),
          },
        },
        {
          provide: RelatedEntitiesValidator,
          useValue: {
            validateForCreate: jest.fn(),
            validateForUpdate: jest.fn(),
          },
        },
        {
          provide: AppointmentOperatingHoursValidator,
          useValue: {
            assertWithinOperatingHours: jest.fn(),
          },
        },
        {
          provide: SchedulingService,
          useValue: {
            assertNoConflict: jest.fn(),
          },
        },
        {
          provide: AppointmentPaymentValidator,
          useValue: {
            isPaymentApproved: jest.fn(),
          },
        },
        {
          provide: TenantCustomerService,
          useValue: {
            ensureTenantCustomerLink: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    repo = module.get<AppointmentRepository>(AppointmentRepository);
    validator = module.get<RelatedEntitiesValidator>(RelatedEntitiesValidator);
    scheduling = module.get<SchedulingService>(SchedulingService);
    pmValidator = module.get<AppointmentPaymentValidator>(
      AppointmentPaymentValidator,
    );
  });

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 1);
  futureDate.setUTCHours(10, 0, 0, 0);

  const createDto = {
    date: futureDate.toISOString(),
    price: 50,
    tenantId: 'tenant-1',
    customerId: 'customer-1',
    serviceId: 'service-1',
    paymentId: 'payment-1',
  };

  describe('create', () => {
    it('should create an appointment successfully', async () => {
      const mockService = { id: 'service-1', price: 60, duration: 30 };
      (validator.validateForCreate as jest.Mock).mockResolvedValue({
        service: mockService,
        subscription: null,
      });
      (pmValidator.isPaymentApproved as jest.Mock).mockResolvedValue(true);
      (repo.create as jest.Mock).mockResolvedValue({ id: 'app-1', price: 60 });

      const result = await service.create({ ...createDto, price: undefined });

      expect(result.id).toBe('app-1');
      expect(result.price).toBe(60);
      expect(repo.create).toHaveBeenCalled();
    });

    it('should throw if both serviceId and usedSubscriptionId are missing', async () => {
      await expect(
        service.create({
          ...createDto,
          serviceId: undefined,
          usedSubscriptionId: undefined,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if date is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await expect(
        service.create({ ...createDto, date: pastDate.toISOString() }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should allow confirming an appointment if payment is approved', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue({
        id: 'app-1',
        paymentId: 'payment-1',
      });
      (pmValidator.isPaymentApproved as jest.Mock).mockResolvedValue(true);
      (repo.update as jest.Mock).mockResolvedValue({
        id: 'app-1',
        status: 'CONFIRMED',
      });

      const result = await service.update('app-1', {
        status: AppointmentStatus.CONFIRMED,
      });
      expect(result.status).toBe('CONFIRMED');
    });

    it('should throw if confirming an appointment with unapproved payment', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue({
        id: 'app-1',
        paymentId: 'payment-1',
      });
      (pmValidator.isPaymentApproved as jest.Mock).mockResolvedValue(false);

      await expect(
        service.update('app-1', { status: AppointmentStatus.CONFIRMED }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkPendingAppointments', () => {
    it('should cancel stale pending appointments with unapproved payments', async () => {
      const staleAppointment = {
        id: 'app-1',
        status: 'PENDING',
        payment: { status: 'PENDING' },
      };

      (repo.findStalePending as jest.Mock).mockResolvedValue([
        staleAppointment,
      ]);
      (repo.update as jest.Mock).mockResolvedValue({ id: 'app-1' });

      await service.checkPendingAppointments();

      expect(repo.update).toHaveBeenCalledWith('app-1', {
        status: 'CANCELED',
        cancellationReason: 'payment not approved',
      });
    });
  });
});
