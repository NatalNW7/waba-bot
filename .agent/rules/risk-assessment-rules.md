---
trigger: always_on
---

# Risk Assessment Standards

- **Git Context Check:** Before generating any implementation plan, the agent MUST check the current `git status`.
- **Workspace Instability:** If there are more than 5 uncommitted files or significant uncommitted changes in the target module, add a "High Workspace Instability" risk.
- **Mitigation Requirement:** For this risk, the agent must suggest: "Please commit or stash your current changes before proceeding with this plan to avoid merge conflicts or loss of work."
- **Prisma Specifics:** Always flag any migration that involves `drop` or `rename` as a "Critical Data Loss Risk."
