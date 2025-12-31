import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('TenantsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    // Clean up
    await prisma.tenant.deleteMany();
    await app.close();
  });

  it('/tenants (POST) - Success', async () => {
    return request(app.getHttpServer())
      .post('/tenants')
      .send({
        name: 'My Waba Store',
        wabaId: 'waba_123',
        phoneId: 'phone_123',
        accessToken: 'EAAG...',
        email: 'tenant@example.com',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toEqual('My Waba Store');
        expect(res.body.wabaId).toEqual('waba_123');
      });
  });

  it('/tenants (POST) - Failure (Plan not found)', async () => {
    return request(app.getHttpServer())
      .post('/tenants')
      .send({
        name: 'Failed Tenant',
        wabaId: 'waba_fail',
        phoneId: 'phone_fail',
        accessToken: 'EAAG...',
        email: 'fail@example.com',
        saasPlanId: '99999999-9999-9999-9999-999999999999',
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toEqual('this saas plan does not exists');
      });
  });

  it('/tenants/:id (GET) - Success with inclusions', async () => {
    // Create a tenant first to get an ID
    const createRes = await request(app.getHttpServer())
      .post('/tenants')
      .send({
        name: 'Include Tenant',
        wabaId: 'waba_inc',
        phoneId: 'phone_inc',
        accessToken: 'EAAG...',
        email: 'inc@example.com',
      });

    const tenantId = createRes.body.id;

    return request(app.getHttpServer())
      .get(`/tenants/${tenantId}?include=services,saasPlan`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toEqual(tenantId);
        expect(res.body.services).toBeDefined();
        expect(Array.isArray(res.body.services)).toBe(true);
      });
  });

  it('/tenants (GET)', () => {
    return request(app.getHttpServer())
      .get('/tenants')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
