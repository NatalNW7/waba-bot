---
trigger: model_decision
description: When refactoring the code
---

# Clean Code & NestJS Refactoring Standards

## 1. Method & Class Responsibility (SRP)

- **Single Responsibility:** Every service method must do exactly one thing. If a method exceeds 25 lines of code, it is a candidate for extraction into a private method or a sub-service.
- **Composition over Inheritance:** Avoid deep inheritance trees in Services or Controllers. Use Dependency Injection to compose functionality.

## 2. Naming Conventions

- **Meaningful Names:** Variable and method names must reveal intent. Avoid generic names like `data`, `handle`, or `process`.
- **Booleans:** Prefix boolean variables/methods with `is`, `has`, `can`, or `should` (e.g., `isValid`, `hasPermission`).

## 3. NestJS Architecture

- **Thin Controllers:** Controllers must contain zero business logic. They are strictly for routing, input validation (DTOs), and response orchestration.
- **Provider Injection:** Always use Constructor Injection. Avoid using the `module-ref` to manually fetch services unless absolutely necessary for circular dependencies.
- **DTO Usage:** Every POST, PUT, and PATCH endpoint must have a dedicated DTO. Do not pass raw Request objects to Services.

## 4. Logic & Error Handling

- **Fail Fast:** Use Guard Clauses to return early and reduce nesting depth (avoid "Arrow Code").
- **Custom Exceptions:** Prefer specific NestJS built-in exceptions (e.g., `ConflictException`) over generic `InternalServerErrorException`.
- **Immutability:** Whenever possible, treat data as immutable. Avoid modifying function arguments directly.

## 5. Prisma Best Practices

- **Type Safety:** Use Prisma-generated types for return values.
- **Efficiency:** Only `include` relations that are strictly necessary for the current operation. If a method only needs an ID, do not fetch the whole object.
