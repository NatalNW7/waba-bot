---
description: # Git Commit and Push (Conventional Commits): Stages changes, generates a Conventional Commit message, and pushes to the remote.
---

## Steps

1. **Pre-commit Check:** if there are changes into apps/backend/src/ or apps/frontend/, then run the `/clean` workflow to ensure there are no formatting or linting errors before committing.
2. **Create a new branch from main:**
  - If the branch is merged, checkout to main, execute the pull and then create a new branch.
  - if you are in branch main, execute the pull and then create a new branch.
5. **Execute Commit:** Run `git commit -m "[Generated Message]"`.
6. **Push Changes:** Identify the current branch and run `git push [branch-name]`.
7. **Open PR:**
   - Check if a PR already exists; if it does, skip the PR creation step.