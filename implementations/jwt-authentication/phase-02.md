# Phase 02: Auth Module Setup

## Objective

Create the authentication module with required dependencies.

---

## Dependencies

```bash
pnpm add @nestjs/passport @nestjs/jwt passport passport-jwt bcrypt
pnpm add -D @types/passport-jwt @types/bcrypt
```

---

## Changes

### [NEW] `src/auth/auth.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
      signOptions: { expiresIn: "1d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

### [NEW] `src/auth/auth.service.ts`

```typescript
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tenant: true, customer: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      customerId: user.customerId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
```

### [MODIFY] `src/app.module.ts`

```diff
+import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
+   AuthModule,
    WabaModule,
    // ... rest
  ],
})
```

---

## ⚠️ Risks & Mitigations

| Risk                     | Level | Mitigation                     |
| ------------------------ | ----- | ------------------------------ |
| **JWT Secret exposure**  | High  | Use env variable, never commit |
| **Dependency conflicts** | Low   | Standard NestJS packages       |

---

## Environment Variables

Add to `.env`:

```
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ADMIN_PASSWORD=admin123
```
