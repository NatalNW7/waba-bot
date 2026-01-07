import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { PaymentType, PaymentMethod, PaymentStatus } from '@prisma/client';
import { MercadoPagoService } from './mercadopago.service';
import { PaymentRepository } from './payment-repository.service';
import { PaymentPreferenceService } from './payment-preference.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;
  let repo: PaymentRepository;
  let preferenceService: PaymentPreferenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: {
            tenant: {
              findUnique: jest.fn(),
            },
            customer: {
              findUnique: jest.fn(),
            },
            subscription: {
              findUnique: jest.fn(),
            },
            appointment: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: PaymentRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: MercadoPagoService,
          useValue: {},
        },
        {
          provide: PaymentPreferenceService,
          useValue: {
            createAppointmentPreference: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
    repo = module.get<PaymentRepository>(PaymentRepository);
    preferenceService = module.get<PaymentPreferenceService>(
      PaymentPreferenceService,
    );
  });

  describe('create', () => {
    const createPaymentDto = {
      amount: 100,
      type: PaymentType.SUBSCRIPTION,
      method: PaymentMethod.PIX,
      tenantId: 'tenant-1',
      customerId: 'customer-1',
      subscriptionId: 'sub-1',
      status: PaymentStatus.PENDING,
    };

    it('should create payment if all IDs are valid', async () => {
      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-1' } as any);
      jest
        .spyOn(prisma.customer, 'findUnique')
        .mockResolvedValue({ id: 'customer-1' } as any);
      jest
        .spyOn(prisma.subscription, 'findUnique')
        .mockResolvedValue({ id: 'sub-1' } as any);
      jest
        .spyOn(repo, 'create')
        .mockResolvedValue({ id: 'payment-1', ...createPaymentDto } as any);

      const result = await service.create(createPaymentDto);

      expect(result).toBeDefined();
      expect(repo.create).toHaveBeenCalledWith(createPaymentDto);
    });

    it('should throw NotFoundException if tenant does not exist', async () => {
      jest.spyOn(prisma.tenant, 'findUnique').mockResolvedValue(null);
      await expect(service.create(createPaymentDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createAppointmentPayment', () => {
    it('should throw NotFoundException if appointment not found', async () => {
      jest.spyOn(prisma.appointment, 'findUnique').mockResolvedValue(null);
      await expect(service.createAppointmentPayment('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delegate to preferenceService', async () => {
      const mockApp = { id: 'app123' };
      jest
        .spyOn(prisma.appointment, 'findUnique')
        .mockResolvedValue(mockApp as any);
      jest
        .spyOn(preferenceService, 'createAppointmentPreference')
        .mockResolvedValue({ preferenceId: 'pref-1' } as any);

      const result = await service.createAppointmentPayment('app123');
      expect(result.preferenceId).toBe('pref-1');
      expect(
        preferenceService.createAppointmentPreference,
      ).toHaveBeenCalledWith(mockApp);
    });
  });

  describe('findAll', () => {
    it('should call repo.findAll', async () => {
      jest.spyOn(repo, 'findAll').mockResolvedValue([]);
      await service.findAll();
      expect(repo.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call repo.findUnique', async () => {
      jest.spyOn(repo, 'findUnique').mockResolvedValue({ id: '1' } as any);
      await service.findOne('1');
      expect(repo.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });

  describe('update', () => {
    it('should call repo.update', async () => {
      jest.spyOn(repo, 'update').mockResolvedValue({ id: '1' } as any);
      await service.update('1', { status: 'APPROVED' } as any);
      expect(repo.update).toHaveBeenCalledWith('1', { status: 'APPROVED' });
    });
  });

  describe('remove', () => {
    it('should call repo.delete', async () => {
      jest.spyOn(repo, 'delete').mockResolvedValue({ id: '1' } as any);
      await service.remove('1');
      expect(repo.delete).toHaveBeenCalledWith('1');
    });
  });
});
