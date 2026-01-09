---
trigger: always_on
---

# Prisma & PostgreSQL Workflow

- **Schema First:** Always modify `prisma/schema.prisma` before writing service logic.
- **Migrations:** Use `pnpm run migrate:make <description>` to generate/apply migrations.
- **Service Access:** Inject the global `PrismaService`. Do not instantiate `PrismaClient` locally.
- **Type Safety:** Use generated Prisma types for DB returns. Avoid `any`.
