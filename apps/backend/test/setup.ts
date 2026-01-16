// Jest setup file - loads .env.test before running tests
// Uses override: false to preserve existing environment variables (like DATABASE_URL from Docker)
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../.env.test'),
  override: false,
});
