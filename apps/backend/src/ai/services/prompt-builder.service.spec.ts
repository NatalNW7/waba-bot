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
      expect(prompt).toContain('assistente virtual inteligente');
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

    it('should include mini-calendar with next 7 days', () => {
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
        ],
      };

      const prompt = service.buildSystemPrompt(tenant, mockCustomer);

      expect(prompt).toContain('📅 CALENDÁRIO DOS PRÓXIMOS 7 DIAS');
      expect(prompt).toContain(
        '| Data       | Dia da Semana      | Funcionamento |',
      );
      // Should find at least one formatted date row
      expect(prompt).toMatch(/\| \d{4}-\d{2}-\d{2} \|/);
      // Should find the operating status in the table
      expect(prompt).toContain('09:00-18:00');
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

      expect(prompt).toContain('Português Brasileiro');
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

      expect(prompt).toContain('# TOOL USE PROTOCOL');
      expect(prompt).toContain('list_services');
      expect(prompt).toContain('check_availability');
      expect(prompt).toContain('book_appointment');
    });

    it('should include response guidelines', () => {
      const tenant: TenantContext = {
        tenantId: 'tenant-123',
        tenantName: 'Test Salon',
        phoneId: 'phone-123',
        services: [],
        operatingHours: [],
      };

      const prompt = service.buildSystemPrompt(tenant, mockCustomer);

      expect(prompt).toContain('# RESPONSE GUIDELINES');
      expect(prompt).toContain('Se precisar usar uma ferramenta');
      expect(prompt).toContain('Seja conciso');
    });

    it('should include reasoning process with private tags', () => {
      const tenant: TenantContext = {
        tenantId: 'tenant-123',
        tenantName: 'Test Salon',
        phoneId: 'phone-123',
        services: [],
        operatingHours: [],
      };

      const prompt = service.buildSystemPrompt(tenant, mockCustomer);

      expect(prompt).toContain('# REASONING PROCESS');
      expect(prompt).toContain('<reasoning>');
      expect(prompt).toContain('pensar passo-a-passo');
    });
  });

  describe('date helper methods', () => {
    it('formatISODate should return date in YYYY-MM-DD format', () => {
      const date = new Date('2026-01-24T14:00:00');
      const result = service.formatISODate(date);

      expect(result).toBe('2026-01-24');
    });
  });
});
