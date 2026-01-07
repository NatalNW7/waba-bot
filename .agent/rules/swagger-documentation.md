---
trigger: model_decision
description: When create or update a dto file or when create or update the schemas.prisma
---

# Swagger & Documentation Enforcement
- **CLI Plugin:** Leverage the NestJS Swagger plugin. Use JSDoc `/** */` for descriptions.
- **Descriptions:** Every DTO property and Controller method must have a human-readable description.
- **Examples:** Provide a realistic `example` for every DTO field.
- **Responses:** Explicitly document `@ApiOkResponse`, `@ApiCreatedResponse`, and error codes like `@ApiNotFoundResponse`.
- **Operations:** Use `@ApiOperation({ summary: '...' })` for all public endpoints.