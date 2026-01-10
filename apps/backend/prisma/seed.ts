import 'dotenv/config';
import { PrismaClient, PaymentInterval } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// Parse command line arguments
// Usage: pnpm prisma db seed -- --create saas-plans
const args = process.argv.slice(2);
const shouldCreateSaasPlans =
  args.includes('--create') &&
  args.includes('saas-plans');

/**
 * SaaS Plans seed data
 * Creates 3 tiers for each billing interval
 */
const saasPlansData = [
  // MONTHLY Plans
  {
    name: 'Starter',
    price: 49.0,
    description: 'Ideal para quem está começando. Até 100 agendamentos por mês.',
    interval: PaymentInterval.MONTHLY,
  },
  {
    name: 'Professional',
    price: 99.0,
    description: 'Para negócios em crescimento. Até 500 agendamentos por mês.',
    interval: PaymentInterval.MONTHLY,
  },
  {
    name: 'Enterprise',
    price: 199.0,
    description: 'Para grandes operações. Agendamentos ilimitados.',
    interval: PaymentInterval.MONTHLY,
  },
  // QUARTERLY Plans (15% discount)
  {
    name: 'Starter',
    price: 129.0,
    description: 'Ideal para quem está começando. Até 100 agendamentos por mês.',
    interval: PaymentInterval.QUARTERLY,
  },
  {
    name: 'Professional',
    price: 269.0,
    description: 'Para negócios em crescimento. Até 500 agendamentos por mês.',
    interval: PaymentInterval.QUARTERLY,
  },
  {
    name: 'Enterprise',
    price: 549.0,
    description: 'Para grandes operações. Agendamentos ilimitados.',
    interval: PaymentInterval.QUARTERLY,
  },
  // YEARLY Plans (20% discount)
  {
    name: 'Starter',
    price: 469.0,
    description: 'Ideal para quem está começando. Até 100 agendamentos por mês.',
    interval: PaymentInterval.YEARLY,
  },
  {
    name: 'Professional',
    price: 949.0,
    description: 'Para negócios em crescimento. Até 500 agendamentos por mês.',
    interval: PaymentInterval.YEARLY,
  },
  {
    name: 'Enterprise',
    price: 1899.0,
    description: 'Para grandes operações. Agendamentos ilimitados.',
    interval: PaymentInterval.YEARLY,
  },
];

async function seedSaasPlans() {
  console.log('🌱 Seeding SaaS plans...');

  for (const plan of saasPlansData) {
    await prisma.saasPlan.upsert({
      where: {
        // Use a composite unique identifier based on name + interval
        id: `${plan.name.toLowerCase()}-${plan.interval.toLowerCase()}`,
      },
      update: {
        price: plan.price,
        description: plan.description,
      },
      create: {
        id: `${plan.name.toLowerCase()}-${plan.interval.toLowerCase()}`,
        name: plan.name,
        price: plan.price,
        description: plan.description,
        interval: plan.interval,
      },
    });
  }

  console.log('✅ SaaS plans seeded (9 plans: 3 per interval)');
}

async function main() {
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD environment variable is required');
  }

  if (!process.env.ADMIN_EMAIL) {
    throw new Error('ADMIN_EMAIL environment variable is required');
  }

  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL,
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user seeded');

  // Optionally seed SaaS plans
  if (shouldCreateSaasPlans) {
    await seedSaasPlans();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
