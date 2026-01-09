---
trigger: always_on
---

# NestJS Architecture & Naming

- **Modular Design:** Every feature MUST be in its own module folder (e.g., `src/users/`).
- **Thin Controllers:** Controllers only handle routing, DTO validation, and responses.
- **Business Logic:** All logic and DB calls belong in Services.
- **Dependency Injection:** Use constructor injection ONLY. No `new Class()` for providers.
- **File Naming:** Use kebab-case:
  - `feature.module.ts`
  - `feature.controller.ts`
  - `feature.service.ts`
  - `dto/create-feature.dto.ts`
- **Interfaces:** Keep in `interfaces/` folder. Do not declare types inside logic files.
