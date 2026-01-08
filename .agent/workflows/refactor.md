---
description: # NestJS & Clean Code Refactor: Analyzes recent changes or specific files to apply NestJS best practices and Clean Code principles.
---

## Steps
1. **Analyze Context:** - Examine the `git diff` or the specified files to understand recent changes.
   - Identify "Code Smells": Long methods, high coupling, logic in controllers, or duplicated code (DRY).
   - Check for NestJS violations: Missing DTOs, direct database access in controllers, or circular dependencies.

2. **Propose Refactoring Plan:** - Generate a list of proposed changes based on **SOLID** principles.
   - Specifically look for opportunities to:
     - Move business logic from Controllers to Services.
     - Implement **Single-Action Services** for complex logic.
     - Extract reusable logic into dedicated Utilities or Providers.
   - **Wait for user approval** of the plan before proceeding to code.

3. **Execute Refactor:**
   - Apply the approved changes file-by-file.
   - Ensure all new methods have clear, meaningful names (Clean Code).
   - Verify that Dependency Injection (DI) is used correctly and efficiently.

4. **Formatting & Quality Gate:**
   - Run the `/clean` workflow (Prettier & ESLint) to ensure the new code meets style guidelines.
   - Check for missing `@ApiProperty` or Swagger decorators to maintain documentation.

5. **Verification:**
   - Run `pnpm test` and `pnpm test:e2e` to ensure no regressions were introduced.
   - Summarize the improvements made (e.g., "Reduced cyclomatic complexity by 20%").