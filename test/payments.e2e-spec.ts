import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { MercadoPagoService } from './../src/payments/mercadopago.service';
import { Payment, PreApproval, Preference } from 'mercadopago';

// Mock Mercado Pago SDK
jest.mock('mercadopago');

describe('Payments E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let mpService: MercadoPagoService;
  let saasPlanId: string;
  let tenantId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MercadoPagoService)
      .useValue({
        getPlatformClient: jest.fn().mockReturnValue({}),
        getTenantClient: jest.fn().mockReturnValue({}),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    mpService = app.get(MercadoPagoService);
    await app.init();

    // Pre-test cleanup
    await prisma.appointment.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.tenantCustomer.deleteMany();
    await prisma.service.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.saasPlan.deleteMany();
    await prisma.customer.deleteMany();

    // Setup: Create SaaS Plan and Tenant
    const plan = await prisma.saasPlan.create({
      data: { name: 'E2E Plan', price: 99.9 },
    });
    saasPlanId = plan.id;

    const tenantRes = await request(app.getHttpServer()).post('/tenants').send({
      name: 'E2E Tenant',
      email: 'e2e@tenant.com',
      phone: '123456',
      saasPlanId,
      saasNextBilling: new Date().toISOString(),
      saasPaymentMethodId: 'pm_123',
    });
    tenantId = tenantRes.body.id;
  });

  afterAll(async () => {
    // Delete in order to avoid FK violations
    await prisma.appointment.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.tenantCustomer.deleteMany();
    await prisma.service.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.saasPlan.deleteMany();
    await prisma.customer.deleteMany();
    await app.close();
  });

  describe('SaaS Subscription Flow', () => {
    it('should initiate SaaS subscription', async () => {
      const mockPreApprovalCreate = jest.fn().mockResolvedValue({
        id: 'mp-sub-123',
        init_point: 'http://mp.com/pay',
      });
      (PreApproval as jest.Mock).mockImplementation(() => ({
        create: mockPreApprovalCreate,
      }));

      const res = await request(app.getHttpServer())
        .post(`/tenants/${tenantId}/subscribe`)
        .send({ cardTokenId: 'token_123' })
        .expect(201);

      expect(res.body.externalId).toEqual('mp-sub-123');
    });
  });

  describe('Appointment Payment & Webhook', () => {
    it('should create appointment payment preference and reconcile via webhook', async () => {
      // 1. Setup Appointment
      const customer = await prisma.customer.create({
        data: { name: 'E2E Cust', phone: '999999', email: 'cust@e2e.com' },
      });
      const service = await prisma.service.create({
        data: { name: 'E2E Service', price: 50, duration: 30, tenantId },
      });
      const appointment = await prisma.appointment.create({
        data: {
          date: new Date(),
          price: 50,
          tenantId,
          customerId: customer.id,
          serviceId: service.id,
        },
      });

      // 2. Mock MP
      const mockPrefCreate = jest.fn().mockResolvedValue({
        id: 'pref-abc',
        init_point: 'http://mp.com/pref',
      });
      (Preference as jest.Mock).mockImplementation(() => ({
        create: mockPrefCreate,
      }));
      jest.spyOn(mpService, 'getTenantClient').mockResolvedValue({} as any);

      await request(app.getHttpServer())
        .post(`/payments/appointment/${appointment.id}`)
        .expect(201);

      // 3. Simulate Webhook
      // Note: In E2E tests, we call the endpoint directly.
      // We'll mock the Payment.get call that the processor makes.
      const mockPaymentGet = jest.fn().mockResolvedValue({
        id: 'mp-pay-789',
        status: 'approved',
        transaction_amount: 50,
        external_reference: appointment.id,
      });
      (Payment as jest.Mock).mockImplementation(() => ({
        get: mockPaymentGet,
      }));

      await request(app.getHttpServer())
        .post(`/webhooks/mercadopago/${tenantId}`)
        .send({
          type: 'payment',
          data: { id: 'mp-pay-789' },
        })
        .expect(200);

      // Wait for Bull Queue (since it's async)
      // For testing, we can either use a small delay or make the queue synchronous in test env.
      // For now, let's just wait a bit.
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const updatedPayment = await prisma.payment.findFirst({
        where: { externalId: 'mp-pay-789' },
      });
      expect(updatedPayment).toBeDefined();
      expect(updatedPayment?.status).toEqual('APPROVED');

      const updatedApp = await prisma.appointment.findUnique({
        where: { id: appointment.id },
        include: { payment: true },
      });
      expect(updatedApp?.payment?.externalId).toEqual('mp-pay-789');
    });
  });
});
