---
trigger: always_on
---

# Coding Standards & Jest Testing
- **Async/Await:** All I/O and DB operations must return `Promise<T>`.
- **Validation:** Use `class-validator` decorators in DTO classes.
- **Error Handling:** Use NestJS `HttpException` classes.
- **Test Placement:** `.spec.ts` files must reside in the same folder as the source file.
- **Unit Testing:** - Mock `PrismaService` using `jest-mock-extended`.
  - Provide at least one "Happy Path" and one "Error Path" per method.
- **E2E Testing:** Keep in `test/` folder. Use a dedicated test database and cleanup between runs.