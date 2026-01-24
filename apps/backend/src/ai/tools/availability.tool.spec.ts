import { Test, TestingModule } from '@nestjs/testing';
import { CheckAvailabilityTool } from './availability.tool';
import { PrismaService } from '../../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { DayOfWeek } from '@prisma/client';

describe('CheckAvailabilityTool', () => {
  let tool: CheckAvailabilityTool;
  let prisma: DeepMockProxy<PrismaService>;

  const mockOperatingHours = {
    id: 'oh-1',
    tenantId: 'tenant-123',
    day: DayOfWeek.MONDAY,
    startTime: '09:00',
    endTime: '18:00',
    isClosed: false,
  };

  const mockService = {
    id: 'svc-1',
    name: 'Corte',
    duration: 30,
    price: 50,
  };

  beforeEach(async () => {
    prisma = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckAvailabilityTool,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    tool = module.get<CheckAvailabilityTool>(CheckAvailabilityTool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDefinition', () => {
    it('should return correct tool definition', () => {
      const definition = tool.getDefinition();

      expect(definition.name).toBe('check_availability');
      expect(definition.description).toContain('horários disponíveis');
      expect(definition.parameters.required).toContain('date');
    });
  });

  describe('execute', () => {
    // Get a future Monday for testing
    const getFutureMonday = (): string => {
      const date = new Date();
      const dayOfWeek = date.getDay();
      const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
      date.setDate(date.getDate() + daysUntilMonday);
      // Format in local timezone to avoid UTC shift issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    it('should return available slots for open day', async () => {
      const futureDate = getFutureMonday();
      prisma.operatingHour.findFirst.mockResolvedValue(
        mockOperatingHours as any,
      );
      prisma.service.findUnique.mockResolvedValue(mockService as any);
      prisma.appointment.findMany.mockResolvedValue([]);

      const result = await tool.execute(
        { date: futureDate },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(true);
      expect(result.data?.availableSlots).toBeDefined();
      expect(result.data?.availableSlots.length).toBeGreaterThan(0);
    });

    it('should return closed message for closed day', async () => {
      const futureDate = getFutureMonday();
      prisma.operatingHour.findFirst.mockResolvedValue({
        ...mockOperatingHours,
        isClosed: true,
      } as any);

      const result = await tool.execute(
        { date: futureDate },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(true);
      expect(result.data?.isClosed).toBe(true);
      expect(result.data?.slots).toEqual([]);
    });

    it('should use service duration when serviceId provided', async () => {
      const futureDate = getFutureMonday();
      prisma.operatingHour.findFirst.mockResolvedValue(
        mockOperatingHours as any,
      );
      prisma.service.findUnique.mockResolvedValue({
        ...mockService,
        duration: 60,
      } as any);
      prisma.appointment.findMany.mockResolvedValue([]);

      const result = await tool.execute(
        { date: futureDate, serviceId: 'svc-1' },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(prisma.service.findUnique).toHaveBeenCalledWith({
        where: { id: 'svc-1' },
      });
      expect(result.data?.serviceDuration).toBe('60 minutos');
    });

    it('should reject invalid date format', async () => {
      const result = await tool.execute(
        { date: 'invalid-date' },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Formato de data inválido');
    });

    it('should reject past dates', async () => {
      const pastDate = '2020-01-01';

      const result = await tool.execute(
        { date: pastDate },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('datas passadas');
    });

    it('should exclude times with existing appointments', async () => {
      const futureDate = getFutureMonday();
      const appointmentTime = new Date(`${futureDate}T10:00:00`);

      prisma.operatingHour.findFirst.mockResolvedValue(
        mockOperatingHours as any,
      );
      prisma.service.findUnique.mockResolvedValue(null);
      prisma.appointment.findMany.mockResolvedValue([
        {
          id: 'apt-1',
          date: appointmentTime,
          service: { duration: 60 },
          status: 'CONFIRMED',
        },
      ] as any);

      const result = await tool.execute(
        { date: futureDate },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(true);
      // 10:00 should not be in available slots due to conflict
      expect(result.data?.availableSlots).not.toContain('10:00');
    });

    it('should handle no operating hours configured', async () => {
      const futureDate = getFutureMonday();
      prisma.operatingHour.findFirst.mockResolvedValue(null);

      const result = await tool.execute(
        { date: futureDate },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      expect(result.success).toBe(true);
      expect(result.data?.isClosed).toBe(true);
    });

    it('should include day name in Portuguese', async () => {
      const futureDate = getFutureMonday();
      prisma.operatingHour.findFirst.mockResolvedValue(
        mockOperatingHours as any,
      );
      prisma.appointment.findMany.mockResolvedValue([]);

      const result = await tool.execute(
        { date: futureDate },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      // Verify day name is a valid Portuguese day name
      const validDayNames = [
        'Domingo',
        'Segunda-feira',
        'Terça-feira',
        'Quarta-feira',
        'Quinta-feira',
        'Sexta-feira',
        'Sábado',
      ];
      expect(validDayNames).toContain(result.data?.dayName);
    });

    it('should generate 30-minute interval slots', async () => {
      const futureDate = getFutureMonday();
      prisma.operatingHour.findFirst.mockResolvedValue({
        ...mockOperatingHours,
        startTime: '09:00',
        endTime: '11:00',
      } as any);
      prisma.appointment.findMany.mockResolvedValue([]);

      const result = await tool.execute(
        { date: futureDate },
        { tenantId: 'tenant-123', customerId: 'customer-123' },
      );

      // With 60min default duration and 30min intervals: 09:00, 09:30, 10:00
      expect(result.data?.availableSlots).toContain('09:00');
      expect(result.data?.availableSlots).toContain('09:30');
      expect(result.data?.availableSlots).toContain('10:00');
    });
  });
});
