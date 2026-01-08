import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD environment variable is required');
  }

  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD,
    10,
  );

  const admin = await prisma.user.upsert({
    where: { email: 'admin@waba-bot.com' },
    update: {},
    create: {
      email: 'admin@waba-bot.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user seeded:', admin.email);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

