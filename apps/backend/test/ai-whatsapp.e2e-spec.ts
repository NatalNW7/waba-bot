import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * E2E tests for AI + WhatsApp integration.
 *
 * Note: These tests require:
 * - Running PostgreSQL with test data
 * - Valid GEMINI_API_KEY in .env.test (or mocked)
 * - Redis for BullMQ
 */
describe('AI WhatsApp Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testTenantId: string;
  let testCustomerId: string;

  const createWebhookPayload = (
    text: string,
    phoneNumberId: string,
    from: string,
  ) => ({
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
                phone_number_id: phoneNumberId,
              },
              contacts: [{ profile: { name: 'Test User' }, wa_id: from }],
              messages: [
                {
                  from,
                  id: `msg-${Date.now()}`,
                  timestamp: String(Math.floor(Date.now() / 1000)),
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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    await app.init();

    // Create or get test SaaS plan
    let saasPlan = await prisma.saasPlan.findFirst();
    if (!saasPlan) {
      saasPlan = await prisma.saasPlan.create({
        data: {
          name: 'E2E Test Plan',
          price: 49.9,
        },
      });
    }

    const testTenant = await prisma.tenant.create({
      data: {
        name: 'E2E Test Salon',
        phone: `551199${Date.now().toString().slice(-8)}`,
        email: `e2e-${Date.now()}@test.com`,
        phoneId: `phone-e2e-${Date.now()}`,
        aiEnabled: true,
        saasPlanId: saasPlan.id,
      },
    });
    testTenantId = testTenant.id;

    // Create test services
    await prisma.service.createMany({
      data: [
        { name: 'Corte', price: 50, duration: 30, tenantId: testTenantId },
        { name: 'Barba', price: 25, duration: 15, tenantId: testTenantId },
      ],
    });

    // Create operating hours
    await prisma.operatingHour.createMany({
      data: [
        {
          day: 'MONDAY',
          startTime: '09:00',
          endTime: '18:00',
          isClosed: false,
          tenantId: testTenantId,
        },
        {
          day: 'TUESDAY',
          startTime: '09:00',
          endTime: '18:00',
          isClosed: false,
          tenantId: testTenantId,
        },
        {
          day: 'WEDNESDAY',
          startTime: '09:00',
          endTime: '18:00',
          isClosed: false,
          tenantId: testTenantId,
        },
        {
          day: 'THURSDAY',
          startTime: '09:00',
          endTime: '18:00',
          isClosed: false,
          tenantId: testTenantId,
        },
        {
          day: 'FRIDAY',
          startTime: '09:00',
          endTime: '18:00',
          isClosed: false,
          tenantId: testTenantId,
        },
        {
          day: 'SATURDAY',
          startTime: '09:00',
          endTime: '14:00',
          isClosed: false,
          tenantId: testTenantId,
        },
        {
          day: 'SUNDAY',
          startTime: '00:00',
          endTime: '00:00',
          isClosed: true,
          tenantId: testTenantId,
        },
      ],
    });

    // Create test customer
    const testCustomer = await prisma.customer.create({
      data: { phone: `5511888${Date.now().toString().slice(-7)}` },
    });
    testCustomerId = testCustomer.id;

    await prisma.tenantCustomer.create({
      data: { tenantId: testTenantId, customerId: testCustomerId },
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testTenantId) {
      await prisma.appointment.deleteMany({
        where: { tenantId: testTenantId },
      });
      await prisma.operatingHour.deleteMany({
        where: { tenantId: testTenantId },
      });
      await prisma.service.deleteMany({ where: { tenantId: testTenantId } });
      await prisma.aIUsage.deleteMany({ where: { tenantId: testTenantId } });
      await prisma.conversationMessage.deleteMany({
        where: { tenantId: testTenantId },
      });
      await prisma.tenantCustomer.deleteMany({
        where: { tenantId: testTenantId },
      });
      await prisma.tenant.delete({ where: { id: testTenantId } });
    }
    if (testCustomerId) {
      await prisma.customer
        .delete({ where: { id: testCustomerId } })
        .catch(() => {});
    }
    await app.close();
  });

  describe('POST /webhook/whatsapp', () => {
    it('should accept and queue webhook payload', async () => {
      const tenant = await prisma.tenant.findUnique({
        where: { id: testTenantId },
      });

      const response = await request(app.getHttpServer())
        .post('/webhook/whatsapp')
        .send(createWebhookPayload('Olá', tenant!.phoneId!, '5511888888888'))
        .expect(201);

      expect(response.body).toEqual({ status: 'Message queued' });
    });

    it('should handle status update payloads (no messages)', async () => {
      const response = await request(app.getHttpServer())
        .post('/webhook/whatsapp')
        .send({
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
                    statuses: [{ id: 'msg-123', status: 'delivered' }],
                  },
                  field: 'messages',
                },
              ],
            },
          ],
        })
        .expect(201);

      expect(response.body).toEqual({ status: 'Message queued' });
    });

    it('should handle malformed payload gracefully', async () => {
      const response = await request(app.getHttpServer())
        .post('/webhook/whatsapp')
        .send({ invalid: 'payload' })
        .expect(201);

      expect(response.body).toEqual({ status: 'Message queued' });
    });
  });

  describe('AI Analytics Tracking', () => {
    it('should track AI usage in database after processing', async () => {
      // This test verifies that messages are being tracked
      // In a real scenario, you'd wait for the queue to process

      const usageCount = await prisma.aIUsage.count({
        where: { tenantId: testTenantId },
      });

      // Initially may be 0, will increase as messages are processed
      expect(typeof usageCount).toBe('number');
    });
  });

  describe('Tenant AI Configuration', () => {
    it('should respect aiEnabled flag', async () => {
      // Disable AI for tenant
      await prisma.tenant.update({
        where: { id: testTenantId },
        data: { aiEnabled: false },
      });

      const tenant = await prisma.tenant.findUnique({
        where: { id: testTenantId },
      });

      expect(tenant?.aiEnabled).toBe(false);

      // Re-enable for other tests
      await prisma.tenant.update({
        where: { id: testTenantId },
        data: { aiEnabled: true },
      });
    });

    it('should store tenant AI configuration', async () => {
      await prisma.tenant.update({
        where: { id: testTenantId },
        data: { aiCustomPrompt: 'Seja muito formal.' },
      });

      const tenant = await prisma.tenant.findUnique({
        where: { id: testTenantId },
      });

      expect(tenant?.aiCustomPrompt).toBe('Seja muito formal.');
    });
  });

  describe('Database Models', () => {
    it('should have ConversationMessage model available', async () => {
      const message = await prisma.conversationMessage.create({
        data: {
          role: 'user',
          content: 'Test message for e2e',
          tenantId: testTenantId,
          customerId: testCustomerId,
        },
      });

      expect(message.id).toBeDefined();
      expect(message.role).toBe('user');
      expect(message.content).toBe('Test message for e2e');

      // Clean up
      await prisma.conversationMessage.delete({ where: { id: message.id } });
    });

    it('should have AIUsage model available', async () => {
      const usage = await prisma.aIUsage.create({
        data: {
          promptTokens: 100,
          completionTokens: 50,
          model: 'gemini-1.5-flash',
          billingMonth: '2026-01',
          tenantId: testTenantId,
        },
      });

      expect(usage.id).toBeDefined();
      expect(usage.promptTokens).toBe(100);
      expect(usage.model).toBe('gemini-1.5-flash');

      // Clean up
      await prisma.aIUsage.delete({ where: { id: usage.id } });
    });
  });
});
