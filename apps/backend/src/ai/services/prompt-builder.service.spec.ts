import { PromptBuilderService } from './prompt-builder.service';
import {
  TenantContext,
  CustomerInfo,
} from '../interfaces/conversation.interface';

describe('PromptBuilderService', () => {
  let service: PromptBuilderService;

  const mockCustomer: CustomerInfo = {
    phone: '+5511999999999',
    name: 'João Silva',
  };

  beforeEach(() => {
    service = new PromptBuilderService();
  });

  describe('buildSystemPrompt', () => {
    it('should include tenant name in prompt', () => {
      const tenant: TenantContext = {
        tenantId: 'tenant-123',
        tenantName: 'Salão da Maria',
        phoneId: 'phone-123',
        services: [],
        operatingHours: [],
      };

      const prompt = service.buildSystemPrompt(tenant, mockCustomer);

      expect(prompt).toContain('Salão da Maria');
      expect(prompt).toContain('assistente virtual');
    });

    it('should include customer name in prompt', () => {
      const tenant: TenantContext = {
        tenantId: 'tenant-123',
        tenantName: 'Test Salon',
        phoneId: 'phone-123',
        services: [],
        operatingHours: [],
      };

      const prompt = service.buildSystemPrompt(tenant, mockCustomer);

      expect(prompt).toContain('João Silva');
    });

    it('should format services with prices and duration', () => {
      const tenant: TenantContext = {
        tenantId: 'tenant-123',
        tenantName: 'Test Salon',
        phoneId: 'phone-123',
        services: [
          { id: 'svc-1', name: 'Corte', price: 50.0, duration: 30 },
          { id: 'svc-2', name: 'Barba', price: 25.5, duration: 15 },
        ],
        operatingHours: [],
      };

      const prompt = service.buildSystemPrompt(tenant, mockCustomer);

      expect(prompt).toContain('**Corte**: R$ 50.00 (30 min)');
      expect(prompt).toContain('**Barba**: R$ 25.50 (15 min)');
    });

    it('should handle no services gracefully', () => {
      const tenant: TenantContext = {
        tenantId: 'tenant-123',
        tenantName: 'Test Salon',
        phoneId: 'phone-123',
        services: [],
        operatingHours: [],
      };

      const prompt = service.buildSystemPrompt(tenant, mockCustomer);

      expect(prompt).toContain('Nenhum serviço cadastrado ainda');
    });

    it('should format operating hours correctly', () => {
      const tenant: TenantContext = {
        tenantId: 'tenant-123',
        tenantName: 'Test Salon',
        phoneId: 'phone-123',
        services: [],
        operatingHours: [
          {
            day: 'MONDAY',
            startTime: '09:00',
            endTime: '18:00',
            isClosed: false,
          },
          {
            day: 'TUESDAY',
            startTime: '09:00',
            endTime: '18:00',
            isClosed: false,
          },
          {
            day: 'SUNDAY',
            startTime: '00:00',
            endTime: '00:00',
            isClosed: true,
          },
        ],
      };

      const prompt = service.buildSystemPrompt(tenant, mockCustomer);

      expect(prompt).toContain('Segunda: 09:00 às 18:00');
      expect(prompt).toContain('Terça: 09:00 às 18:00');
      expect(prompt).toContain('Domingo: Fechado');
    });

    it('should sort operating hours by day of week', () => {
      const tenant: TenantContext = {
        tenantId: 'tenant-123',
        tenantName: 'Test Salon',
        phoneId: 'phone-123',
        services: [],
        operatingHours: [
          {
            day: 'FRIDAY',
            startTime: '09:00',
            endTime: '18:00',
            isClosed: false,
          },
          {
            day: 'MONDAY',
            startTime: '09:00',
            endTime: '18:00',
            isClosed: false,
          },
          {
            day: 'WEDNESDAY',
            startTime: '09:00',
            endTime: '18:00',
            isClosed: false,
          },
        ],
      };

      const prompt = service.buildSystemPrompt(tenant, mockCustomer);

      const mondayIndex = prompt.indexOf('Segunda');
      const wednesdayIndex = prompt.indexOf('Quarta');
      const fridayIndex = prompt.indexOf('Sexta');

      expect(mondayIndex).toBeLessThan(wednesdayIndex);
      expect(wednesdayIndex).toBeLessThan(fridayIndex);
    });

    it('should include Portuguese language instructions', () => {
      const tenant: TenantContext = {
        tenantId: 'tenant-123',
        tenantName: 'Test Salon',
        phoneId: 'phone-123',
        services: [],
        operatingHours: [],
      };

      const prompt = service.buildSystemPrompt(tenant, mockCustomer);

      expect(prompt).toContain('português brasileiro');
    });

    it('should include tool usage instructions', () => {
      const tenant: TenantContext = {
        tenantId: 'tenant-123',
        tenantName: 'Test Salon',
        phoneId: 'phone-123',
        services: [],
        operatingHours: [],
      };

      const prompt = service.buildSystemPrompt(tenant, mockCustomer);

      expect(prompt).toContain('list_services');
      expect(prompt).toContain('check_availability');
      expect(prompt).toContain('book_appointment');
    });

    it('should include booking flow instructions', () => {
      const tenant: TenantContext = {
        tenantId: 'tenant-123',
        tenantName: 'Test Salon',
        phoneId: 'phone-123',
        services: [],
        operatingHours: [],
      };

      const prompt = service.buildSystemPrompt(tenant, mockCustomer);

      expect(prompt).toContain('Fluxo de Agendamento');
      expect(prompt).toContain('Cumprimente');
      expect(prompt).toContain('serviço desejado');
    });

    it('should include date and time context', () => {
      const tenant: TenantContext = {
        tenantId: 'tenant-123',
        tenantName: 'Test Salon',
        phoneId: 'phone-123',
        services: [],
        operatingHours: [],
      };

      const prompt = service.buildSystemPrompt(tenant, mockCustomer);

      expect(prompt).toContain('Data e Hora Atual');
      expect(prompt).toContain('Conversão de Datas');
      expect(prompt).toContain('YYYY-MM-DD');
    });

    it('should include Chain-of-Thought reasoning section', () => {
      const tenant: TenantContext = {
        tenantId: 'tenant-123',
        tenantName: 'Test Salon',
        phoneId: 'phone-123',
        services: [],
        operatingHours: [],
      };

      const prompt = service.buildSystemPrompt(tenant, mockCustomer);

      expect(prompt).toContain('Raciocínio Antes de Agendar');
      expect(prompt).toContain('Data atual');
      expect(prompt).toContain('Pedido do cliente');
      expect(prompt).toContain('Cálculo da data');
    });

    it('should include date conversion examples for relative dates', () => {
      const tenant: TenantContext = {
        tenantId: 'tenant-123',
        tenantName: 'Test Salon',
        phoneId: 'phone-123',
        services: [],
        operatingHours: [],
      };

      const prompt = service.buildSystemPrompt(tenant, mockCustomer);

      expect(prompt).toContain('"hoje"');
      expect(prompt).toContain('"amanhã"');
      expect(prompt).toContain('"próxima segunda"');
    });
  });

  describe('date helper methods', () => {
    it('formatFullDate should return date in Portuguese format', () => {
      const date = new Date('2026-01-24T14:00:00');
      const result = service.formatFullDate(date);

      expect(result).toBe('24 de janeiro de 2026');
    });

    it('formatFullDate should handle different months', () => {
      const date = new Date('2026-08-15T10:00:00');
      const result = service.formatFullDate(date);

      expect(result).toBe('15 de agosto de 2026');
    });

    it('getCurrentDayName should return day in Portuguese', () => {
      const result = service.getCurrentDayName();

      // This will vary based on the current day, but should be one of these
      const validDays = [
        'domingo',
        'segunda-feira',
        'terça-feira',
        'quarta-feira',
        'quinta-feira',
        'sexta-feira',
        'sábado',
      ];
      expect(validDays).toContain(result);
    });

    it('formatTime should return time in HH:mm format', () => {
      const date = new Date('2026-01-24T14:30:00');
      const result = service.formatTime(date);

      expect(result).toBe('14:30');
    });

    it('formatISODate should return date in YYYY-MM-DD format', () => {
      const date = new Date('2026-01-24T14:00:00');
      const result = service.formatISODate(date);

      expect(result).toBe('2026-01-24');
    });

    it('getTomorrow should return next day in YYYY-MM-DD format', () => {
      const result = service.getTomorrow();

      // Should be a valid date format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Should be tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const expectedDate = tomorrow.toISOString().split('T')[0];
      expect(result).toBe(expectedDate);
    });

    it('getNextWeekday should calculate correct next Monday', () => {
      const result = service.getNextWeekday('MONDAY');

      // Should be a valid date format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Parse the result in local timezone and verify it's a Monday
      const [year, month, day] = result.split('-').map(Number);
      const resultDate = new Date(year, month - 1, day);
      expect(resultDate.getDay()).toBe(1); // Monday is 1
    });

    it('getNextWeekday should calculate correct next Friday', () => {
      const result = service.getNextWeekday('FRIDAY');

      // Should be a valid date format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      // Parse the result in local timezone and verify it's a Friday
      const [year, month, day] = result.split('-').map(Number);
      const resultDate = new Date(year, month - 1, day);
      expect(resultDate.getDay()).toBe(5); // Friday is 5
    });

    it('getNextWeekday should return next week if today is the target day', () => {
      // Use the same timezone-aware approach as the service
      const saoPauloTime = new Date().toLocaleString('en-US', {
        timeZone: 'America/Sao_Paulo',
      });
      const today = new Date(saoPauloTime);

      const days = [
        'SUNDAY',
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
      ];
      const todayName = days[today.getDay()];

      const result = service.getNextWeekday(todayName);
      const [year, month, day] = result.split('-').map(Number);
      const resultDate = new Date(year, month - 1, day);

      // Should be 7 days from now
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() + 7);

      expect(service.formatISODate(resultDate)).toBe(
        service.formatISODate(expectedDate),
      );
    });

    it('getNextWeekday should handle invalid day name', () => {
      const result = service.getNextWeekday('INVALID');

      expect(result).toBe('data inválida');
    });
  });
});
