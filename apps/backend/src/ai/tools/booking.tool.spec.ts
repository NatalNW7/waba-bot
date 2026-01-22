import { Test, TestingModule } from '@nestjs/testing';
import { BookAppointmentTool } from './booking.tool';
import { PrismaService } from '../../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('BookAppointmentTool', () => {
  let tool: BookAppointmentTool;
  let prisma: DeepMockProxy<PrismaService>;

  const mockService = {
    id: 'svc-1',
    name: 'Corte',
    duration: 30,
    price: 50,
    tenantId: 'tenant-123',
  };

  const mockAppointment = {
    id: 'apt-1',
    date: new Date('2026-02-01T14:00:00'),
    price: 50,
    status: 'PENDING',
    tenantId: 'tenant-123',
    customerId: 'customer-123',
    serviceId: 'svc-1',
    service: mockService,
    customer: { id: 'customer-123', phone: '5511999999999' },
  };

  beforeEach(async () => {
    prisma = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookAppointmentTool,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    tool = module.get<BookAppointmentTool>(BookAppointmentTool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDefinition', () => {
    it('should return correct tool definition', () => {
      const definition = tool.getDefinition();

      expect(definition.name).toBe('book_appointment');
      expect(definition.description).toContain('Agenda um horário');
      expect(definition.parameters.required).toContain('serviceId');
      expect(definition.parameters.required).toContain('date');
      expect(definition.parameters.required).toContain('time');
    });
  });

  describe('execute', () => {
    // Get a future date for testing
    const getFutureDate = (): string => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date.toISOString().split('T')[0];
    };

    it('should create appointment successfully', async () => {
      const futureDate = getFutureDate();
      prisma.service.findUnique.mockResolvedValue(mockService as any);
      prisma.appointment.findFirst.mockResolvedValue(null);
      prisma.appointment.create.mockResolvedValue(mockAppointment as any);

      const result = await tool.execute(
        { serviceId: 'svc-1', date: futureDate, time: '14:00' },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(true);
      expect(result.data?.appointmentId).toBe('apt-1');
      expect(result.data?.service).toBe('Corte');
      expect(result.data?.price).toBe('R$ 50.00');
    });

    it('should reject missing required fields', async () => {
      const result = await tool.execute(
        { serviceId: 'svc-1', date: '2026-02-01' },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Dados incompletos');
    });

    it('should reject invalid date format', async () => {
      const result = await tool.execute(
        { serviceId: 'svc-1', date: 'invalid', time: '14:00' },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Formato de data inválido');
    });

    it('should reject invalid time format', async () => {
      const futureDate = getFutureDate();
      const result = await tool.execute(
        { serviceId: 'svc-1', date: futureDate, time: 'invalid' },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Formato de horário inválido');
    });

    it('should reject past appointments', async () => {
      prisma.service.findUnique.mockResolvedValue(mockService as any);

      const result = await tool.execute(
        { serviceId: 'svc-1', date: '2020-01-01', time: '14:00' },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('horários passados');
    });

    it('should reject non-existent service', async () => {
      const futureDate = getFutureDate();
      prisma.service.findUnique.mockResolvedValue(null);

      const result = await tool.execute(
        { serviceId: 'nonexistent', date: futureDate, time: '14:00' },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Serviço não encontrado');
    });

    it('should reject service from different tenant', async () => {
      const futureDate = getFutureDate();
      prisma.service.findUnique.mockResolvedValue({
        ...mockService,
        tenantId: 'different-tenant',
      } as any);

      const result = await tool.execute(
        { serviceId: 'svc-1', date: futureDate, time: '14:00' },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Serviço não encontrado');
    });

    it('should reject conflicting appointments', async () => {
      const futureDate = getFutureDate();
      prisma.service.findUnique.mockResolvedValue(mockService as any);
      prisma.appointment.findFirst.mockResolvedValue({
        id: 'existing-apt',
        date: new Date(`${futureDate}T14:00:00`),
        service: { duration: 60 },
      } as any);

      const result = await tool.execute(
        { serviceId: 'svc-1', date: futureDate, time: '14:00' },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('não está disponível');
    });

    it('should create appointment with correct data', async () => {
      const futureDate = getFutureDate();
      prisma.service.findUnique.mockResolvedValue(mockService as any);
      prisma.appointment.findFirst.mockResolvedValue(null);
      prisma.appointment.create.mockResolvedValue(mockAppointment as any);

      await tool.execute(
        { serviceId: 'svc-1', date: futureDate, time: '14:30' },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(prisma.appointment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'PENDING',
          tenantId: 'tenant-123',
          customerId: 'customer-123',
          serviceId: 'svc-1',
          price: 50,
        }),
        include: expect.any(Object),
      });
    });

    it('should include confirmation message in response', async () => {
      const futureDate = getFutureDate();
      prisma.service.findUnique.mockResolvedValue(mockService as any);
      prisma.appointment.findFirst.mockResolvedValue(null);
      prisma.appointment.create.mockResolvedValue(mockAppointment as any);

      const result = await tool.execute(
        { serviceId: 'svc-1', date: futureDate, time: '14:00' },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.data?.message).toContain('✅');
      expect(result.data?.message).toContain(
        'Agendamento realizado com sucesso',
      );
    });

    it('should handle database errors', async () => {
      const futureDate = getFutureDate();
      prisma.service.findUnique.mockResolvedValue(mockService as any);
      prisma.appointment.findFirst.mockResolvedValue(null);
      prisma.appointment.create.mockRejectedValue(new Error('Database error'));

      const result = await tool.execute(
        { serviceId: 'svc-1', date: futureDate, time: '14:00' },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });
});
