import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { AppointmentRepository } from './appointment-repository.service';
import { RelatedEntitiesValidator } from './related-entities-validator.service';
import { AppointmentOperatingHoursValidator } from './appointment-operating-hours.service';
import { SchedulingService } from './scheduling.service';
import { AppointmentPaymentValidator } from './appointment-payment.service';
import { TenantCustomerService } from './tenant-customer.service';
import { BadRequestException } from '@nestjs/common';

describe('AppointmentsService (Integration)', () => {
  let service: AppointmentsService;
  let repo: AppointmentRepository;
  let validator: RelatedEntitiesValidator;
  let scheduling: SchedulingService;

  const mockRepo = {
    withTransaction: jest.fn((cb) => cb('mock-tx')),
    create: jest.fn(),
    findMany: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockValidator = {
    validateForCreate: jest.fn(),
    validateForUpdate: jest.fn(),
  };

  const mockScheduling = {
    assertNoConflict: jest.fn(),
  };

  const mockOperatingHours = {
    assertWithinOperatingHours: jest.fn(),
  };

  const mockPayment = {
    isPaymentApproved: jest.fn(),
  };

  const mockTenantCustomer = {
    ensureTenantCustomerLink: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: AppointmentRepository, useValue: mockRepo },
        { provide: RelatedEntitiesValidator, useValue: mockValidator },
        { provide: SchedulingService, useValue: mockScheduling },
        {
          provide: AppointmentOperatingHoursValidator,
          useValue: mockOperatingHours,
        },
        { provide: AppointmentPaymentValidator, useValue: mockPayment },
        { provide: TenantCustomerService, useValue: mockTenantCustomer },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    repo = module.get<AppointmentRepository>(AppointmentRepository);
    validator = module.get<RelatedEntitiesValidator>(RelatedEntitiesValidator);
    scheduling = module.get<SchedulingService>(SchedulingService);
  });

  describe('create', () => {
    it('should create an appointment and link tenant-customer', async () => {
      const dto = {
        tenantId: 't1',
        customerId: 'c1',
        serviceId: 's1',
        date: '2030-01-03T10:00:00Z',
      } as any;

      mockValidator.validateForCreate.mockResolvedValue({
        service: { id: 's1', price: 100 },
      });
      mockOperatingHours.assertWithinOperatingHours.mockResolvedValue(
        undefined,
      );
      mockScheduling.assertNoConflict.mockResolvedValue(undefined);
      mockRepo.create.mockResolvedValue({ id: 'a1' });

      const result = await service.create(dto);

      expect(result).toEqual({ id: 'a1' });
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockTenantCustomer.ensureTenantCustomerLink).toHaveBeenCalled();
    });

    it('should throw if date is in the past', async () => {
      const dto = {
        date: '2020-01-01T10:00:00Z',
      } as any;

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });
});
