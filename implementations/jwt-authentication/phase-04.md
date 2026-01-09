# Phase 04: Guards & Decorators

## Objective

Create reusable guards and decorators for authentication and authorization.

---

## Changes

### [NEW] `src/auth/guards/jwt-auth.guard.ts`

```typescript
import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

### [NEW] `src/auth/guards/roles.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required, allow access
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

### [NEW] `src/auth/decorators/public.decorator.ts`

```typescript
import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

### [NEW] `src/auth/decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from "@nestjs/common";
import { UserRole } from "@prisma/client";

export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

### [NEW] `src/auth/decorators/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthenticatedUser } from "../interfaces/jwt-payload.interface";

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    return data ? user?.[data] : user;
  },
);
```

### [NEW] `src/auth/index.ts` (Barrel export)

```typescript
export * from "./auth.module";
export * from "./auth.service";
export * from "./guards/jwt-auth.guard";
export * from "./guards/roles.guard";
export * from "./decorators/public.decorator";
export * from "./decorators/roles.decorator";
export * from "./decorators/current-user.decorator";
export * from "./interfaces/jwt-payload.interface";
```

---

## ⚠️ Risks & Mitigations

| Risk                   | Level  | Mitigation                              |
| ---------------------- | ------ | --------------------------------------- |
| **Guard order**        | Medium | JwtAuthGuard must run before RolesGuard |
| **Missing decorators** | Low    | Barrel export ensures discoverability   |
