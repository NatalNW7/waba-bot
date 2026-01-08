import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { getAuthToken, authRequest } from './auth-helper';

describe('ServicesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();

    // Get auth token
    authToken = await getAuthToken(app);

    // Create a dummy SaasPlan
    const plan = await prisma.saasPlan.create({
      data: {
        name: 'Service Test Plan',
        price: 100,
      },
    });

    // Create a dummy tenant for relation
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Service Test Tenant',
        wabaId: 'waba_svc_test',
        phoneId: 'phone_svc_test',
        accessToken: 'token',
        email: 'svc_test@example.com',
        phone: '+1234567890',
        saasNextBilling: new Date(),
        saasPaymentMethodId: 'pm_123',
        saasPlanId: plan.id,
      },
    });
    tenantId = tenant.id;
  });

  afterAll(async () => {
    await prisma.service.deleteMany();
    await prisma.tenant.delete({ where: { id: tenantId } });
    await app.close();
  });

  it('/services (POST)', async () => {
    const req = authRequest(app, authToken);
    return req
      .post('/services')
      .send({
        name: 'Haircut',
        price: 30.0,
        duration: 30,
        tenantId: tenantId,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toEqual('Haircut');
        expect(res.body.tenantId).toEqual(tenantId);
      });
  });

  it('/services (GET)', () => {
    const req = authRequest(app, authToken);
    return req
      .get('/services')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
