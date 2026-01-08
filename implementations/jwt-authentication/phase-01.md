# Phase 01: Schema & User Model

## Objective
Create User model with role-based access and seed an admin user.

---

## Changes

### [NEW] Add `UserRole` enum to schema.prisma

```prisma
enum UserRole {
  ADMIN
  TENANT
  CUSTOMER
}
```

### [NEW] Add `User` model to schema.prisma

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // bcrypt hashed
  role      UserRole @default(TENANT)
  
  // Optional links to existing entities
  tenantId   String?  @unique @map("tenant_id")
  tenant     Tenant?  @relation(fields: [tenantId], references: [id])
  
  customerId String?  @unique @map("customer_id")
  customer   Customer? @relation(fields: [customerId], references: [id])
  
  isActive  Boolean  @default(true) @map("is_active")
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

### [MODIFY] Add relation to Tenant model

```prisma
model Tenant {
  // ... existing fields
  user User?  // One-to-one optional
}
```

### [MODIFY] Add relation to Customer model

```prisma
model Customer {
  // ... existing fields
  user User?  // One-to-one optional
}
```

---

## Admin Seed Script

### [NEW] `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'admin123',
    10
  );

  await prisma.user.upsert({
    where: { email: 'admin@waba-bot.com' },
    update: {},
    create: {
      email: 'admin@waba-bot.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin user seeded');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
```

---

## ⚠️ Risks & Mitigations

| Risk | Level | Mitigation |
|------|-------|------------|
| **Password storage** | High | Use bcrypt with cost factor 10+ |
| **Migration on existing data** | Medium | User model is new, no conflicts |
| **Relation loops** | Low | Use optional one-to-one relations |

---

## Migration & Seed Commands

```bash
# Create migration
pnpm run migrate:make add-user-model

# Run seed
pnpm prisma db seed
```

## package.json update

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```
