import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { PaymentType, PaymentMethod, PaymentStatus } from '@prisma/client';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;

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
            payment: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
      jest.spyOn(prisma.tenant, 'findUnique').mockResolvedValue({ id: 'tenant-1' } as any);
      jest.spyOn(prisma.customer, 'findUnique').mockResolvedValue({ id: 'customer-1' } as any);
      jest.spyOn(prisma.subscription, 'findUnique').mockResolvedValue({ id: 'sub-1' } as any);
      jest.spyOn(prisma.payment, 'create').mockResolvedValue({ id: 'payment-1', ...createPaymentDto } as any);

      const result = await service.create(createPaymentDto);

      expect(result).toBeDefined();
      expect(prisma.payment.create).toHaveBeenCalledWith({ data: createPaymentDto });
    });

    it('should throw NotFoundException if tenant does not exist', async () => {
      jest.spyOn(prisma.tenant, 'findUnique').mockResolvedValue(null);

      await expect(service.create(createPaymentDto)).rejects.toThrow(
        new NotFoundException(`Tenant with ID tenant-1 not found`),
      );
    });

    it('should throw NotFoundException if customer does not exist', async () => {
      jest.spyOn(prisma.tenant, 'findUnique').mockResolvedValue({ id: 'tenant-1' } as any);
      jest.spyOn(prisma.customer, 'findUnique').mockResolvedValue(null);

      await expect(service.create(createPaymentDto)).rejects.toThrow(
        new NotFoundException(`Customer with ID customer-1 not found`),
      );
    });

    it('should throw NotFoundException if subscription does not exist', async () => {
      jest.spyOn(prisma.tenant, 'findUnique').mockResolvedValue({ id: 'tenant-1' } as any);
      jest.spyOn(prisma.customer, 'findUnique').mockResolvedValue({ id: 'customer-1' } as any);
      jest.spyOn(prisma.subscription, 'findUnique').mockResolvedValue(null);

      await expect(service.create(createPaymentDto)).rejects.toThrow(
        new NotFoundException(`Subscription with ID sub-1 not found`),
      );
    });

    it('should create payment if optional IDs are not provided', async () => {
      const dtoNoOptional = {
        amount: 50,
        type: PaymentType.APPOINTMENT,
        method: PaymentMethod.CREDIT_CARD,
        tenantId: 'tenant-1',
      };

      jest.spyOn(prisma.tenant, 'findUnique').mockResolvedValue({ id: 'tenant-1' } as any);
      jest.spyOn(prisma.payment, 'create').mockResolvedValue({ id: 'payment-2', ...dtoNoOptional } as any);

      const result = await service.create(dtoNoOptional as any);

      expect(result).toBeDefined();
      expect(prisma.customer.findUnique).not.toHaveBeenCalled();
      expect(prisma.subscription.findUnique).not.toHaveBeenCalled();
      expect(prisma.payment.create).toHaveBeenCalledWith({ data: dtoNoOptional });
    });
  });
});
