---
description: Format and Lint Codebase: Runs Prettier and ESLint to fix styling and catch potential logic errors.
---

## Steps
1. **Run Prettier:** Execute `pnpm run format` to fix indentation, quotes, and line lengths.
2. **Run ESLint:** Execute `pnpm run lint` to find and auto-fix code quality issues.
3. **Analyze Unfixed Errors:** If ESLint reports errors that `--fix` could not solve (e.g., unused variables or complex logic errors), list them for the user.
4. **Check Schema Formatting:** Run `pnpx prisma format` to ensure the `schema.prisma` file is also correctly indented and organized.
5. **Final Status:** Provide a summary of how many files were modified and if any manual intervention is required.