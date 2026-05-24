import { Test, TestingModule } from '@nestjs/testing';
import { PaymentQueueProcessor } from './payment-webhook.processor';
import { PrismaService } from '../../prisma/prisma.service';
import { MercadoPagoService } from '../mercadopago.service';
import { Payment, PreApproval } from 'mercadopago';
import { PaymentRepository } from '../payment-repository.service';
import { InfinitePayService } from '../infinite-pay.service';
import { AppointmentPaymentHandlerService } from '../../notifications/appointment-payment-handler.service';

jest.mock('mercadopago');

describe('PaymentQueueProcessor', () => {
  let processor: PaymentQueueProcessor;
  let prisma: PrismaService;
  let mpService: MercadoPagoService;
  let paymentRepo: PaymentRepository;
  let appointmentPaymentHandler: AppointmentPaymentHandlerService;

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
            tenant: {
              findUnique: jest.fn(),
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
        {
          provide: InfinitePayService,
          useValue: {
            processWebhookNotification: jest.fn(),
          },
        },
        {
          provide: AppointmentPaymentHandlerService,
          useValue: {
            handlePaymentResult: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    processor = module.get<PaymentQueueProcessor>(PaymentQueueProcessor);
    prisma = module.get<PrismaService>(PrismaService);
    mpService = module.get<MercadoPagoService>(MercadoPagoService);
    paymentRepo = module.get<PaymentRepository>(PaymentRepository);
    appointmentPaymentHandler = module.get<AppointmentPaymentHandlerService>(
      AppointmentPaymentHandlerService,
    );
  });

  describe('handleNotification', () => {
    // ─── Existing payment update (Fix #5: stronger assertions) ───

    it('should update existing payment with all fields and NOT change tenant status when approved', async () => {
      const job = {
        data: { topic: 'payment', resourceId: 'pay-1', targetId: 'platform' },
      } as any;

      const mockGet = jest.fn().mockResolvedValue({
        id: 'pay-1',
        status: 'approved',
        transaction_amount: 100,
        external_reference: 'tenant-123',
        net_received_amount: 95.5,
        fee_details: [{ amount: 4.5 }],
        operation_type: 'recurring_payment',
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
        netAmount: 95.5,
        fee: 4.5,
      });
      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-123' },
        data: { saasStatus: 'ACTIVE' },
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

    // ─── SaaS payment → PAST_DUE scenarios ───

    it('should set tenant saasStatus to PAST_DUE when SaaS payment is rejected', async () => {
      const job = {
        data: { topic: 'payment', resourceId: 'pay-2', targetId: 'platform' },
      } as any;

      const mockGet = jest.fn().mockResolvedValue({
        id: 'pay-2',
        status: 'rejected',
        external_reference: 'tenant-123',
        transaction_amount: 5,
        operation_type: 'recurring_payment',
      });
      (Payment as jest.Mock).mockImplementation(() => ({ get: mockGet }));

      jest.spyOn(paymentRepo, 'findAll').mockResolvedValue([]);
      jest
        .spyOn(paymentRepo, 'create')
        .mockResolvedValue({ id: 'new-pay' } as any);
      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-123' } as any);

      await processor.handleNotification(job);

      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'FAILED', type: 'SAAS_FEE' }),
      );
      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-123' },
        data: { saasStatus: 'PAST_DUE' },
      });
    });

    it('should set tenant saasStatus to PAST_DUE when existing SaaS payment updates to rejected', async () => {
      const job = {
        data: { topic: 'payment', resourceId: 'pay-5', targetId: 'platform' },
      } as any;

      const mockGet = jest.fn().mockResolvedValue({
        id: 'pay-5',
        status: 'rejected',
        external_reference: 'tenant-123',
        net_received_amount: 0,
        fee_details: [{ amount: 0 }],
        operation_type: 'recurring_payment',
      });
      (Payment as jest.Mock).mockImplementation(() => ({ get: mockGet }));

      jest
        .spyOn(paymentRepo, 'findAll')
        .mockResolvedValue([{ id: 'existing-pay' }] as any);

      await processor.handleNotification(job);

      expect(paymentRepo.update).toHaveBeenCalledWith('existing-pay', {
        status: 'FAILED',
        netAmount: 0,
        fee: 0,
      });
      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-123' },
        data: { saasStatus: 'PAST_DUE' },
      });
    });

    // ─── SaaS payment → ACTIVE restoration (Fix #4) ───

    it('should set tenant saasStatus to ACTIVE when new SaaS payment is approved', async () => {
      const job = {
        data: { topic: 'payment', resourceId: 'pay-6', targetId: 'platform' },
      } as any;

      const mockGet = jest.fn().mockResolvedValue({
        id: 'pay-6',
        status: 'approved',
        external_reference: 'tenant-123',
        transaction_amount: 5,
        net_received_amount: 4.5,
        fee_details: [{ amount: 0.5 }],
        operation_type: 'recurring_payment',
      });
      (Payment as jest.Mock).mockImplementation(() => ({ get: mockGet }));

      jest.spyOn(paymentRepo, 'findAll').mockResolvedValue([]);
      jest
        .spyOn(paymentRepo, 'create')
        .mockResolvedValue({ id: 'new-pay' } as any);
      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-123' } as any);

      await processor.handleNotification(job);

      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'APPROVED', type: 'SAAS_FEE' }),
      );
      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-123' },
        data: { saasStatus: 'ACTIVE' },
      });
    });

    it('should set tenant saasStatus to ACTIVE when existing SaaS payment updates to approved', async () => {
      const job = {
        data: { topic: 'payment', resourceId: 'pay-7', targetId: 'platform' },
      } as any;

      const mockGet = jest.fn().mockResolvedValue({
        id: 'pay-7',
        status: 'approved',
        external_reference: 'tenant-123',
        net_received_amount: 4.5,
        fee_details: [{ amount: 0.5 }],
        operation_type: 'recurring_payment',
      });
      (Payment as jest.Mock).mockImplementation(() => ({ get: mockGet }));

      jest
        .spyOn(paymentRepo, 'findAll')
        .mockResolvedValue([{ id: 'existing-pay' }] as any);

      await processor.handleNotification(job);

      expect(paymentRepo.update).toHaveBeenCalledWith(
        'existing-pay',
        expect.objectContaining({ status: 'APPROVED' }),
      );
      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-123' },
        data: { saasStatus: 'ACTIVE' },
      });
    });

    // ─── SaaS payment — no status change for PENDING ───

    it('should NOT change tenant saasStatus when SaaS payment is pending', async () => {
      const job = {
        data: { topic: 'payment', resourceId: 'pay-4', targetId: 'platform' },
      } as any;

      const mockGet = jest.fn().mockResolvedValue({
        id: 'pay-4',
        status: 'pending',
        external_reference: 'tenant-123',
        transaction_amount: 5,
        operation_type: 'recurring_payment',
      });
      (Payment as jest.Mock).mockImplementation(() => ({ get: mockGet }));

      jest.spyOn(paymentRepo, 'findAll').mockResolvedValue([]);
      jest
        .spyOn(paymentRepo, 'create')
        .mockResolvedValue({ id: 'new-pay' } as any);
      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-123' } as any);

      await processor.handleNotification(job);

      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'PENDING', type: 'SAAS_FEE' }),
      );
      expect(prisma.tenant.update).not.toHaveBeenCalled();
    });

    // ─── Architectural: card_validation filtering (#1) ───

    it('should ignore card_validation payments', async () => {
      const job = {
        data: { topic: 'payment', resourceId: 'pay-cv', targetId: 'platform' },
      } as any;

      const mockGet = jest.fn().mockResolvedValue({
        id: 'pay-cv',
        status: 'approved',
        external_reference: null,
        transaction_amount: 0,
        operation_type: 'card_validation',
        description: 'Recurring payment validation',
      });
      (Payment as jest.Mock).mockImplementation(() => ({ get: mockGet }));

      jest.spyOn(paymentRepo, 'findAll').mockResolvedValue([]);

      await processor.handleNotification(job);

      expect(paymentRepo.create).not.toHaveBeenCalled();
      expect(prisma.tenant.update).not.toHaveBeenCalled();
    });

    // ─── Architectural: subscription_authorized_payment topic (#2) ───

    it('should handle subscription_authorized_payment topic as a payment', async () => {
      const job = {
        data: {
          topic: 'subscription_authorized_payment',
          resourceId: 'pay-sap',
          targetId: 'platform',
        },
      } as any;

      const mockGet = jest.fn().mockResolvedValue({
        id: 'pay-sap',
        status: 'approved',
        external_reference: 'tenant-456',
        transaction_amount: 5,
        net_received_amount: 4.5,
        fee_details: [{ amount: 0.5 }],
        operation_type: 'recurring_payment',
      });
      (Payment as jest.Mock).mockImplementation(() => ({ get: mockGet }));

      jest.spyOn(paymentRepo, 'findAll').mockResolvedValue([]);
      jest
        .spyOn(paymentRepo, 'create')
        .mockResolvedValue({ id: 'new-pay' } as any);
      jest
        .spyOn(prisma.tenant, 'findUnique')
        .mockResolvedValue({ id: 'tenant-456' } as any);

      await processor.handleNotification(job);

      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'APPROVED', type: 'SAAS_FEE' }),
      );
      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 'tenant-456' },
        data: { saasStatus: 'ACTIVE' },
      });
    });

    // ─── Architectural: non-classifiable payment ───

    it('should ignore payment with no external_reference and non-recurring type', async () => {
      const job = {
        data: {
          topic: 'payment',
          resourceId: 'pay-unk',
          targetId: 'platform',
        },
      } as any;

      const mockGet = jest.fn().mockResolvedValue({
        id: 'pay-unk',
        status: 'approved',
        external_reference: null,
        transaction_amount: 50,
        operation_type: 'regular_payment',
      });
      (Payment as jest.Mock).mockImplementation(() => ({ get: mockGet }));

      jest.spyOn(paymentRepo, 'findAll').mockResolvedValue([]);

      await processor.handleNotification(job);

      expect(paymentRepo.create).not.toHaveBeenCalled();
      expect(prisma.tenant.update).not.toHaveBeenCalled();
    });

    it('should log warning when subscription semaphore is yellow', async () => {
      const job = {
        data: {
          topic: 'subscription_preapproval',
          resourceId: 'sub-semaphore',
          targetId: 'platform',
        },
      } as any;

      const mockGet = jest.fn().mockResolvedValue({
        id: 'sub-semaphore',
        status: 'authorized',
        external_reference: 'tenant-123',
        semaphore: 'yellow',
      });
      (PreApproval as jest.Mock).mockImplementation(() => ({
        get: mockGet,
      }));

      jest.spyOn(prisma.tenant, 'findUnique').mockResolvedValue({
        id: 'tenant-123',
        saasPlan: { interval: 'MONTHLY' },
        saasNextBilling: new Date(),
      } as any);

      const loggerSpy = jest.spyOn(processor['logger'], 'warn');

      await processor.handleNotification(job);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('semaphore'),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('yellow'),
      );
    });

    it('should log warning when subscription semaphore is red', async () => {
      const job = {
        data: {
          topic: 'subscription_preapproval',
          resourceId: 'sub-red',
          targetId: 'platform',
        },
      } as any;

      const mockGet = jest.fn().mockResolvedValue({
        id: 'sub-red',
        status: 'paused',
        external_reference: 'tenant-123',
        semaphore: 'red',
      });
      (PreApproval as jest.Mock).mockImplementation(() => ({
        get: mockGet,
      }));

      jest.spyOn(prisma.tenant, 'findUnique').mockResolvedValue({
        id: 'tenant-123',
        saasPlan: { interval: 'MONTHLY' },
        saasNextBilling: new Date(),
      } as any);

      const loggerSpy = jest.spyOn(processor['logger'], 'warn');

      await processor.handleNotification(job);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('red'),
      );
    });

    it('should NOT log semaphore warning when semaphore is green', async () => {
      const job = {
        data: {
          topic: 'subscription_preapproval',
          resourceId: 'sub-green',
          targetId: 'platform',
        },
      } as any;

      const mockGet = jest.fn().mockResolvedValue({
        id: 'sub-green',
        status: 'authorized',
        external_reference: 'tenant-123',
        semaphore: 'green',
      });
      (PreApproval as jest.Mock).mockImplementation(() => ({
        get: mockGet,
      }));

      jest.spyOn(prisma.tenant, 'findUnique').mockResolvedValue({
        id: 'tenant-123',
        saasPlan: { interval: 'MONTHLY' },
        saasNextBilling: new Date(),
      } as any);

      const loggerSpy = jest.spyOn(processor['logger'], 'warn');

      await processor.handleNotification(job);

      // Should NOT have warned about semaphore when it's green
      const semaphoreCalls = loggerSpy.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('semaphore'),
      );
      expect(semaphoreCalls).toHaveLength(0);
    });
  });
});
