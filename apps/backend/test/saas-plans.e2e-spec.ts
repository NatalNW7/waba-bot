import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { getAuthToken, authRequest } from './auth-helper';

describe('SaasPlansController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
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
  });

  afterAll(async () => {
    // Clean up
    await prisma.saasPlan.deleteMany();
    await app.close();
  });

  it('/saas-plans (POST)', async () => {
    const req = authRequest(app, authToken);
    return req
      .post('/saas-plans')
      .send({
        name: 'Test Plan',
        price: 99.99,
        description: 'A test plan',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toEqual('Test Plan');
        expect(res.body.price).toEqual('99.99');
      });
  });

  it('/saas-plans (GET)', () => {
    const req = authRequest(app, authToken);
    return req
      .get('/saas-plans')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
