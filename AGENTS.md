# AGENTS.md

## Dev environment tips
- Install dependencies with `pnpm install` before running scaffolds.
- Use `pnpm run dev` for the interactive TypeScript session that powers local experimentation.
- Run `pnpm run build` to refresh the CommonJS bundle in `dist/` before shipping changes.
- Store generated artefacts in `.context/` so reruns stay deterministic.

## Testing instructions
- Execute `pnpm run test` to run the Jest suite.
- Append `-- --watch` while iterating on a failing spec.
- Trigger `pnpm run build && pnpm run test` before opening a PR to mimic CI.
- Add or update tests alongside any generator or CLI changes.

## PR instructions
- Follow Conventional Commits (for example, `feat(scaffolding): add doc links`).
- Cross-link new scaffolds in `docs/README.md` and `agents/README.md` so future agents can find them.
- Attach sample CLI output or generated markdown when behaviour shifts.
- Confirm the built artefacts in `dist/` match the new source changes.

## Repository map
- `anotacoes.md/` — explain what lives here and when agents should edit it.
- `apps/` — explain what lives here and when agents should edit it.
- `coverage/` — explain what lives here and when agents should edit it.
- `implementations/` — explain what lives here and when agents should edit it.
- `package.json/` — explain what lives here and when agents should edit it.
- `packages/` — explain what lives here and when agents should edit it.
- `pnpm-lock.yaml/` — explain what lives here and when agents should edit it.
- `pnpm-workspace.yaml/` — explain what lives here and when agents should edit it.

## AI Context References
- Documentation index: `.context/docs/README.md`
- Agent playbooks: `.context/agents/README.md`
- Contributor guide: `CONTRIBUTING.md`
