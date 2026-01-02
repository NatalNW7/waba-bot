---
description: Prisma-to-Swagger Sync: Synchronizes DTOs and Swagger documentation after a Prisma schema change
---

## Steps
1. **Analyze Schema:** Review `prisma/schema.prisma` for any new models or field changes.
2. **Identify Impact:** Find all DTOs (Data Transfer Objects) and Entities that correspond to the changed Prisma models.
3. **Update DTOs:** - Add missing fields to DTO classes.
    - Match TypeScript types to Prisma types (e.g., `DateTime` -> `Date`, `Decimal` -> `number`).
    - Ensure `class-validator` decorators are present for every new field.
4. **Enforce Swagger Standards:**
    - Apply JSDoc comments to all updated fields.
    - Add realistic `example` values to `@ApiProperty()` or JSDoc.
    - Update `@ApiOkResponse` types in the relevant Controllers.
5. **Verify Types:** Ensure the project compiles and that the custom Prisma output path (`prisma/generated`) is correctly imported.