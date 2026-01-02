import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { AppointmentStatus, PaymentStatus } from '@prisma/client';

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
    it('should create an appointment successfully with automated price from service', async () => {
      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-1' } as any);
      jest
        .spyOn(prisma.customer, 'findUnique')
        .mockResolvedValue({ id: 'customer-1' } as any);
      jest
        .spyOn(prisma.service, 'findUnique')
        .mockResolvedValue({ id: 'service-1', price: 60, duration: 30 } as any);
      jest.spyOn(prisma.payment, 'findUnique').mockResolvedValue({
        id: 'payment-1',
        status: PaymentStatus.APPROVED,
      } as any);
      jest
        .spyOn(prisma.operatingHour, 'findFirst')
        .mockResolvedValue(mockOperatingHour as any);
      jest.spyOn(prisma.appointment, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.appointment, 'findMany').mockResolvedValue([]);
      jest
        .spyOn(prisma.appointment, 'create')
        .mockImplementation(({ data }: any) => {
          return Promise.resolve({ id: 'app-1', ...data });
        });
      jest.spyOn(prisma.tenantCustomer, 'findUnique').mockResolvedValue({
        id: 'link-1',
      } as any);

      const result = await service.create({ ...createDto, price: undefined });

      expect(result.id).toBe('app-1');
      expect(result.price).toBe(60);
      expect(prisma.appointment.create).toHaveBeenCalled();
    });

    it('should throw if both serviceId and usedSubscriptionId are missing', async () => {
      await expect(
        service.create({
          ...createDto,
          serviceId: undefined,
          usedSubscriptionId: undefined,
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'At least one of serviceId or usedSubscriptionId must be provided.',
        ),
      );
    });

    it('should create successfully with price 0 if subscription is used', async () => {
      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-1' } as any);
      jest
        .spyOn(prisma.customer, 'findUnique')
        .mockResolvedValue({ id: 'customer-1' } as any);
      jest.spyOn(prisma.subscription, 'findUnique').mockResolvedValue({
        id: 'sub-1',
        status: 'ACTIVE',
        planId: 'plan-1',
        nextBilling: new Date(),
        tenantCustomer: { tenantId: 'tenant-1', customerId: 'customer-1' },
      } as any);
      jest
        .spyOn(prisma.plan, 'findUnique')
        .mockResolvedValue({ id: 'plan-1', maxAppointments: -1 } as any);
      jest
        .spyOn(prisma.operatingHour, 'findFirst')
        .mockResolvedValue(mockOperatingHour as any);
      jest.spyOn(prisma.appointment, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.appointment, 'findMany').mockResolvedValue([]);
      jest
        .spyOn(prisma.appointment, 'create')
        .mockImplementation(({ data }: any) => {
          return Promise.resolve({ id: 'app-1', ...data });
        });
      jest
        .spyOn(prisma.tenantCustomer, 'findUnique')
        .mockResolvedValue({ id: 'tc-1' } as any);

      const result = await service.create({
        ...createDto,
        serviceId: undefined,
        usedSubscriptionId: 'sub-1',
        paymentId: undefined,
        price: undefined,
      });
      expect(result.id).toBe('app-1');
      expect(result.price).toBe(0);
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

    it('should throw if an overlap conflict exists (exact same time)', async () => {
      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-1' } as any);
      jest
        .spyOn(prisma.customer, 'findUnique')
        .mockResolvedValue({ id: 'customer-1' } as any);
      jest
        .spyOn(prisma.service, 'findUnique')
        .mockResolvedValue({ id: 'service-1', duration: 30, price: 50 } as any);
      jest.spyOn(prisma.payment, 'findUnique').mockResolvedValue({
        id: 'payment-1',
        status: PaymentStatus.APPROVED,
      } as any);
      jest
        .spyOn(prisma.operatingHour, 'findFirst')
        .mockResolvedValue(mockOperatingHour as any);

      const existingApp = {
        date: new Date(futureDate.toISOString()), // Force same UTC instance
        service: { duration: 30 },
      };

      jest
        .spyOn(prisma.appointment, 'findMany')
        .mockResolvedValue([existingApp] as any);

      await expect(service.create(createDto)).rejects.toThrow(
        /Time slot conflict/,
      );
    });

    it('should throw if an overlap conflict exists (new starts during existing)', async () => {
      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-1' } as any);
      jest
        .spyOn(prisma.customer, 'findUnique')
        .mockResolvedValue({ id: 'customer-1' } as any);
      jest
        .spyOn(prisma.service, 'findUnique')
        .mockResolvedValue({ id: 'service-1', duration: 30, price: 50 } as any);
      jest.spyOn(prisma.payment, 'findUnique').mockResolvedValue({
        id: 'payment-1',
        status: PaymentStatus.APPROVED,
      } as any);
      jest
        .spyOn(prisma.operatingHour, 'findFirst')
        .mockResolvedValue(mockOperatingHour as any);

      const existingAppStart = new Date(futureDate.toISOString());
      existingAppStart.setUTCHours(10, 0, 0, 0);

      const newAppStart = new Date(futureDate.toISOString());
      newAppStart.setUTCHours(10, 15, 0, 0);

      const existingApp = {
        date: existingAppStart,
        service: { duration: 30 },
      };

      jest
        .spyOn(prisma.appointment, 'findMany')
        .mockResolvedValue([existingApp] as any);

      await expect(
        service.create({ ...createDto, date: newAppStart.toISOString() }),
      ).rejects.toThrow(/Time slot conflict/);
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
        .mockResolvedValue({ id: 'service-1', price: 50 } as any);
      jest.spyOn(prisma.payment, 'findUnique').mockResolvedValue({
        id: 'payment-1',
        status: PaymentStatus.APPROVED,
      } as any);
      jest
        .spyOn(prisma.operatingHour, 'findFirst')
        .mockResolvedValue(mockOperatingHour as any);
      jest.spyOn(prisma.appointment, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.appointment, 'findMany').mockResolvedValue([]);
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
        id: 'app-1',
        status: 'PENDING',
        payment: { status: 'PENDING' },
      };

      jest
        .spyOn(prisma.appointment, 'findMany')
        .mockResolvedValue([staleAppointment] as any);
      jest
        .spyOn(prisma.appointment, 'update')
        .mockResolvedValue({ id: 'app-1' } as any);

      await service.checkPendingAppointments();

      expect(prisma.appointment.update).toHaveBeenCalledWith({
        where: { id: 'app-1' },
        data: {
          status: 'CANCELED',
          cancellationReason: 'payment not approved',
        },
      });
    });
  });

  describe('validateSubscriptionUsage', () => {
    const mockSubscription = {
      id: 'sub-1',
      status: 'ACTIVE',
      planId: 'plan-1',
      nextBilling: new Date(Date.now() + 86400000), // tomorrow
    };

    it('should allow appointment if within limit', async () => {
      jest.spyOn(prisma.plan, 'findUnique').mockResolvedValue({
        id: 'plan-1',
        maxAppointments: 10,
        interval: 'MONTHLY',
      } as any);
      jest.spyOn(prisma.appointment, 'count').mockResolvedValue(5);

      // We need to call a private method, so we cast to any
      await (service as any).validateSubscriptionUsage(mockSubscription);
      expect(prisma.appointment.count).toHaveBeenCalled();
    });

    it('should throw if limit exceeded', async () => {
      jest.spyOn(prisma.plan, 'findUnique').mockResolvedValue({
        id: 'plan-1',
        maxAppointments: 5,
        interval: 'MONTHLY',
      } as any);
      jest.spyOn(prisma.appointment, 'count').mockResolvedValue(5);

      await expect(
        (service as any).validateSubscriptionUsage(mockSubscription),
      ).rejects.toThrow(
        new BadRequestException(
          'You have reached the limit of 5 appointments for this cycle.',
        ),
      );
    });

    it('should allow if maxAppointments is -1 (unlimited)', async () => {
      jest.spyOn(prisma.plan, 'findUnique').mockResolvedValue({
        id: 'plan-1',
        maxAppointments: -1,
        interval: 'MONTHLY',
      } as any);

      await (service as any).validateSubscriptionUsage(mockSubscription);
      expect(prisma.appointment.count).not.toHaveBeenCalled();
    });
  });
});
