import { Test, TestingModule } from '@nestjs/testing';
import { GeneratePaymentLinkTool } from './generate-payment-link.tool';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentPreferenceService } from '../../payments/payment-preference.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('GeneratePaymentLinkTool', () => {
  let tool: GeneratePaymentLinkTool;
  let prisma: DeepMockProxy<PrismaService>;
  let paymentPreferenceService: DeepMockProxy<PaymentPreferenceService>;

  const mockContext = {
    tenantId: 'tenant-123',
    customerId: 'customer-123',
  };

  const mockAppointment = {
    id: 'apt-1',
    date: new Date('2026-02-15T14:00:00'),
    price: 50,
    status: 'PENDING',
    tenantId: 'tenant-123',
    customerId: 'customer-123',
    serviceId: 'svc-1',
    paymentId: null,
    service: { id: 'svc-1', name: 'Corte', duration: 30, price: 50 },
    customer: {
      id: 'customer-123',
      phone: '5511999999999',
      name: 'João',
      email: 'joao@email.com',
    },
    tenant: {
      id: 'tenant-123',
      preferredPaymentProvider: 'MERCADO_PAGO',
      infinitePayTag: null,
    },
  };

  beforeEach(async () => {
    prisma = mockDeep<PrismaService>();
    paymentPreferenceService = mockDeep<PaymentPreferenceService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeneratePaymentLinkTool,
        { provide: PrismaService, useValue: prisma },
        {
          provide: PaymentPreferenceService,
          useValue: paymentPreferenceService,
        },
      ],
    }).compile();

    tool = module.get<GeneratePaymentLinkTool>(GeneratePaymentLinkTool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDefinition', () => {
    it('should return correct tool definition', () => {
      const definition = tool.getDefinition();

      expect(definition.name).toBe('generate_payment_link');
      expect(definition.description).toContain('pagamento');
      expect(definition.parameters.required).toContain('appointmentId');
    });
  });

  describe('execute', () => {
    it('should generate payment link successfully', async () => {
      prisma.appointment.findUnique.mockResolvedValue(mockAppointment as any);
      paymentPreferenceService.createAppointmentPreference.mockResolvedValue({
        initPoint: 'https://pay.mercadopago.com/abc123',
        provider: 'MERCADO_PAGO',
        preferenceId: 'pref-123',
      } as any);

      const result = await tool.execute(
        { appointmentId: 'apt-1' },
        mockContext,
      );

      expect(result.success).toBe(true);
      expect(result.data?.paymentUrl).toBe(
        'https://pay.mercadopago.com/abc123',
      );
      expect(result.data?.provider).toBe('MERCADO_PAGO');
      expect(result.data?.message).toContain('💳');
    });

    it('should reject empty appointmentId', async () => {
      const result = await tool.execute({ appointmentId: '' }, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('obrigatório');
    });

    it('should reject non-existent appointment', async () => {
      prisma.appointment.findUnique.mockResolvedValue(null);

      const result = await tool.execute(
        { appointmentId: 'nonexistent' },
        mockContext,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('não encontrado');
    });

    it('should reject appointment from different tenant', async () => {
      prisma.appointment.findUnique.mockResolvedValue({
        ...mockAppointment,
        tenantId: 'different-tenant',
      } as any);

      const result = await tool.execute(
        { appointmentId: 'apt-1' },
        mockContext,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('estabelecimento');
    });

    it('should reject appointment from different customer', async () => {
      prisma.appointment.findUnique.mockResolvedValue({
        ...mockAppointment,
        customerId: 'different-customer',
      } as any);

      const result = await tool.execute(
        { appointmentId: 'apt-1' },
        mockContext,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('cliente');
    });

    it('should reject appointment with existing payment', async () => {
      prisma.appointment.findUnique.mockResolvedValue({
        ...mockAppointment,
        paymentId: 'existing-payment',
      } as any);

      const result = await tool.execute(
        { appointmentId: 'apt-1' },
        mockContext,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('já possui um pagamento');
    });

    it('should reject appointment without service', async () => {
      prisma.appointment.findUnique.mockResolvedValue({
        ...mockAppointment,
        service: null,
      } as any);

      const result = await tool.execute(
        { appointmentId: 'apt-1' },
        mockContext,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('serviço');
    });

    it('should handle payment service errors', async () => {
      prisma.appointment.findUnique.mockResolvedValue(mockAppointment as any);
      paymentPreferenceService.createAppointmentPreference.mockRejectedValue(
        new Error('Payment provider error'),
      );

      const result = await tool.execute(
        { appointmentId: 'apt-1' },
        mockContext,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Payment provider error');
    });
  });
});
