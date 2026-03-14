import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

const url = process.env.DATABASE_URL;

function parseDatabaseUrl(dbUrl: string) {
  try {
    // Robustly extract components from postgresql://user:password@host:port/database
    const regex = /^postgresql:\/\/([^:]+):(.+)@([^:/]+)(?::(\d+))?\/([^?]+)/;
    const match = dbUrl.match(regex);
    
    if (match) {
      return {
        user: decodeURIComponent(match[1]),
        password: decodeURIComponent(match[2]),
        host: match[3],
        port: match[4] ? parseInt(match[4], 10) : 5432,
        database: match[5],
      };
    }
  } catch (e) {
    console.warn('Manual parsing failed, falling back to connection string:', e);
  }
  return null;
}

async function testConnection() {
  if (!url) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Testing database connection...');
  console.log('URL:', url.replace(/:([^@]+)@/, ':****@')); // Hide password

  const dbConfig = parseDatabaseUrl(url);
  const clientOptions: any = dbConfig || { connectionString: url };
  
  if (url.includes('supabase.co') || url.includes('neon.tech')) {
    clientOptions.ssl = { rejectUnauthorized: false };
  }

  const client = new Client(clientOptions);

  try {
    await client.connect();
    console.log('✅ Successfully connected to the database!');
    
    const res = await client.query('SELECT NOW(), current_database(), current_user');
    console.log('Query result:', res.rows[0]);
    
  } catch (err) {
    console.error('❌ Connection failed!');
    console.error(err);
  } finally {
    await client.end();
  }
}

testConnection();
