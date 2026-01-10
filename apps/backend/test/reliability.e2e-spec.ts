import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { MercadoPagoService } from './../src/payments/mercadopago.service';
import { Payment } from 'mercadopago';

jest.mock('mercadopago');

describe('Reliability & Edge Cases (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
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
    await app.init();

    // Setup Tenant
    const plan = await prisma.saasPlan.create({
      data: { name: 'Rel Plan', price: 10 },
    });
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Rel Tenant',
        email: 'rel@tenant.com',
        phone: '123',
        saasPlanId: plan.id,
        saasNextBilling: new Date(),
        saasPaymentMethodId: 'pm_rel',
      },
    });
    tenantId = tenant.id;
  });

  afterAll(async () => {
    await prisma.payment.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.saasPlan.deleteMany();
    await prisma.customer.deleteMany();
    await app.close();
  });

  describe('Webhook Idempotency', () => {
    it('should handle duplicate payment notifications gracefully', async () => {
      const customer = await prisma.customer.create({
        data: { name: 'C1', phone: '111', email: 'c1@test.com' },
      });
      const appointment = await prisma.appointment.create({
        data: {
          date: new Date(),
          price: 100,
          tenantId,
          customerId: customer.id,
        },
      });

      const paymentId = 'duplicate-pay-123';
      const mockPaymentGet = jest.fn().mockResolvedValue({
        id: paymentId,
        status: 'approved',
        transaction_amount: 100,
        external_reference: appointment.id,
      });
      (Payment as jest.Mock).mockImplementation(() => ({
        get: mockPaymentGet,
      }));

      // Send first time
      await request(app.getHttpServer())
        .post(`/webhooks/mercadopago/${tenantId}`)
        .send({ type: 'payment', data: { id: paymentId } })
        .expect(200);

      // Send second time (immediately)
      await request(app.getHttpServer())
        .post(`/webhooks/mercadopago/${tenantId}`)
        .send({ type: 'payment', data: { id: paymentId } })
        .expect(200);

      // Wait for queue
      await new Promise((resolve) => setTimeout(resolve, 8081));

      // Should have only one payment record with this externalId
      const payments = await prisma.payment.findMany({
        where: { externalId: paymentId },
      });
      expect(payments.length).toBe(1);
      expect(payments[0].status).toBe('APPROVED');
    });
  });

  describe('Webhook Edge Cases', () => {
    it('should ignore notifications for unknown topics', async () => {
      const res = await request(app.getHttpServer())
        .post(`/webhooks/mercadopago/${tenantId}`)
        .send({ type: 'unknown_topic', data: { id: 'some-id' } })
        .expect(200);

      expect(res.body.received).toBe(true);
      // No errors should happen, just ignored
    });

    it('should handle missing data/id in payload gracefully', async () => {
      await request(app.getHttpServer())
        .post(`/webhooks/mercadopago/${tenantId}`)
        .send({ type: 'payment' }) // missing data
        .expect(200);

      // Should return 200 but not queue anything useful
    });
  });
});
