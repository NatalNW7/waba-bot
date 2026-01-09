# Phase 07: Testing & Documentation

## Objective

Add unit tests for auth module and configure Swagger for JWT authentication.

---

## Test Files

### [NEW] `src/auth/auth.service.spec.ts`

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("mock-jwt-token"),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe("login", () => {
    it("should return a JWT token for valid credentials", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-1",
        email: "admin@test.com",
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      });

      const result = await service.login("admin@test.com", "password123");

      expect(result.accessToken).toBe("mock-jwt-token");
      expect(result.user.email).toBe("admin@test.com");
    });

    it("should throw UnauthorizedException for invalid password", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-1",
        email: "admin@test.com",
        password: await bcrypt.hash("different", 10),
        isActive: true,
      });

      await expect(service.login("admin@test.com", "wrong")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException for inactive user", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user-1",
        email: "admin@test.com",
        password: await bcrypt.hash("password", 10),
        isActive: false,
      });

      await expect(service.login("admin@test.com", "password")).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
```

---

## Swagger Configuration

### [MODIFY] `src/main.ts`

```typescript
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("WABA Bot API")
    .setDescription("WhatsApp Business API Bot")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        in: "header",
      },
      "JWT",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(3000);
}
```

### Add `@ApiBearerAuth()` to protected controllers

```typescript
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Tenants')
@ApiBearerAuth('JWT')  // Add this
@Controller('tenants')
export class TenantsController { ... }
```

---

## ⚠️ Risks & Mitigations

| Risk                         | Level  | Mitigation                           |
| ---------------------------- | ------ | ------------------------------------ |
| **Test coverage gaps**       | Medium | Focus on auth service critical paths |
| **Swagger not showing auth** | Low    | Verify addBearerAuth configuration   |

---

## Verification Commands

```bash
# Run auth tests
pnpm test -- --testPathPattern="auth"

# Run all tests
pnpm test

# Run all tests e2e
pnpm test:e2e

# Check Swagger UI has auth button
# Visit http://localhost:3000/api
```
