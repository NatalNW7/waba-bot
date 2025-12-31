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

  it('/tenants (POST)', async () => {
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

  it('/tenants (GET)', () => {
    return request(app.getHttpServer())
      .get('/tenants')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
