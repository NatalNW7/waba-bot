---
status: filled
generated: 2026-01-13
---

# Tooling & Productivity Guide

Collect the scripts, automation, and editor settings that keep contributors efficient.

## Required Tooling

- **pnpm**: Fast, disk-efficient package manager.
- **Node.js**: LTS version (18+).
- **Docker**: Used to run PostgreSQL and Redis for local development.
- **Prisma CLI**: For database introspection and migrations.
- **Turbo CLI**: For managing the monorepo build pipeline.

## Recommended Automation

- **Linting**: Run `pnpm lint` to check for style violations.
- **Database**: Run `pnpm --filter backend prisma studio` to browse data visually.
- **Scaffolding**: Use Nest CLI to keep directory structures consistent: `npx nest g mo <feature>`.

## IDE / Editor Setup

- **VS Code Extensions**:
    - Prisma (Syntax highlighting and formatting).
    - ESLint / Prettier.
    - Tailwind CSS IntelliSense.
- **Workspace Settings**: Ensure "Format on Save" is enabled for Prettier.

## Productivity Tips

Document terminal aliases, container workflows, or local emulators mirroring production. Link to shared scripts or dotfiles used across the team.
