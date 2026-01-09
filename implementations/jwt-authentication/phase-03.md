# Phase 03: JWT Strategy

## Objective

Implement Passport JWT strategy for token validation and create the login endpoint.

---

## Changes

### [NEW] `src/auth/strategies/jwt.strategy.ts`

```typescript
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId?: string;
  customerId?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "your-secret-key",
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        customerId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("User not found or inactive");
    }

    return user;
  }
}
```

### [NEW] `src/auth/auth.controller.ts`

```typescript
import { Controller, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiOkResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Public } from "./decorators/public.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @ApiOperation({ summary: "User login" })
  @ApiOkResponse({ description: "Returns JWT token" })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
```

### [NEW] `src/auth/dto/login.dto.ts`

```typescript
import { IsEmail, IsString, IsNotEmpty } from "class-validator";

export class LoginDto {
  /**
   * User email
   * @example "admin@waba-bot.com"
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * User password
   * @example "admin123"
   */
  @IsString()
  @IsNotEmpty()
  password: string;
}
```

### [NEW] `src/auth/interfaces/jwt-payload.interface.ts`

```typescript
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId?: string;
  customerId?: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
  customerId?: string;
}
```

---

## ⚠️ Risks & Mitigations

| Risk                 | Level | Mitigation                   |
| -------------------- | ----- | ---------------------------- |
| **Token expiration** | Low   | 1 day default, configurable  |
| **Payload size**     | Low   | Only essential fields in JWT |
