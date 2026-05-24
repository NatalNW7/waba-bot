import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });
  const user = await prisma.user.findUnique({ where: { email: 'test.qa1@waba-bot.com' } });
  console.log('User before:', user);
  if (user) {
    await prisma.user.update({
      where: { email: 'test.qa1@waba-bot.com' },
      data: { emailVerified: true },
    });
    console.log('User emailVerified updated to true');
  }
}
run();
