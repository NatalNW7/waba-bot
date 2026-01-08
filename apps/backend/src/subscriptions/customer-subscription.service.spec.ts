import { Test, TestingModule } from '@nestjs/testing';
import { CustomerSubscriptionService } from './customer-subscription.service';
import { MercadoPagoService } from '../payments/mercadopago.service';
import { PreApproval } from 'mercadopago';

jest.mock('mercadopago');

describe('CustomerSubscriptionService', () => {
  let service: CustomerSubscriptionService;
  let mpService: MercadoPagoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerSubscriptionService,
        {
          provide: MercadoPagoService,
          useValue: {
            getTenantClient: jest.fn().mockReturnValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<CustomerSubscriptionService>(
      CustomerSubscriptionService,
    );
    mpService = module.get<MercadoPagoService>(MercadoPagoService);
  });

  it('should call PreApproval.create with correct data', async () => {
    const mockPreApprovalCreate = jest.fn().mockResolvedValue({ id: 'mp-123' });
    (PreApproval as jest.Mock).mockImplementation(() => ({
      create: mockPreApprovalCreate,
    }));

    const options = {
      tenantId: 't1',
      plan: { name: 'Plan 1', price: 100, interval: 'MONTHLY' },
      customer: { id: 'c1', email: 'c@c.com' },
      cardTokenId: 'card-1',
    };

    await service.createMpSubscription(options);

    expect(mpService.getTenantClient).toHaveBeenCalledWith('t1');
    expect(mockPreApprovalCreate).toHaveBeenCalledWith({
      body: expect.objectContaining({
        reason: 'Assinatura - Plan 1',
        payer_email: 'c@c.com',
        card_token_id: 'card-1',
      }),
    });
  });
});
