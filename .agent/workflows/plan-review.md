---
description: # Post-Implementation Review: Conducts a post-implementation review to verify the feature against the initial plan and risks.
---

## Steps

1. **Load Plan Context:** - Read the plan and all tasks in `task.md`.
   - Identify the "Risks & Mitigations" that were predicted at the start.

2. **Code Verification:**
   - Scan the codebase to ensure all tasks listed in the phases were actually implemented.
   - Verify that the **Clean Code Standards** and **NestJS Best Practices** were maintained.

3. **Risk Audit:**
   - Compare the actual implementation results against the `review section`.
   - Identify if any predicted risks (e.g., migration issues, circular dependencies) occurred.
   - Document any _unforeseen_ issues that arose during development.

4. **Documentation & Tests Check:** (ONLI IF THERE ARE CHANGES IN DTO OR ENTITY FILES)
   - Confirm Swagger docs are updated and match the new code.
   - Ensure the new tests pass and provide adequate coverage.

5. **Finalize Review:**
   - Update the `review section` in the plan with the final findings.
   - Provide a "Project Success Score" and suggestions for future architectural improvements.