import { PromptBuilderService } from './prompt-builder.service';
import { TenantContext } from '../interfaces/conversation.interface';

describe('PromptBuilderService', () => {
  let service: PromptBuilderService;

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

      const prompt = service.buildSystemPrompt(tenant);

      expect(prompt).toContain('Salão da Maria');
      expect(prompt).toContain('assistente virtual');
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

      const prompt = service.buildSystemPrompt(tenant);

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

      const prompt = service.buildSystemPrompt(tenant);

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

      const prompt = service.buildSystemPrompt(tenant);

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

      const prompt = service.buildSystemPrompt(tenant);

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

      const prompt = service.buildSystemPrompt(tenant);

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

      const prompt = service.buildSystemPrompt(tenant);

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

      const prompt = service.buildSystemPrompt(tenant);

      expect(prompt).toContain('Fluxo de Agendamento');
      expect(prompt).toContain('Cumprimente');
      expect(prompt).toContain('serviço desejado');
    });
  });
});
