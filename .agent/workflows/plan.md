---
description: # Feature Implementation Planner (with Risk Assessment): Breaks down a complex feature into a phased roadmap with a dedicated risk assessment.
---

## Steps
1. **Context & Git Audit:** - Review the feature request.
   - Run `git status` and apply the `risk-assessment-rules.md`.
2. **Phase Breakdown:** Divide the implementation into 4–10 logical phases.
3. **Risk Assessment:** For each phase, identify specific technical risks (Data Integrity, Performance, Breaking Changes, Workspace Instability).
4. **Directory & File Generation:** - Create `implementations/{{PLAN_NAME}}/`.
   - Generate `phase-XX.md` files with a mandatory "### ⚠️ Risks & Mitigations" section.
5. **Post-Implementation Review Template:** - Create a file named `review.md` in the plan folder.
   - This file should contain placeholders for:
     - "Which predicted risks occurred?"
     - "Were any new risks discovered during coding?"
     - "Is the Swagger documentation fully synced?"
     - "Performance check results."
6. **Summary README:** Generate the checklist and overall project roadmap.
7. **Execution Handover:** Display the plan to the user and ask: "Would you like to start with Phase 1?"

## Post-Execution
- Once all phases are checked off, the agent must prompt the user to run the **Post-Implementation Review** to document lessons learned.