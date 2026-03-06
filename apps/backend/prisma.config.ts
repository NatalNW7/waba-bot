// Load .env for local development; in production env vars are injected by the platform
try {
  require('dotenv/config');
} catch {
  // dotenv is a devDependency, not available in production — that's fine
}
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
