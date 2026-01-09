---
description: # Git Commit and Push (Conventional Commits): Stages changes, generates a Conventional Commit message, and pushes to the remote.
---

## Steps

1. **Pre-commit Check:** if there are changes into src/ or test/, then run the `/clean` workflow to ensure there are no linting or formatting errors before committing.
2. **Stage Changes:** Execute `git add .` to stage all current modifications.
3. **Analyze Diff:** Review the staged changes to identify the primary **Type** and **Scope**:
   - **feat:** A new feature (e.g., a new endpoint).
   - **fix:** A bug fix.
   - **docs:** Documentation only changes.
   - **style:** Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
   - **refactor:** A code change that neither fixes a bug nor adds a feature.
   - **chore:** Updating build tasks, package manager configs, etc.
   - **test:** Adding missing tests or correcting existing tests.
4. **Draft Message:** Compose the message in the format: `<type>(<scope>): <description>`.
   - _Example:_ `feat(api): add subscription endpoint`
   - _Example:_ `fix(prisma): resolve operating hours relation bug`
5. **Execute Commit:** Run `git commit -m "[Generated Message]"`.
6. **Push Changes:** Identify the current branch and run `git push origin [branch-name]`.
7. **Final Confirmation:** Confirm the successful push and provide the user with the commit hash.
