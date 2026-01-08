# Phase 06: Role-Based Access

## Objective
Apply role-based restrictions to controllers for Admin, Tenant, and Customer access levels.

---

## Role Hierarchy

| Role | Access Level |
|------|--------------|
| `ADMIN` | Full access to all endpoints |
| `TENANT` | Access to their own tenant's resources |
| `CUSTOMER` | Access to their own appointments/subscriptions |

---

## Changes

### [MODIFY] Controllers with @Roles decorator

#### `src/saas-plans/saas-plans.controller.ts` - Admin Only

```typescript
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('SaaS Plans')
@Controller('saas-plans')
@Roles(UserRole.ADMIN)  // Only admins can manage SaaS plans
export class SaasPlansController { ... }
```

#### `src/tenants/tenants.controller.ts` - Admin Only (for now)

```typescript
@ApiTags('Tenants')
@Controller('tenants')
@Roles(UserRole.ADMIN)  // Admins manage tenants, tenants access via /me endpoint later
export class TenantsController { ... }
```

#### Other controllers - Multiple roles

```typescript
// Most controllers: Tenant access (and Admin implicitly via hierarchy)
@Roles(UserRole.ADMIN, UserRole.TENANT)
```

---

## Usage Examples

### Current User in Service

```typescript
// In a controller
@Get('me')
getProfile(@CurrentUser() user: AuthenticatedUser) {
  return this.service.findByUserId(user.id);
}

// Access tenant-scoped resources
@Get()
findAll(@CurrentUser('tenantId') tenantId: string) {
  return this.service.findAllByTenant(tenantId);
}
```

### Future: Tenant-scoped access

```typescript
// Services can verify user owns the resource
if (user.role !== 'ADMIN' && resource.tenantId !== user.tenantId) {
  throw new ForbiddenException('Not authorized');
}
```

---

## ⚠️ Risks & Mitigations

| Risk | Level | Mitigation |
|------|-------|------------|
| **Over-restriction** | Medium | Start permissive, tighten gradually |
| **Resource ownership** | Medium | Validate tenantId in services |
| **Role creep** | Low | Document role requirements per endpoint |

---

## Role Assignment Plan

| Controller | Initial Role | Future Role |
|------------|--------------|-------------|
| SaasPlansController | ADMIN | ADMIN |
| TenantsController | ADMIN | ADMIN, TENANT (own data) |
| CustomersController | ADMIN, TENANT | ADMIN, TENANT, CUSTOMER |
| AppointmentsController | ADMIN, TENANT | All (with ownership check) |
| PaymentsController | ADMIN, TENANT | All (with ownership check) |
| ServicesController | ADMIN, TENANT | ADMIN, TENANT |
| PlansController | ADMIN, TENANT | ADMIN, TENANT |
| SubscriptionsController | ADMIN, TENANT | All (with ownership check) |
