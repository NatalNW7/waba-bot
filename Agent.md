# Agent Context: NestJS + Prisma Project

## 🎯 Project Overview
This is a server-side application built with **NestJS**, using **Prisma ORM** and **PostgreSQL**. The goal is to maintain a highly modular, scalable, and type-safe codebase.

## 🏗️ Architectural Principles
* **Modular Architecture:** Every feature must be encapsulated in its own module (e.g., `users/`, `auth/`, `waba/`).
* **Controller-Service Pattern:** * **Controllers:** Handle HTTP routing, input validation (via DTOs), and response mapping. Keep them "thin."
    * **Services:** Contain all business logic and database interactions.
* **Dependency Injection:** Always use constructor injection. Avoid manual instantiation of classes.

## 📂 File Naming & Structure
Follow the NestJS kebab-case convention:
* Modules: `feature-name.module.ts`
* Controllers: `feature-name.controller.ts`
* Services: `feature-name.service.ts`
* DTOs: `dto/create-feature.dto.ts`
* Interfaces/Types: `interfaces/feature.interface.ts` (Keep these in separate files, do not declare types inside logic files).

## 🗄️ Database (Prisma & PostgreSQL)
* **Schema First:** All changes start in `prisma/schema.prisma`.
* **Migrations:** Use `pnpm migrate:make <description>` for local changes.
* **Prisma Service:** Always inject a global `PrismaService` into services for database access.
* **Validation:** Use `class-validator` and `class-transformer` in DTOs to ensure data integrity before it reaches the service.

## 🛠️ Coding Standards
1.  **Strict Typing:** Avoid `any` at all costs. Use Interfaces or Classes.
2.  **Async/Await:** All database and I/O operations must be asynchronous and return `Promise<T>`.
3.  **Error Handling:** Use built-in NestJS `HttpException` (e.g., `NotFoundException`, `BadRequestException`).
4.  **DTOs over Interfaces:** For incoming request payloads, use **Classes** with decorators so NestJS can perform runtime validation.

## 🤖 Agent Instructions (Specific for Antigravity)
* **When creating a new feature:** Always generate the Module first, then the Service, then the Controller.
* **When adding a field:** 1. Update `schema.prisma`.
    2. Suggest running `pnpm run migrate:make <description>`.
    3. Update the corresponding DTOs.
* **When writing Services:** Ensure the logic is unit-testable. Keep side effects (like sending webhooks or emails) isolated into their own methods or dedicated providers.

## 🧪 Testing Standards
NestJS uses **Jest** by default. Follow these rules to ensure the agent writes maintainable tests:

### 1. File Organization
* **Unit Tests:** Name them `<filename>.spec.ts` and keep them in the same directory as the file they test.
* **E2E Tests:** Name them `<name>.e2e-spec.ts` and keep them in the `test/` root folder.

### 2. Unit Testing (Services)
* **Isolation:** Always isolate the service. Use `Test.createTestingModule` to provide mocks for dependencies.
* **Prisma Mocking:** Do not use a real database for unit tests. Use `jest-mock-extended` or a manual mock for the `PrismaService`.
* **Focus:** Test business logic, edge cases, and error handling (e.g., "should throw NotFoundException if user doesn't exist").

### 3. Controller Testing
* Test that the controller calls the correct service method and returns the expected HTTP status code.
* Mock the Service entirely to avoid triggering database logic.

### 4. Integration & E2E Testing
* **Database:** Use a dedicated "Test Database" (or a Docker-based instance). 
* **Cleanup:** Ensure the database is cleared before or after each test suite.
* **Supertest:** Use `supertest` to make actual HTTP requests to the app instance and verify the full request-response lifecycle.

### 🤖 Agent Testing Instructions
* When generating a new service, always generate a corresponding `.spec.ts` file with at least one "happy path" and one "error path" test.
* If a feature involves a complex Prisma query, suggest an integration test over a unit test to verify the SQL logic.

## 🚀 Testing Commands
* `pnpm run test` - Run all unit tests.
* `pnpm run test:watch` - Run tests in watch mode.
* `pnpm run test:cov` - Generate test coverage report.
* `pnpm run test:e2e` - Run end-to-end tests.

## 🚀 Common Commands
* `pnpm run start:dev` - Start development server.
* `pnpm run migrate:make <description>` - Create/apply migrations.
* `pnpm run prisma studio` - Open DB GUI.
* `pnpm run nest g mo/s/co <name>` - Generate Nest components.