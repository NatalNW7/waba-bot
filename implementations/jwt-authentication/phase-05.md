# Phase 05: Global Guard Application

## Objective

Apply JWT guard globally while excluding webhooks and login endpoints.

---

## Changes

### [MODIFY] `src/app.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { RolesGuard } from "./auth/guards/roles.guard";
import { AuthModule } from "./auth/auth.module";
// ... other imports

@Module({
  imports: [
    AuthModule,
    // ... other modules
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

### [MODIFY] `src/payments/webhooks.controller.ts`

Add `@Public()` decorator to exclude from JWT auth:

```typescript
import { Public } from "../auth/decorators/public.decorator";

@ApiTags("Webhooks")
@Controller("webhooks/mercadopago")
@Public() // <-- ADD THIS
export class WebhooksController {
  // ... existing code
}
```

### [MODIFY] `src/waba/waba.controller.ts`

If WABA webhooks exist, also add `@Public()`:

```typescript
import { Public } from '../auth/decorators/public.decorator';

// On any webhook handler methods:
@Public()
@Post('webhook')
async handleWebhook() { ... }
```

---

## Endpoints After Implementation

| Endpoint                         | Auth Required | Notes                       |
| -------------------------------- | ------------- | --------------------------- |
| `POST /auth/login`               | ❌ No         | Public (login)              |
| `POST /webhooks/mercadopago/:id` | ❌ No         | Signature validation only   |
| All other endpoints              | ✅ Yes        | JWT in Authorization header |

---

## ⚠️ Risks & Mitigations

| Risk                    | Level  | Mitigation                                        |
| ----------------------- | ------ | ------------------------------------------------- |
| **Broken endpoints**    | High   | Test all endpoints after applying global guard    |
| **Missing @Public**     | High   | Verify all webhook routes have decorator          |
| **Guard order matters** | Medium | JwtAuthGuard before RolesGuard in providers array |

---

## Testing the Change

```bash
# Without token - should fail
curl http://localhost:8081/tenants

# With token - should work
curl http://localhost:8081/tenants -H "Authorization: Bearer <token>"

# Webhook - should work without token
curl -X POST http://localhost:8081/webhooks/mercadopago/platform
```
