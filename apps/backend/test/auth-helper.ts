import { INestApplication } from '@nestjs/common';
import request from 'supertest';

/**
 * Helper to get a JWT token for e2e tests
 * Requires an admin user to exist in the database
 */
export async function getAuthToken(app: INestApplication): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    })
    .expect(201);

  const body = response.body as { accessToken: string };
  return body.accessToken;
}

/**
 * Creates an authenticated request builder
 */
export function authRequest(
  app: INestApplication,
  token: string,
): {
  get: (url: string) => request.Test;
  post: (url: string) => request.Test;
  patch: (url: string) => request.Test;
  delete: (url: string) => request.Test;
} {
  const server = app.getHttpServer();
  return {
    get: (url: string) =>
      request(server).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) =>
      request(server).post(url).set('Authorization', `Bearer ${token}`),
    patch: (url: string) =>
      request(server).patch(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) =>
      request(server).delete(url).set('Authorization', `Bearer ${token}`),
  };
}
