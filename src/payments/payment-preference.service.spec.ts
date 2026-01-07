import { Test, TestingModule } from '@nestjs/testing';
import { PaymentPreferenceService } from './payment-preference.service';
import { MercadoPagoService } from './mercadopago.service';
import { Preference } from 'mercadopago';
import { BadRequestException } from '@nestjs/common';

jest.mock('mercadopago');

describe('PaymentPreferenceService', () => {
  let service: PaymentPreferenceService;
  let mpService: MercadoPagoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentPreferenceService,
        {
          provide: MercadoPagoService,
          useValue: {
            getTenantClient: jest.fn().mockReturnValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentPreferenceService>(PaymentPreferenceService);
    mpService = module.get<MercadoPagoService>(MercadoPagoService);
  });

  describe('createAppointmentPreference', () => {
    it('should throw BadRequestException if service is missing', async () => {
      await expect(
        service.createAppointmentPreference({ id: '1' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a preference and return init points', async () => {
      const mockPreferenceCreate = jest.fn().mockResolvedValue({
        id: 'pref-123',
        init_point: 'url',
        sandbox_init_point: 's-url',
      });
      (Preference as jest.Mock).mockImplementation(() => ({
        create: mockPreferenceCreate,
      }));

      const appointment = {
        id: 'app-1',
        tenantId: 't-1',
        price: 50,
        service: { name: 'Svc' },
        customer: { email: 'c@c.com', name: 'Cust' },
      };

      const result = await service.createAppointmentPreference(appointment);

      expect(result.preferenceId).toBe('pref-123');
      expect(result.initPoint).toBe('url');
      expect(mockPreferenceCreate).toHaveBeenCalled();
    });
  });
});
