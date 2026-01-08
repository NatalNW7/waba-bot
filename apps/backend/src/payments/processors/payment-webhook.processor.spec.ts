import { Test, TestingModule } from '@nestjs/testing';
import { PaymentQueueProcessor } from './payment-webhook.processor';
import { PrismaService } from '../../prisma/prisma.service';
import { MercadoPagoService } from '../mercadopago.service';
import { Payment, PreApproval } from 'mercadopago';
import { PaymentRepository } from '../payment-repository.service';

jest.mock('mercadopago');

describe('PaymentQueueProcessor', () => {
  let processor: PaymentQueueProcessor;
  let prisma: PrismaService;
  let mpService: MercadoPagoService;
  let paymentRepo: PaymentRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentQueueProcessor,
        {
          provide: PrismaService,
          useValue: {
            appointment: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            subscription: {
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: PaymentRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: MercadoPagoService,
          useValue: {
            getPlatformClient: jest.fn().mockReturnValue({}),
            getTenantClient: jest.fn().mockReturnValue({}),
          },
        },
      ],
    }).compile();

    processor = module.get<PaymentQueueProcessor>(PaymentQueueProcessor);
    prisma = module.get<PrismaService>(PrismaService);
    mpService = module.get<MercadoPagoService>(MercadoPagoService);
    paymentRepo = module.get<PaymentRepository>(PaymentRepository);
  });

  describe('handleNotification', () => {
    it('should process payment notification', async () => {
      const job = {
        data: { topic: 'payment', resourceId: 'pay-1', targetId: 'platform' },
      } as any;

      const mockGet = jest.fn().mockResolvedValue({
        id: 'pay-1',
        status: 'approved',
        transaction_amount: 100,
      });
      (Payment as jest.Mock).mockImplementation(() => ({
        get: mockGet,
      }));

      jest
        .spyOn(paymentRepo, 'findAll')
        .mockResolvedValue([{ id: 'internal-1' }] as any);

      await processor.handleNotification(job);

      expect(paymentRepo.update).toHaveBeenCalledWith('internal-1', {
        status: 'APPROVED',
      });
    });

    it('should process subscription notification', async () => {
      const job = {
        data: {
          topic: 'subscription_preapproval',
          resourceId: 'sub-1',
          targetId: 'tenant-1',
        },
      } as any;

      const mockGet = jest.fn().mockResolvedValue({
        id: 'sub-1',
        status: 'authorized',
      });
      (PreApproval as jest.Mock).mockImplementation(() => ({
        get: mockGet,
      }));

      jest
        .spyOn(prisma.subscription, 'findFirst')
        .mockResolvedValue({ id: 's-1' } as any);

      await processor.handleNotification(job);

      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { id: 's-1' },
        data: { status: 'ACTIVE' },
      });
    });
  });
});
