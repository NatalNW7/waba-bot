import { MessageFormatterService } from './message-formatter.service';

describe('MessageFormatterService', () => {
  let service: MessageFormatterService;

  beforeEach(() => {
    service = new MessageFormatterService();
  });

  describe('formatForWhatsApp', () => {
    it('should convert markdown bold to WhatsApp bold', () => {
      const input = 'Hello **world**!';
      const result = service.formatForWhatsApp(input);

      expect(result).toBe('Hello *world*!');
    });

    it('should remove markdown links and keep text', () => {
      const input = 'Check [this link](https://example.com) out';
      const result = service.formatForWhatsApp(input);

      expect(result).toBe('Check this link out');
    });

    it('should clean up excessive newlines', () => {
      const input = 'Line 1\n\n\n\nLine 2\n\n\n\n\nLine 3';
      const result = service.formatForWhatsApp(input);

      expect(result).toBe('Line 1\n\nLine 2\n\nLine 3');
    });

    it('should truncate long messages', () => {
      const longText = 'a'.repeat(5000);
      const result = service.formatForWhatsApp(longText);

      expect(result.length).toBeLessThanOrEqual(4096);
      expect(result.endsWith('...')).toBe(true);
    });

    it('should trim whitespace', () => {
      const input = '  Hello world  ';
      const result = service.formatForWhatsApp(input);

      expect(result).toBe('Hello world');
    });

    it('should handle multiple markdown conversions', () => {
      const input = '**Bold 1** and **Bold 2**';
      const result = service.formatForWhatsApp(input);

      expect(result).toBe('*Bold 1* and *Bold 2*');
    });
  });

  describe('formatServicesList', () => {
    it('should format services with emoji header', () => {
      const services = [
        { name: 'Corte', price: 'R$ 50.00', duration: '30 minutos' },
        { name: 'Barba', price: 'R$ 25.00', duration: '15 minutos' },
      ];

      const result = service.formatServicesList(services);

      expect(result).toContain('📋');
      expect(result).toContain('*Nossos Serviços*');
    });

    it('should format each service with number and details', () => {
      const services = [
        { name: 'Corte', price: 'R$ 50.00', duration: '30 minutos' },
      ];

      const result = service.formatServicesList(services);

      expect(result).toContain('1. *Corte*');
      expect(result).toContain('💰 R$ 50.00');
      expect(result).toContain('⏱️ 30 minutos');
    });

    it('should handle empty services list', () => {
      const result = service.formatServicesList([]);

      expect(result).toContain('Nenhum serviço cadastrado');
    });

    it('should format multiple services correctly', () => {
      const services = [
        { name: 'Corte', price: 'R$ 50.00', duration: '30 minutos' },
        { name: 'Barba', price: 'R$ 25.00', duration: '15 minutos' },
        { name: 'Coloração', price: 'R$ 150.00', duration: '90 minutos' },
      ];

      const result = service.formatServicesList(services);

      expect(result).toContain('1. *Corte*');
      expect(result).toContain('2. *Barba*');
      expect(result).toContain('3. *Coloração*');
    });
  });

  describe('formatAvailableSlots', () => {
    it('should format slots with date header', () => {
      const slots = ['09:00', '10:00', '11:00'];
      const result = service.formatAvailableSlots('25/01/2026', slots);

      expect(result).toContain('📅');
      expect(result).toContain('25/01/2026');
    });

    it('should format each slot with clock emoji', () => {
      const slots = ['09:00', '10:00'];
      const result = service.formatAvailableSlots('25/01/2026', slots);

      expect(result).toContain('🕐 09:00');
      expect(result).toContain('🕐 10:00');
    });

    it('should handle no available slots', () => {
      const result = service.formatAvailableSlots('25/01/2026', []);

      expect(result).toContain('😔');
      expect(result).toContain('Não há horários disponíveis');
      expect(result).toContain('25/01/2026');
    });
  });

  describe('formatAppointmentConfirmation', () => {
    it('should format confirmation with all details', () => {
      const data = {
        service: 'Corte',
        date: '25/01/2026',
        time: '14:00',
        price: 'R$ 50.00',
      };

      const result = service.formatAppointmentConfirmation(data);

      expect(result).toContain('✅');
      expect(result).toContain('*Agendamento Confirmado!*');
      expect(result).toContain('Corte');
      expect(result).toContain('25/01/2026');
      expect(result).toContain('14:00');
      expect(result).toContain('R$ 50.00');
    });

    it('should include friendly closing message', () => {
      const data = {
        service: 'Corte',
        date: '25/01/2026',
        time: '14:00',
        price: 'R$ 50.00',
      };

      const result = service.formatAppointmentConfirmation(data);

      expect(result).toContain('Até lá!');
    });
  });

  describe('formatErrorMessage', () => {
    it('should return user-friendly error message', () => {
      const result = service.formatErrorMessage();

      expect(result).toContain('😔');
      expect(result).toContain('Desculpe');
      expect(result).toContain('tente novamente');
    });
  });
});
