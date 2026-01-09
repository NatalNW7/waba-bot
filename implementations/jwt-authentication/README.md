# JWT Authentication

## Overview

Implement JWT-based authentication middleware with role-based access control (RBAC). Start with Admin/Root user, designed to be extensible for Tenant and Customer roles.

## Risk Assessment

### Workspace Stability: ✅ Low Risk

- **Status**: Clean working tree, no uncommitted changes
- **Impact**: No conflicts expected

### Breaking Changes: ⚠️ High Risk

- **Concern**: All existing endpoints will require authentication after implementation
- **Mitigation**: Use `@Public()` decorator for gradual migration, comprehensive testing

### Security: ⚠️ Medium Risk

- **Concern**: Improper JWT configuration could expose endpoints
- **Mitigation**: Follow NestJS security best practices, use environment variables

---

## Phase Checklist

| Phase                     | Description              | Risk Level |
| ------------------------- | ------------------------ | ---------- |
| [Phase 01](./phase-01.md) | Schema & User Model      | ⚠️ Medium  |
| [Phase 02](./phase-02.md) | Auth Module Setup        | ✅ Low     |
| [Phase 03](./phase-03.md) | JWT Strategy             | ⚠️ Medium  |
| [Phase 04](./phase-04.md) | Guards & Decorators      | ✅ Low     |
| [Phase 05](./phase-05.md) | Global Guard Application | ⚠️ High    |
| [Phase 06](./phase-06.md) | Role-Based Access        | ✅ Low     |
| [Phase 07](./phase-07.md) | Testing & Documentation  | ✅ Low     |

---

## Key Design Decisions

1. **User Model**: Separate from Tenant/Customer, linked via optional relations
2. **Role Enum**: `ADMIN`, `TENANT`, `CUSTOMER` - extensible
3. **Global Guard**: Applied at app level with `@Public()` decorator for exclusions
4. **Webhook Exclusion**: Use `@Public()` decorator on webhook controllers
5. **Token Payload**: Include `sub` (userId), `role`, optional `tenantId`/`customerId`

---

## Controllers to Protect (12)

| Controller               | Current Auth | Target Auth           |
| ------------------------ | ------------ | --------------------- |
| AppController            | None         | JWT (Admin)           |
| AppointmentsController   | None         | JWT (Tenant/Customer) |
| CalendarsController      | None         | JWT (Tenant)          |
| CustomersController      | None         | JWT (Tenant)          |
| OperatingHoursController | None         | JWT (Tenant)          |
| PaymentsController       | None         | JWT (Tenant)          |
| PlansController          | None         | JWT (Tenant)          |
| SaasPlansController      | None         | JWT (Admin)           |
| ServicesController       | None         | JWT (Tenant)          |
| SubscriptionsController  | None         | JWT (Tenant)          |
| TenantsController        | None         | JWT (Admin)           |
| WabaController           | None         | JWT (Tenant)          |

## Excluded from JWT

| Controller         | Auth Method                     |
| ------------------ | ------------------------------- |
| WebhooksController | Signature validation (existing) |
