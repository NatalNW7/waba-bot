import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('CustomersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();

    // Create a dummy tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Customer Test Tenant',
        wabaId: 'waba_cust_test',
        phoneId: 'phone_cust_test',
        accessToken: 'token',
        email: 'cust_test@example.com',
      },
    });
    tenantId = tenant.id;
  });

  afterAll(async () => {
    await prisma.customer.deleteMany();
    await prisma.tenant.delete({ where: { id: tenantId } });
    await app.close();
  });

  it('/customers (POST)', async () => {
    return request(app.getHttpServer())
      .post('/customers')
      .send({
        phone: '5511999999999',
        name: 'John Doe',
        email: 'john@example.com',
        tenantId: tenantId,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.phone).toEqual('5511999999999');
        expect(res.body.name).toEqual('John Doe');
      });
  });

  it('/customers (GET)', () => {
    return request(app.getHttpServer())
      .get('/customers')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
