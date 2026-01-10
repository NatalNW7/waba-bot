/**
 * Data fix script: Link orphaned users to their tenants
 * 
 * This fixes users who created tenants before the User-Tenant link was implemented.
 * It matches users to tenants by email address.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function fixOrphanedUsers() {
  try {
    console.log('Finding orphaned users (have no tenantId but a tenant exists with same email)...\n');

    // Find all users without a tenantId
    const usersWithoutTenant = await prisma.user.findMany({
      where: { tenantId: null },
      select: { id: true, email: true },
    });

    console.log(`Found ${usersWithoutTenant.length} users without tenantId`);

    let fixed = 0;

    for (const user of usersWithoutTenant) {
      // Find a tenant with the same email
      const tenant = await prisma.tenant.findUnique({
        where: { email: user.email },
        select: { id: true, name: true },
      });

      if (tenant) {
        // Link the user to the tenant
        await prisma.user.update({
          where: { id: user.id },
          data: { tenantId: tenant.id },
        });
        console.log(`✓ Linked user ${user.email} to tenant "${tenant.name}"`);
        fixed++;
      }
    }

    console.log(`\n✅ Fixed ${fixed} orphaned users.`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOrphanedUsers();
