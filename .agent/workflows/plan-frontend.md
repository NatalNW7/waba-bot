---
description: # Frontend Feature Implementation Planner: Specialized phased roadmap for Next.js/Frontend features with cross-package type safety.
---

## Steps

### Important: To conect with the backend you can use this env variables: ADMIN_EMAIL, ADMIN_PASSWORD and BACKEND_URL

1. **Contract Alignment (SSOT):** - Analyze `apps/backend/docs/api-reference/api-reference.md`.
   - **New Step:** Check `packages/shared-types` or the backend DTOs to ensure the frontend has access to the exact interfaces it needs. If missing, Phase 1 must include "Type Exporting."

2. **Context & Git Audit:**
   - Run `git status` and apply `risk-assessment-rules.md`.
   - Check for uncommitted changes in `apps/frontend` specifically.

3. **Phase Breakdown (Frontend Optimized):** - Divide into 4–10 logical phases. Suggested structure:
     - **Phase 1: Types & Mocks** (Define interfaces and mock API data).
     - **Phase 2: Component Architecture** (Atomic design/UI components).
     - **Phase 3: State & Data Fetching** (React Query, SWR, or Server Actions).
     - **Phase 4: Logic & Validation** (Forms, Auth guards, etc.).
     - **Phase 5: Styling & Responsive Design.**

4. **Frontend Risk Assessment:** - For each phase, identify specific risks:
     - **Bundle Size:** Will this new library bloat the JS bundle?
     - **Hydration:** Risks of SSR/CSR mismatch in Next.js.
     - **API Latency:** How does the UI behave while loading or on error?
     - **Z-Index/Layout:** Will this break mobile responsiveness?

5. **Directory & File Generation:**
   - Create `implementations/{{PLAN_NAME}}/`.
   - Generate `phase-XX.md` files with a mandatory "### Risks & Mitigations" section.

6. **UI/UX Review Template:**
   - Add placeholders to `review.md`:
     - "Accessibility (A11y) check completed?"
     - "Mobile responsiveness verified on all breakpoints?"
     - "Are there any 'Lighthouse' performance regressions?"
     - "Does the data fetching handle 401/403/500 errors gracefully?"

7. **Summary & Roadmap:** Generate the checklist and visual project roadmap.

8. **Execution Handover:** Ask to start Phase 1.