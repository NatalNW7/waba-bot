import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentPaymentHandlerService } from './appointment-payment-handler.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PaymentStatus } from '@prisma/client';

describe('AppointmentPaymentHandlerService', () => {
  let service: AppointmentPaymentHandlerService;
  let prisma: DeepMockProxy<PrismaService>;
  let notificationService: DeepMockProxy<NotificationService>;

  const mockAppointment = {
    id: 'apt-1',
    date: new Date('2026-02-15T14:00:00'),
    price: 50,
    status: 'PENDING',
    tenantId: 'tenant-123',
    customerId: 'customer-123',
    serviceId: 'svc-1',
    paymentId: null,
    service: { id: 'svc-1', name: 'Corte de Cabelo', duration: 30, price: 50 },
    customer: {
      id: 'customer-123',
      name: 'João',
      email: 'joao@email.com',
      phone: '5511999999999',
    },
    tenant: {
      id: 'tenant-123',
      name: 'Barbearia Premium',
      phoneId: 'phone-123',
    },
  };

  beforeEach(async () => {
    prisma = mockDeep<PrismaService>();
    notificationService = mockDeep<NotificationService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentPaymentHandlerService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    service = module.get<AppointmentPaymentHandlerService>(
      AppointmentPaymentHandlerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handlePaymentResult', () => {
    it('should confirm appointment and send success notification on APPROVED', async () => {
      prisma.appointment.findUnique.mockResolvedValue(mockAppointment as any);
      notificationService.sendPaymentSuccessNotification.mockResolvedValue(
        undefined,
      );

      await service.handlePaymentResult('apt-1', PaymentStatus.APPROVED);

      expect(prisma.appointment.update).toHaveBeenCalledWith({
        where: { id: 'apt-1' },
        data: { status: 'CONFIRMED' },
      });
      expect(
        notificationService.sendPaymentSuccessNotification,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ appointmentId: 'apt-1' }),
        expect.objectContaining({ name: 'João' }),
        expect.objectContaining({ name: 'Barbearia Premium' }),
      );
    });

    it('should send failure notification and keep PENDING on FAILED', async () => {
      prisma.appointment.findUnique.mockResolvedValue(mockAppointment as any);
      notificationService.sendPaymentFailureNotification.mockResolvedValue(
        undefined,
      );

      await service.handlePaymentResult('apt-1', PaymentStatus.FAILED);

      expect(prisma.appointment.update).not.toHaveBeenCalled();
      expect(
        notificationService.sendPaymentFailureNotification,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ appointmentId: 'apt-1' }),
        expect.objectContaining({ name: 'João' }),
        expect.objectContaining({ name: 'Barbearia Premium' }),
      );
    });

    it('should handle appointment not found gracefully', async () => {
      prisma.appointment.findUnique.mockResolvedValue(null);

      await expect(
        service.handlePaymentResult('nonexistent', PaymentStatus.APPROVED),
      ).resolves.not.toThrow();

      expect(prisma.appointment.update).not.toHaveBeenCalled();
      expect(
        notificationService.sendPaymentSuccessNotification,
      ).not.toHaveBeenCalled();
    });

    it('should handle missing customer data gracefully', async () => {
      prisma.appointment.findUnique.mockResolvedValue({
        ...mockAppointment,
        customer: null,
      } as any);

      await expect(
        service.handlePaymentResult('apt-1', PaymentStatus.APPROVED),
      ).resolves.not.toThrow();

      expect(prisma.appointment.update).not.toHaveBeenCalled();
    });

    it('should not throw when notification fails', async () => {
      prisma.appointment.findUnique.mockResolvedValue(mockAppointment as any);
      notificationService.sendPaymentSuccessNotification.mockRejectedValue(
        new Error('Notification error'),
      );

      await expect(
        service.handlePaymentResult('apt-1', PaymentStatus.APPROVED),
      ).resolves.not.toThrow();
    });

    it('should do nothing for PENDING status', async () => {
      prisma.appointment.findUnique.mockResolvedValue(mockAppointment as any);

      await service.handlePaymentResult('apt-1', PaymentStatus.PENDING);

      expect(prisma.appointment.update).not.toHaveBeenCalled();
      expect(
        notificationService.sendPaymentSuccessNotification,
      ).not.toHaveBeenCalled();
      expect(
        notificationService.sendPaymentFailureNotification,
      ).not.toHaveBeenCalled();
    });
  });
});
