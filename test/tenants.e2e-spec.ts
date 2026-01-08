import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { getAuthToken, authRequest } from './auth-helper';

describe('TenantsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let saasPlanId: string;
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
        name: 'Tenant Test Plan',
        price: 100,
      },
    });
    saasPlanId = plan.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.tenant.deleteMany();
    await prisma.saasPlan.deleteMany();
    await app.close();
  });

  it('/tenants (POST) - Success', async () => {
    const req = authRequest(app, authToken);
    return req
      .post('/tenants')
      .send({
        name: 'My Waba Store',
        wabaId: 'waba_123',
        phoneId: 'phone_123',
        accessToken: 'EAAG...',
        email: 'tenant@example.com',
        phone: '+1234567890',
        saasNextBilling: new Date().toISOString(),
        saasPaymentMethodId: 'pm_123',
        saasPlanId: saasPlanId,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toEqual('My Waba Store');
        expect(res.body.wabaId).toEqual('waba_123');
      });
  });

  it('/tenants (POST) - Failure (Plan not found)', async () => {
    const req = authRequest(app, authToken);
    return req
      .post('/tenants')
      .send({
        name: 'Failed Tenant',
        wabaId: 'waba_fail',
        phoneId: 'phone_fail',
        accessToken: 'EAAG...',
        email: 'fail@example.com',
        phone: '+1234567890',
        saasNextBilling: new Date().toISOString(),
        saasPaymentMethodId: 'pm_123',
        saasPlanId: '99999999-9999-9999-9999-999999999999',
      })
      .expect(400);
  });

  it('/tenants/:id (GET) - Success with inclusions', async () => {
    const req = authRequest(app, authToken);
    // Create a tenant first to get an ID
    const createRes = await req.post('/tenants').send({
      name: 'Include Tenant',
      wabaId: 'waba_inc',
      phoneId: 'phone_inc',
      accessToken: 'EAAG...',
      email: 'inc@example.com',
      phone: '+1234567892',
      saasNextBilling: new Date().toISOString(),
      saasPaymentMethodId: 'pm_456',
      saasPlanId: saasPlanId,
    });

    const tenantId = createRes.body.id;

    return req
      .get(`/tenants/${tenantId}?include=services,saasPlan`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toEqual(tenantId);
        expect(res.body.services).toBeDefined();
        expect(Array.isArray(res.body.services)).toBe(true);
      });
  });

  it('/tenants/:id (GET) - Success with customers inclusion', async () => {
    const req = authRequest(app, authToken);
    // Create a tenant
    const createRes = await req.post('/tenants').send({
      name: 'Customer Test Tenant',
      wabaId: 'waba_cust',
      phoneId: 'phone_cust',
      accessToken: 'EAAG...',
      email: 'cust_test@example.com',
      phone: '+1234567893',
      saasNextBilling: new Date().toISOString(),
      saasPaymentMethodId: 'pm_789',
      saasPlanId: saasPlanId,
    });

    const tenantId = createRes.body.id;

    // Create a customer and link them
    const customer = await prisma.customer.create({
      data: {
        phone: '+5511988887777',
        name: 'John Doe',
      },
    });

    await prisma.tenantCustomer.create({
      data: {
        tenantId,
        customerId: customer.id,
      },
    });

    return req
      .get(`/tenants/${tenantId}?include=customers`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toEqual(tenantId);
        expect(res.body.customers).toBeDefined();
        expect(res.body.customers.length).toBeGreaterThan(0);
        expect(res.body.customers[0].name).toEqual('John Doe');
      });
  });

  it('/tenants (GET)', () => {
    const req = authRequest(app, authToken);
    return req
      .get('/tenants')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
