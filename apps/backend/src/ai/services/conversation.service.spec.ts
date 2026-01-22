import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from './conversation.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('ConversationService', () => {
  let service: ConversationService;
  let prisma: DeepMockProxy<PrismaService>;

  const mockTenant = {
    id: 'tenant-123',
    name: 'Test Salon',
    phoneId: 'phone-123',
    services: [
      { id: 'svc-1', name: 'Corte', price: 50, duration: 30 },
      { id: 'svc-2', name: 'Barba', price: 30, duration: 20 },
    ],
    operatingHours: [
      { day: 'MONDAY', startTime: '09:00', endTime: '18:00', isClosed: false },
      { day: 'SUNDAY', startTime: '00:00', endTime: '00:00', isClosed: true },
    ],
  };

  const mockCustomer = {
    id: 'customer-123',
    phone: '5511999999999',
    name: 'João Silva',
    email: 'joao@email.com',
  };

  beforeEach(async () => {
    prisma = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreateContext', () => {
    it('should create new context when none exists', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant as any);
      prisma.customer.findUnique.mockResolvedValue(mockCustomer as any);
      prisma.tenantCustomer.findUnique.mockResolvedValue({
        tenantId: 'tenant-123',
        customerId: 'customer-123',
      } as any);

      const context = await service.getOrCreateContext(
        'tenant-123',
        '5511999999999',
      );

      expect(context).toBeDefined();
      expect(context.tenant.tenantId).toBe('tenant-123');
      expect(context.customer.phone).toBe('5511999999999');
      expect(context.messages).toEqual([]);
      expect(context.conversationId).toMatch(/^conv_\d+_/);
    });

    it('should return cached context on second call', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant as any);
      prisma.customer.findUnique.mockResolvedValue(mockCustomer as any);
      prisma.tenantCustomer.findUnique.mockResolvedValue({
        tenantId: 'tenant-123',
        customerId: 'customer-123',
      } as any);

      const context1 = await service.getOrCreateContext(
        'tenant-123',
        '5511999999999',
      );
      const context2 = await service.getOrCreateContext(
        'tenant-123',
        '5511999999999',
      );

      expect(context1.conversationId).toBe(context2.conversationId);
      expect(prisma.tenant.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should create new customer when not found', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant as any);
      prisma.customer.findUnique.mockResolvedValue(null);
      prisma.customer.create.mockResolvedValue(mockCustomer as any);
      prisma.tenantCustomer.findUnique.mockResolvedValue(null);
      prisma.tenantCustomer.create.mockResolvedValue({
        tenantId: 'tenant-123',
        customerId: 'customer-123',
      } as any);

      const context = await service.getOrCreateContext(
        'tenant-123',
        '5511999999999',
      );

      expect(prisma.customer.create).toHaveBeenCalledWith({
        data: { phone: '5511999999999' },
      });
      expect(prisma.tenantCustomer.create).toHaveBeenCalled();
      expect(context.customer.customerId).toBe('customer-123');
    });

    it('should throw error when tenant not found', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);

      await expect(
        service.getOrCreateContext('nonexistent', '5511999999999'),
      ).rejects.toThrow('Tenant not found: nonexistent');
    });

    it('should format services with correct types', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant as any);
      prisma.customer.findUnique.mockResolvedValue(mockCustomer as any);
      prisma.tenantCustomer.findUnique.mockResolvedValue({
        tenantId: 'tenant-123',
        customerId: 'customer-123',
      } as any);

      const context = await service.getOrCreateContext(
        'tenant-123',
        '5511999999999',
      );

      expect(context.tenant.services).toHaveLength(2);
      expect(context.tenant.services[0]).toEqual({
        id: 'svc-1',
        name: 'Corte',
        price: 50,
        duration: 30,
      });
    });
  });

  describe('appendMessage', () => {
    it('should append user message to context', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant as any);
      prisma.customer.findUnique.mockResolvedValue(mockCustomer as any);
      prisma.tenantCustomer.findUnique.mockResolvedValue({
        tenantId: 'tenant-123',
        customerId: 'customer-123',
      } as any);

      const context = await service.getOrCreateContext(
        'tenant-123',
        '5511999999999',
      );

      service.appendMessage(context, {
        role: 'user',
        content: 'Olá, quero agendar um corte',
      });

      expect(context.messages).toHaveLength(1);
      expect(context.messages[0].role).toBe('user');
      expect(context.messages[0].content).toBe('Olá, quero agendar um corte');
    });

    it('should append assistant message to context', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant as any);
      prisma.customer.findUnique.mockResolvedValue(mockCustomer as any);
      prisma.tenantCustomer.findUnique.mockResolvedValue({
        tenantId: 'tenant-123',
        customerId: 'customer-123',
      } as any);

      const context = await service.getOrCreateContext(
        'tenant-123',
        '5511999999999',
      );

      service.appendMessage(context, { role: 'user', content: 'Olá' });
      service.appendMessage(context, {
        role: 'assistant',
        content: 'Olá! Como posso ajudar?',
      });

      expect(context.messages).toHaveLength(2);
      expect(context.messages[1].role).toBe('assistant');
    });

    it('should update context timestamp on append', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant as any);
      prisma.customer.findUnique.mockResolvedValue(mockCustomer as any);
      prisma.tenantCustomer.findUnique.mockResolvedValue({
        tenantId: 'tenant-123',
        customerId: 'customer-123',
      } as any);

      const context = await service.getOrCreateContext(
        'tenant-123',
        '5511999999999',
      );
      const initialTime = context.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));
      service.appendMessage(context, { role: 'user', content: 'Test' });

      expect(context.updatedAt.getTime()).toBeGreaterThan(
        initialTime.getTime(),
      );
    });
  });

  describe('getRecentMessages', () => {
    it('should return limited messages', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant as any);
      prisma.customer.findUnique.mockResolvedValue(mockCustomer as any);
      prisma.tenantCustomer.findUnique.mockResolvedValue({
        tenantId: 'tenant-123',
        customerId: 'customer-123',
      } as any);

      const context = await service.getOrCreateContext(
        'tenant-123',
        '5511999999999',
      );

      // Add 15 messages
      for (let i = 0; i < 15; i++) {
        service.appendMessage(context, {
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i}`,
        });
      }

      const recent = service.getRecentMessages(context, 5);

      expect(recent).toHaveLength(5);
      expect(recent[0].content).toBe('Message 10');
      expect(recent[4].content).toBe('Message 14');
    });

    it('should return all messages when less than limit', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant as any);
      prisma.customer.findUnique.mockResolvedValue(mockCustomer as any);
      prisma.tenantCustomer.findUnique.mockResolvedValue({
        tenantId: 'tenant-123',
        customerId: 'customer-123',
      } as any);

      const context = await service.getOrCreateContext(
        'tenant-123',
        '5511999999999',
      );
      service.appendMessage(context, { role: 'user', content: 'Hello' });
      service.appendMessage(context, { role: 'assistant', content: 'Hi!' });

      const recent = service.getRecentMessages(context, 10);

      expect(recent).toHaveLength(2);
    });
  });

  describe('clearContext', () => {
    it('should remove context from cache', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant as any);
      prisma.customer.findUnique.mockResolvedValue(mockCustomer as any);
      prisma.tenantCustomer.findUnique.mockResolvedValue({
        tenantId: 'tenant-123',
        customerId: 'customer-123',
      } as any);

      const context1 = await service.getOrCreateContext(
        'tenant-123',
        '5511999999999',
      );
      service.clearContext('tenant-123', '5511999999999');

      const context2 = await service.getOrCreateContext(
        'tenant-123',
        '5511999999999',
      );

      expect(context1.conversationId).not.toBe(context2.conversationId);
    });
  });
});
