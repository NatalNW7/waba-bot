---
status: filled
generated: 2026-01-24
---

# Development Workflow

Outline the day-to-day engineering process for this repository.

## Branching & Releases
- **Branching Model**: Trunk-based development with feature branches.
- **Pull Requests**: Required for all changes to `main`.
- **Releases**: Managed via automated CI/CD pipelines.

## Local Development
- **Install dependencies**: `pnpm install`
- **Run all apps in devmode**: `pnpm dev`
- **Build all packages**: `pnpm build`
- **Database Migrations**: `pnpm --filter backend prisma migrate dev`
- **Run Unit Tests**: `pnpm test`
- **Run Linting**: `pnpm lint`

### Working with Turborepo
Since this is a monorepo, you can run commands for specific apps:
- `pnpm --filter backend dev`
- `pnpm --filter frontend dev`

## Code Review Expectations
- Ensure `pnpm lint` and `pnpm test` pass before submitting a PR.
- No direct instantiation of `PrismaClient` (use `PrismaService`).
- Business logic must reside in Services, not Controllers.
- Mock external APIs (WABA, Mercado Pago) in unit tests.

## Onboarding Tasks

Point newcomers to first issues or starter tickets. Link to internal runbooks or dashboards.
