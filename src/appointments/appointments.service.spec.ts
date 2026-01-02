import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { AppointmentStatus, DayOfWeek, PaymentStatus } from '@prisma/client';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: PrismaService,
          useValue: {
            appointment: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            tenant: {
              findUnique: jest.fn(),
            },
            customer: {
              findUnique: jest.fn(),
            },
            service: {
              findUnique: jest.fn(),
            },
            payment: {
              findUnique: jest.fn(),
            },
            subscription: {
              findUnique: jest.fn(),
            },
            plan: {
              findUnique: jest.fn(),
            },
            operatingHour: {
              findFirst: jest.fn(),
            },
            tenantCustomer: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Default mock for transaction
    (prisma as any).$transaction = jest
      .fn()
      .mockImplementation((cb) => cb(prisma));
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

  const mockOperatingHour = {
    startTime: '08:00',
    endTime: '18:00',
    isClosed: false,
  };

  describe('create', () => {
    it('should create an appointment successfully', async () => {
      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-1' } as any);
      jest
        .spyOn(prisma.customer, 'findUnique')
        .mockResolvedValue({ id: 'customer-1' } as any);
      jest
        .spyOn(prisma.service, 'findUnique')
        .mockResolvedValue({ id: 'service-1' } as any);
      jest.spyOn(prisma.payment, 'findUnique').mockResolvedValue({
        id: 'payment-1',
        status: PaymentStatus.APPROVED,
      } as any);
      jest
        .spyOn(prisma.operatingHour, 'findFirst')
        .mockResolvedValue(mockOperatingHour as any);
      jest.spyOn(prisma.appointment, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.appointment, 'create')
        .mockResolvedValue({ id: 'app-1', ...createDto } as any);
      jest
        .spyOn(prisma.tenantCustomer, 'findUnique')
        .mockResolvedValue({ id: 'link-1' } as any);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(prisma.appointment.create).toHaveBeenCalled();
    });

    it('should throw if date is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await expect(
        service.create({ ...createDto, date: pastDate.toISOString() }),
      ).rejects.toThrow(
        new BadRequestException('The appointment date is in the past.'),
      );
    });

    it('should create an appointment even if payment is pending', async () => {
      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-1' } as any);
      jest
        .spyOn(prisma.customer, 'findUnique')
        .mockResolvedValue({ id: 'customer-1' } as any);
      jest
        .spyOn(prisma.service, 'findUnique')
        .mockResolvedValue({ id: 'service-1' } as any);
      jest.spyOn(prisma.payment, 'findUnique').mockResolvedValue({
        id: 'payment-1',
        status: PaymentStatus.PENDING,
      } as any);
      jest
        .spyOn(prisma.operatingHour, 'findFirst')
        .mockResolvedValue(mockOperatingHour as any);
      jest.spyOn(prisma.appointment, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.appointment, 'create').mockResolvedValue({
        id: 'app-1',
        ...createDto,
        status: 'PENDING',
      } as any);
      jest
        .spyOn(prisma.tenantCustomer, 'findUnique')
        .mockResolvedValue({ id: 'link-1' } as any);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(prisma.appointment.create).toHaveBeenCalled();
    });

    it('should throw if business is closed on that day', async () => {
      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-1' } as any);
      jest
        .spyOn(prisma.customer, 'findUnique')
        .mockResolvedValue({ id: 'customer-1' } as any);
      jest
        .spyOn(prisma.service, 'findUnique')
        .mockResolvedValue({ id: 'service-1' } as any);
      jest.spyOn(prisma.payment, 'findUnique').mockResolvedValue({
        id: 'payment-1',
        status: PaymentStatus.APPROVED,
      } as any);
      jest.spyOn(prisma.operatingHour, 'findFirst').mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException('The business is closed on the chosen date.'),
      );
    });

    it('should throw if time is outside operating hours', async () => {
      const earlyDate = new Date(futureDate);
      earlyDate.setUTCHours(5, 0); // 05:00 AM

      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-1' } as any);
      jest
        .spyOn(prisma.customer, 'findUnique')
        .mockResolvedValue({ id: 'customer-1' } as any);
      jest
        .spyOn(prisma.service, 'findUnique')
        .mockResolvedValue({ id: 'service-1' } as any);
      jest.spyOn(prisma.payment, 'findUnique').mockResolvedValue({
        id: 'payment-1',
        status: PaymentStatus.APPROVED,
      } as any);
      jest
        .spyOn(prisma.operatingHour, 'findFirst')
        .mockResolvedValue(mockOperatingHour as any);

      await expect(
        service.create({ ...createDto, date: earlyDate.toISOString() }),
      ).rejects.toThrow(
        new BadRequestException(
          'The chosen time is outside of operating hours.',
        ),
      );
    });

    it('should throw if appointment conflict exists', async () => {
      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-1' } as any);
      jest
        .spyOn(prisma.customer, 'findUnique')
        .mockResolvedValue({ id: 'customer-1' } as any);
      jest
        .spyOn(prisma.service, 'findUnique')
        .mockResolvedValue({ id: 'service-1' } as any);
      jest.spyOn(prisma.payment, 'findUnique').mockResolvedValue({
        id: 'payment-1',
        status: PaymentStatus.APPROVED,
      } as any);
      jest
        .spyOn(prisma.operatingHour, 'findFirst')
        .mockResolvedValue(mockOperatingHour as any);
      jest
        .spyOn(prisma.appointment, 'findFirst')
        .mockResolvedValue({ id: 'existing' } as any);

      await expect(
        service.create({ ...createDto, paymentId: undefined }),
      ).rejects.toThrow(
        new BadRequestException(
          'Already exists an appointment in the chosen date.',
        ),
      );
    });

    it('should create TenantCustomer link if it does not exist', async () => {
      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-1' } as any);
      jest
        .spyOn(prisma.customer, 'findUnique')
        .mockResolvedValue({ id: 'customer-1' } as any);
      jest
        .spyOn(prisma.service, 'findUnique')
        .mockResolvedValue({ id: 'service-1' } as any);
      jest.spyOn(prisma.payment, 'findUnique').mockResolvedValue({
        id: 'payment-1',
        status: PaymentStatus.APPROVED,
      } as any);
      jest
        .spyOn(prisma.operatingHour, 'findFirst')
        .mockResolvedValue(mockOperatingHour as any);
      jest.spyOn(prisma.appointment, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.appointment, 'create')
        .mockResolvedValue({ id: 'app-1', ...createDto } as any);
      jest.spyOn(prisma.tenantCustomer, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.tenantCustomer, 'create')
        .mockResolvedValue({ id: 'new-link' } as any);

      await service.create(createDto);

      expect(prisma.tenantCustomer.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should allow confirming an appointment if payment is approved', async () => {
      jest
        .spyOn(prisma.appointment, 'findUnique')
        .mockResolvedValue({ id: 'app-1', paymentId: 'payment-1' } as any);
      jest.spyOn(prisma.payment, 'findUnique').mockResolvedValue({
        id: 'payment-1',
        status: PaymentStatus.APPROVED,
      } as any);
      jest
        .spyOn(prisma.appointment, 'update')
        .mockResolvedValue({ id: 'app-1', status: 'CONFIRMED' } as any);

      const result = await service.update('app-1', {
        status: AppointmentStatus.CONFIRMED,
      });
      expect(result.status).toBe('CONFIRMED');
    });

    it('should throw if confirming an appointment with unapproved payment', async () => {
      jest
        .spyOn(prisma.appointment, 'findUnique')
        .mockResolvedValue({ id: 'app-1', paymentId: 'payment-1' } as any);
      jest.spyOn(prisma.payment, 'findUnique').mockResolvedValue({
        id: 'payment-1',
        status: PaymentStatus.PENDING,
      } as any);

      await expect(
        service.update('app-1', { status: AppointmentStatus.CONFIRMED }),
      ).rejects.toThrow(
        new BadRequestException(
          'The appointment can only be confirmed if the payment is approved.',
        ),
      );
    });
  });

  describe('checkPendingAppointments', () => {
    it('should cancel stale pending appointments with unapproved payments', async () => {
      const staleAppointment = {
        id: 'stale-1',
        status: 'PENDING',
        payment: { status: 'PENDING' },
      };

      jest
        .spyOn(prisma.appointment, 'findMany')
        .mockResolvedValue([staleAppointment] as any);
      jest
        .spyOn(prisma.appointment, 'update')
        .mockResolvedValue({ id: 'stale-1' } as any);

      await service.checkPendingAppointments();

      expect(prisma.appointment.update).toHaveBeenCalledWith({
        where: { id: 'stale-1' },
        data: {
          status: 'CANCELED',
          cancellationReason: 'payment not approved',
        },
      });
    });
  });

  describe('validateSubscriptionUsage', () => {
    it('should allow appointment if within limit', async () => {
      const subscription = {
        id: 'sub-1',
        status: 'ACTIVE',
        planId: 'plan-1',
        nextBilling: new Date('2024-02-01T00:00:00Z'),
        tenantCustomer: { tenantId: 'tenant-1', customerId: 'customer-1' },
      };

      const plan = { id: 'plan-1', maxAppointments: 4, interval: 'MONTHLY' };

      jest
        .spyOn(prisma.subscription, 'findUnique')
        .mockResolvedValue(subscription as any);
      jest.spyOn(prisma.plan, 'findUnique').mockResolvedValue(plan as any);
      jest.spyOn(prisma.appointment, 'count').mockResolvedValue(3); // Usage is 3, limit 4

      // Mock other related entity checks
      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-1' } as any);
      jest
        .spyOn(prisma.customer, 'findUnique')
        .mockResolvedValue({ id: 'customer-1' } as any);
      jest
        .spyOn(prisma.service, 'findUnique')
        .mockResolvedValue({ id: 'service-1' } as any);
      jest
        .spyOn(prisma.payment, 'findUnique')
        .mockResolvedValue({ id: 'payment-1' } as any);
      jest
        .spyOn(prisma.operatingHour, 'findFirst')
        .mockResolvedValue(mockOperatingHour as any);
      jest.spyOn(prisma.appointment, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.appointment, 'create')
        .mockResolvedValue({ id: 'app-limit-ok' } as any);
      jest
        .spyOn(prisma.tenantCustomer, 'findUnique')
        .mockResolvedValue({ id: 'tc-1' } as any);

      const dtoWithSub = { ...createDto, usedSubscriptionId: 'sub-1' };
      await service.create(dtoWithSub);

      expect(prisma.appointment.count).toHaveBeenCalled();
    });

    it('should throw if limit exceeded', async () => {
      const subscription = {
        id: 'sub-1',
        status: 'ACTIVE',
        planId: 'plan-1',
        nextBilling: new Date('2024-02-01T00:00:00Z'),
        tenantCustomer: { tenantId: 'tenant-1', customerId: 'customer-1' },
      };

      const plan = { id: 'plan-1', maxAppointments: 4, interval: 'MONTHLY' };

      jest
        .spyOn(prisma.subscription, 'findUnique')
        .mockResolvedValue(subscription as any);
      jest.spyOn(prisma.plan, 'findUnique').mockResolvedValue(plan as any);
      jest.spyOn(prisma.appointment, 'count').mockResolvedValue(4); // Usage is 4, limit 4 (>=)

      // Mock basic entity checks
      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-1' } as any);
      jest
        .spyOn(prisma.customer, 'findUnique')
        .mockResolvedValue({ id: 'customer-1' } as any);
      jest
        .spyOn(prisma.service, 'findUnique')
        .mockResolvedValue({ id: 'service-1' } as any);
      jest
        .spyOn(prisma.payment, 'findUnique')
        .mockResolvedValue({ id: 'payment-1' } as any);

      const dtoWithSub = { ...createDto, usedSubscriptionId: 'sub-1' };

      await expect(service.create(dtoWithSub)).rejects.toThrow(
        new BadRequestException(
          'You have reached the limit of 4 appointments for this cycle.',
        ),
      );
    });

    it('should allow if maxAppointments is -1 (unlimited)', async () => {
      const subscription = {
        id: 'sub-1',
        status: 'ACTIVE',
        planId: 'plan-1',
        nextBilling: new Date('2024-02-01T00:00:00Z'),
        tenantCustomer: { tenantId: 'tenant-1', customerId: 'customer-1' },
      };

      const plan = { id: 'plan-1', maxAppointments: -1, interval: 'MONTHLY' };

      jest
        .spyOn(prisma.subscription, 'findUnique')
        .mockResolvedValue(subscription as any);
      jest.spyOn(prisma.plan, 'findUnique').mockResolvedValue(plan as any);

      // Mock other related entity checks
      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-1' } as any);
      jest
        .spyOn(prisma.customer, 'findUnique')
        .mockResolvedValue({ id: 'customer-1' } as any);
      jest
        .spyOn(prisma.service, 'findUnique')
        .mockResolvedValue({ id: 'service-1' } as any);
      jest
        .spyOn(prisma.payment, 'findUnique')
        .mockResolvedValue({ id: 'payment-1' } as any);
      jest
        .spyOn(prisma.operatingHour, 'findFirst')
        .mockResolvedValue(mockOperatingHour as any);
      jest.spyOn(prisma.appointment, 'findFirst').mockResolvedValue(null);
      jest
        .spyOn(prisma.appointment, 'create')
        .mockResolvedValue({ id: 'app-unlimited' } as any);
      jest
        .spyOn(prisma.tenantCustomer, 'findUnique')
        .mockResolvedValue({ id: 'tc-1' } as any);

      const dtoWithSub = { ...createDto, usedSubscriptionId: 'sub-1' };
      await service.create(dtoWithSub);

      expect(prisma.appointment.count).not.toHaveBeenCalled();
    });
  });
});
