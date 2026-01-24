---
status: filled
generated: 2026-01-24
---

# Testing Strategy

Document how quality is maintained across the codebase.

## Test Types
- **Unit Testing**: 
    - Framework: Jest.
    - Location: `.spec.ts` files reside next to the source file.
    - Rule: At least one "Happy Path" and one "Error Path" per method.
    - Mocking: Use `jest-mock-extended` for `PrismaService`.
- **E2E Testing**:
    - Location: Found in the `test/` folder of each application.
    - Environment: Uses a dedicated test database with cleanup between runs.

## Running Tests
- Execute all tests: `pnpm test`
- Watch mode: `pnpm --filter backend test:watch`
- Coverage: `pnpm --filter backend test:cov`

## Quality Gates
- **Linting**: No ESLint errors allowed in the `src/` directory (excluding `waba` if configured).
- **Code Style**: Mandatory Prettier formatting.
- **Coverage**: Aim for high coverage on core business logic in Services.

## Troubleshooting

Document flaky suites, long-running tests, or environment quirks.
