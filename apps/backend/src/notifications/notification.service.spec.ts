import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from './notification.service';

// Mock WabaAPI
jest.mock('../waba/waba.api', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    sendMessage: jest.fn().mockResolvedValue({ success: true }),
  })),
}));

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ accepted: ['test@email.com'] }),
  })),
}));

describe('NotificationService', () => {
  let service: NotificationService;

  const mockAppointment = {
    appointmentId: 'apt-1',
    serviceName: 'Corte de Cabelo',
    date: new Date('2026-02-15T14:00:00'),
    price: 50,
  };

  const mockCustomer = {
    name: 'João',
    email: 'joao@email.com',
    phone: '5511999999999',
  };

  const mockTenant = {
    name: 'Barbearia Premium',
    phoneId: 'phone-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                EMAIL_USER: 'test@gmail.com',
                EMAIL_PASSWORD: 'test-password',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendPaymentSuccessNotification', () => {
    it('should send success notification without throwing', async () => {
      await expect(
        service.sendPaymentSuccessNotification(
          mockAppointment,
          mockCustomer,
          mockTenant,
        ),
      ).resolves.not.toThrow();
    });

    it('should handle missing customer email gracefully', async () => {
      const customerNoEmail = { ...mockCustomer, email: null };

      await expect(
        service.sendPaymentSuccessNotification(
          mockAppointment,
          customerNoEmail,
          mockTenant,
        ),
      ).resolves.not.toThrow();
    });

    it('should handle missing tenant phoneId gracefully', async () => {
      const tenantNoPhone = { ...mockTenant, phoneId: null };

      await expect(
        service.sendPaymentSuccessNotification(
          mockAppointment,
          mockCustomer,
          tenantNoPhone,
        ),
      ).resolves.not.toThrow();
    });
  });

  describe('sendPaymentFailureNotification', () => {
    it('should send failure notification without throwing', async () => {
      await expect(
        service.sendPaymentFailureNotification(
          mockAppointment,
          mockCustomer,
          mockTenant,
        ),
      ).resolves.not.toThrow();
    });

    it('should handle customer with name gracefully', async () => {
      await expect(
        service.sendPaymentFailureNotification(
          mockAppointment,
          mockCustomer,
          mockTenant,
        ),
      ).resolves.not.toThrow();
    });
  });
});
