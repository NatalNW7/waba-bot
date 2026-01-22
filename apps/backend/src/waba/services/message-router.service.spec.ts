import { Test, TestingModule } from '@nestjs/testing';
import { MessageRouterService, RouterResult } from './message-router.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LLMOrchestratorService } from '../../ai/services/llm-orchestrator.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { WebhookPayload } from '../waba.interface';

describe('MessageRouterService', () => {
  let service: MessageRouterService;
  let prisma: DeepMockProxy<PrismaService>;
  let llmOrchestrator: DeepMockProxy<LLMOrchestratorService>;

  const mockTenant = {
    id: 'tenant-123',
    name: 'Test Salon',
    aiEnabled: true,
    accessToken: 'token-123',
  };

  const createWebhookPayload = (text: string): WebhookPayload => ({
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'entry-123',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '5511999999999',
                phone_number_id: 'phone-123',
              },
              contacts: [{ profile: { name: 'João' }, wa_id: '5511888888888' }],
              messages: [
                {
                  from: '5511888888888',
                  id: 'msg-123',
                  timestamp: '1234567890',
                  text: { body: text },
                  type: 'text',
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  });

  beforeEach(async () => {
    prisma = mockDeep<PrismaService>();
    llmOrchestrator = mockDeep<LLMOrchestratorService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageRouterService,
        { provide: PrismaService, useValue: prisma },
        { provide: LLMOrchestratorService, useValue: llmOrchestrator },
      ],
    }).compile();

    service = module.get<MessageRouterService>(MessageRouterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('routeMessage', () => {
    it('should route text message to AI successfully', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant as any);
      llmOrchestrator.processMessage.mockResolvedValue({
        response: 'Olá! Como posso ajudar?',
        conversationId: 'conv-123',
        usage: { promptTokens: 100, completionTokens: 50 },
      });

      const result = await service.routeMessage(createWebhookPayload('Olá'));

      expect(result.success).toBe(true);
      expect(result.response).toBe('Olá! Como posso ajudar?');
      expect(result.tenantId).toBe('tenant-123');
    });

    it('should skip when no messages in payload', async () => {
      const payload: WebhookPayload = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: 'entry-123',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '123',
                    phone_number_id: 'phone-123',
                  },
                  contacts: [],
                  messages: [],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const result = await service.routeMessage(payload);

      expect(result.success).toBe(true);
      expect(result.response).toContain('No message');
    });

    it('should return error when tenant not found', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);

      const result = await service.routeMessage(createWebhookPayload('Olá'));

      expect(result.success).toBe(false);
      expect(result.error).toContain('Tenant not found');
    });

    it('should skip AI when aiEnabled is false', async () => {
      prisma.tenant.findUnique.mockResolvedValue({
        ...mockTenant,
        aiEnabled: false,
      } as any);

      const result = await service.routeMessage(createWebhookPayload('Olá'));

      expect(result.success).toBe(true);
      expect(result.response).toContain('not enabled');
      expect(llmOrchestrator.processMessage).not.toHaveBeenCalled();
    });

    it('should extract message text correctly', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant as any);
      llmOrchestrator.processMessage.mockResolvedValue({
        response: 'Response',
        conversationId: 'conv-123',
        usage: { promptTokens: 10, completionTokens: 5 },
      });

      await service.routeMessage(
        createWebhookPayload('Quero agendar um corte'),
      );

      expect(llmOrchestrator.processMessage).toHaveBeenCalledWith({
        tenantId: 'tenant-123',
        customerPhone: '5511888888888',
        messageText: 'Quero agendar um corte',
      });
    });

    it('should skip non-text messages', async () => {
      const payload = createWebhookPayload('');
      payload.entry[0].changes[0].value.messages[0].type = 'image';
      payload.entry[0].changes[0].value.messages[0].text = undefined as any;

      prisma.tenant.findUnique.mockResolvedValue(mockTenant as any);

      const result = await service.routeMessage(payload);

      expect(result.success).toBe(true);
      expect(result.response).toContain('Non-text message');
      expect(llmOrchestrator.processMessage).not.toHaveBeenCalled();
    });

    it('should handle AI processing errors', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant as any);
      llmOrchestrator.processMessage.mockRejectedValue(new Error('AI Error'));

      const result = await service.routeMessage(createWebhookPayload('Olá'));

      expect(result.success).toBe(false);
      expect(result.error).toBe('AI Error');
    });

    it('should find tenant by phoneId', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant as any);
      llmOrchestrator.processMessage.mockResolvedValue({
        response: 'Hi',
        conversationId: 'conv-123',
        usage: { promptTokens: 10, completionTokens: 5 },
      });

      await service.routeMessage(createWebhookPayload('Olá'));

      expect(prisma.tenant.findUnique).toHaveBeenCalledWith({
        where: { phoneId: 'phone-123' },
        select: expect.objectContaining({
          id: true,
          aiEnabled: true,
        }),
      });
    });
  });
});
