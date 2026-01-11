import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should return JWT token for valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty(
        'email',
        process.env.ADMIN_EMAIL,
      );
      expect(response.body.user).toHaveProperty('onboardingStatus');
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: process.env.ADMIN_EMAIL,
          password: 'wrong-password-12345',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent-user@test.com',
          password: 'any-password',
        })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 400 for missing email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: 'any-password',
        })
        .expect(400);
    });

    it('should return 400 for missing password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@test.com',
        })
        .expect(400);
    });
  });

  describe('GET /auth/me', () => {
    let validToken: string;

    beforeAll(async () => {
      // Get a valid token for tests
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
        });
      validToken = response.body.accessToken;
    });

    it('should return user session for valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', process.env.ADMIN_EMAIL);
      expect(response.body).toHaveProperty('role');
      expect(response.body).toHaveProperty('onboardingStatus');
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('code', 'INVALID_TOKEN');
    });

    it('should return 401 with INVALID_TOKEN code for malformed token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token-string')
        .expect(401);

      expect(response.body).toHaveProperty('code', 'INVALID_TOKEN');
    });

    it('should return 401 with TOKEN_EXPIRED code for expired token', async () => {
      // Create an expired token (expired 1 hour ago)
      const expiredToken = jwtService.sign(
        {
          sub: 'test-user-id',
          email: 'test@test.com',
          role: 'ADMIN',
        },
        {
          expiresIn: '-1h', // Already expired
        },
      );

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('code', 'TOKEN_EXPIRED');
    });
  });

  describe('POST /auth/verify', () => {
    let validToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
        });
      validToken = response.body.accessToken;
    });

    it('should return valid=true for valid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body).toHaveProperty('remainingMs');
      expect(response.body.remainingMs).toBeGreaterThan(0);
    });

    it('should return valid=false for missing token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify')
        .expect(201);

      expect(response.body).toHaveProperty('valid', false);
      expect(response.body.expiresAt).toBeNull();
      expect(response.body.remainingMs).toBeNull();
    });

    it('should return 401 with TOKEN_EXPIRED for expired token', async () => {
      const expiredToken = jwtService.sign(
        {
          sub: 'test-user-id',
          email: 'test@test.com',
          role: 'ADMIN',
        },
        {
          expiresIn: '-1h',
        },
      );

      const response = await request(app.getHttpServer())
        .post('/auth/verify')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty('code', 'TOKEN_EXPIRED');
    });

    it('should return 401 with INVALID_TOKEN for malformed token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/verify')
        .set('Authorization', 'Bearer invalid.malformed.token')
        .expect(401);

      expect(response.body).toHaveProperty('code', 'INVALID_TOKEN');
    });
  });

  describe('GET /auth/google', () => {
    it('should redirect to Google OAuth', async () => {
      // This endpoint redirects to Google, so we expect 302
      const response = await request(app.getHttpServer())
        .get('/auth/google')
        .expect(302);

      expect(response.header.location).toContain('accounts.google.com');
    });
  });
});
