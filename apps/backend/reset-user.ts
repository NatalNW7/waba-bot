import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'test_user_7242226783732122866@testuser.com' },
  });

  if (user) {
    console.log('Current status:', user.onboardingStatus);
    console.log('Current tenant:', user.tenantId);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingStatus: 'PENDING',
        tenantId: null,
      },
    });

    if (user.tenantId) {
      await prisma.tenant.delete({
        where: { id: user.tenantId }
      }).catch(e => console.log('Tenant already deleted or error:', e.message));
    }

    console.log('Reset complete!');
  } else {
    console.log('Test user not found!');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
