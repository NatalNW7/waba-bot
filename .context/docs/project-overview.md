---
status: filled
generated: 2026-01-13
---

# Project Overview

Waba-bot is a multi-tenant SaaS platform designed for service-based businesses (e.g., barbershops, beauty salons) to manage their operations efficiently. It bridges the gap between traditional scheduling and modern communication by integrating WhatsApp Business API (WABA) for automated booking and Mercado Pago for seamless payment processing.

### Who benefits?
- **Tenants (Business Owners)**: Streamlined scheduling, automated reminders via WhatsApp, and subscription-based revenue management.
- **Customers**: Easy booking experience and flexible payment options (PIX, Credit Card) directly integrated with their favorite messaging app.

## Quick Facts

- Root path: `/home/gambal/gambs/waba-bot`
- Primary languages detected:
- .ts (299 files)
- .js (127 files)
- .map (123 files)
- .html (115 files)
- .md (52 files)

## Entry Points
- [`packages/api-types/src/index.ts`](packages/api-types/src/index.ts)
- [`apps/backend/src/main.ts`](apps/backend/src/main.ts)
- [`packages/api-types/src/interfaces/index.ts`](packages/api-types/src/interfaces/index.ts)
- [`apps/frontend/lib/auth/index.ts`](apps/frontend/lib/auth/index.ts)
- [`apps/backend/src/auth/index.ts`](apps/backend/src/auth/index.ts)
- [`apps/backend/src/auth/exceptions/index.ts`](apps/backend/src/auth/exceptions/index.ts)

## Key Exports
**Classes:**
- [`AppService`](apps/backend/src/app.service.ts#L4)
- [`AppModule`](apps/backend/src/app.module.ts#L50)
- [`AppController`](apps/backend/src/app.controller.ts#L7)
- [`ApiError`](apps/frontend/lib/api/config.ts#L24)
- [`WabaProcessor`](apps/backend/src/waba/waba.processor.ts#L6)
- [`WabaModule`](apps/backend/src/waba/waba.module.ts#L21)
- [`WabaController`](apps/backend/src/waba/waba.controller.ts#L8)
- [`TenantsService`](apps/backend/src/tenants/tenants.service.ts#L15)
- [`TenantsModule`](apps/backend/src/tenants/tenants.module.ts#L19)
- [`TenantsController`](apps/backend/src/tenants/tenants.controller.ts#L30)
- [`TenantSaasService`](apps/backend/src/tenants/tenant-saas.service.ts#L18)
- [`TenantRepository`](apps/backend/src/tenants/tenant-repository.service.ts#L6)
- [`TenantMpAuthService`](apps/backend/src/tenants/tenant-mp-auth.service.ts#L7)
- [`SubscriptionsService`](apps/backend/src/subscriptions/subscriptions.service.ts#L11)
- [`SubscriptionsModule`](apps/backend/src/subscriptions/subscriptions.module.ts#L20)
- [`SubscriptionsController`](apps/backend/src/subscriptions/subscriptions.controller.ts#L29)
- [`SubscriptionRepository`](apps/backend/src/subscriptions/subscription-repository.service.ts#L6)
- [`SubscriptionBillingService`](apps/backend/src/subscriptions/subscription-billing.service.ts#L4)
- [`CustomerSubscriptionService`](apps/backend/src/subscriptions/customer-subscription.service.ts#L6)
- [`ServicesService`](apps/backend/src/services/services.service.ts#L12)
- [`ServicesModule`](apps/backend/src/services/services.module.ts#L9)
- [`ServicesController`](apps/backend/src/services/services.controller.ts#L29)
- [`SaasPlansService`](apps/backend/src/saas-plans/saas-plans.service.ts#L8)
- [`SaasPlansModule`](apps/backend/src/saas-plans/saas-plans.module.ts#L9)
- [`SaasPlansController`](apps/backend/src/saas-plans/saas-plans.controller.ts#L29)
- [`PrismaService`](apps/backend/src/prisma/prisma.service.ts#L6)
- [`PrismaModule`](apps/backend/src/prisma/prisma.module.ts#L9)
- [`PlansService`](apps/backend/src/plans/plans.service.ts#L8)
- [`PlansModule`](apps/backend/src/plans/plans.module.ts#L11)
- [`PlansController`](apps/backend/src/plans/plans.controller.ts#L29)
- [`WebhooksController`](apps/backend/src/payments/webhooks.controller.ts#L20)
- [`PaymentsService`](apps/backend/src/payments/payments.service.ts#L10)
- [`PaymentsModule`](apps/backend/src/payments/payments.module.ts#L31)
- [`PaymentsController`](apps/backend/src/payments/payments.controller.ts#L27)
- [`PaymentRepository`](apps/backend/src/payments/payment-repository.service.ts#L6)
- [`PaymentPreferenceService`](apps/backend/src/payments/payment-preference.service.ts#L14)
- [`MercadoPagoService`](apps/backend/src/payments/mercadopago.service.ts#L10)
- [`MercadoPagoWebhooksService`](apps/backend/src/payments/mercadopago-webhooks.service.ts#L6)
- [`OperatingHoursService`](apps/backend/src/operating-hours/operating-hours.service.ts#L7)
- [`OperatingHoursModule`](apps/backend/src/operating-hours/operating-hours.module.ts#L11)
- [`OperatingHoursController`](apps/backend/src/operating-hours/operating-hours.controller.ts#L27)
- [`CustomersService`](apps/backend/src/customers/customers.service.ts#L12)
- [`CustomersModule`](apps/backend/src/customers/customers.module.ts#L9)
- [`CustomersController`](apps/backend/src/customers/customers.controller.ts#L29)
- [`CalendarsService`](apps/backend/src/calendars/calendars.service.ts#L7)
- [`CalendarsModule`](apps/backend/src/calendars/calendars.module.ts#L11)
- [`CalendarsController`](apps/backend/src/calendars/calendars.controller.ts#L27)
- [`TokenService`](apps/backend/src/auth/token.service.ts#L17)
- [`AuthService`](apps/backend/src/auth/auth.service.ts#L9)
- [`AuthModule`](apps/backend/src/auth/auth.module.ts#L24)
- [`AuthController`](apps/backend/src/auth/auth.controller.ts#L29)
- [`TenantCustomerService`](apps/backend/src/appointments/tenant-customer.service.ts#L5)
- [`SchedulingService`](apps/backend/src/appointments/scheduling.service.ts#L8)
- [`RelatedEntitiesValidator`](apps/backend/src/appointments/related-entities-validator.service.ts#L29)
- [`AppointmentsService`](apps/backend/src/appointments/appointments.service.ts#L17)
- [`AppointmentsModule`](apps/backend/src/appointments/appointments.module.ts#L25)
- [`AppointmentsController`](apps/backend/src/appointments/appointments.controller.ts#L27)
- [`AppointmentRepository`](apps/backend/src/appointments/appointment-repository.service.ts#L6)
- [`AppointmentPaymentValidator`](apps/backend/src/appointments/appointment-payment.service.ts#L5)
- [`AppointmentOperatingHoursValidator`](apps/backend/src/appointments/appointment-operating-hours.service.ts#L6)
- [`TenantEntity`](apps/backend/src/tenants/entities/tenant.entity.ts#L15)
- [`UpdateTenantDto`](apps/backend/src/tenants/dto/update-tenant.dto.ts#L4)
- [`FindTenantQueryDto`](apps/backend/src/tenants/dto/find-tenant-query.dto.ts#L6)
- [`CreateTenantDto`](apps/backend/src/tenants/dto/create-tenant.dto.ts#L14)
- [`SubscriptionEntity`](apps/backend/src/subscriptions/entities/subscription.entity.ts#L7)
- [`UpdateSubscriptionDto`](apps/backend/src/subscriptions/dto/update-subscription.dto.ts#L4)
- [`CreateSubscriptionDto`](apps/backend/src/subscriptions/dto/create-subscription.dto.ts#L13)
- [`ServiceEntity`](apps/backend/src/services/entities/service.entity.ts#L6)
- [`UpdateServiceDto`](apps/backend/src/services/dto/update-service.dto.ts#L4)
- [`CreateServiceDto`](apps/backend/src/services/dto/create-service.dto.ts#L6)
- [`SaasPlanEntity`](apps/backend/src/saas-plans/entities/saas-plan.entity.ts#L7)
- [`UpdateSaasPlanDto`](apps/backend/src/saas-plans/dto/update-saas-plan.dto.ts#L4)
- [`CreateSaasPlanDto`](apps/backend/src/saas-plans/dto/create-saas-plan.dto.ts#L13)
- [`PlanEntity`](apps/backend/src/plans/entities/plan.entity.ts#L7)
- [`UpdatePlanDto`](apps/backend/src/plans/dto/update-plan.dto.ts#L4)
- [`CreatePlanDto`](apps/backend/src/plans/dto/create-plan.dto.ts#L13)
- [`PaymentQueueProcessor`](apps/backend/src/payments/processors/payment-webhook.processor.ts#L16)
- [`PaymentEntity`](apps/backend/src/payments/entities/payment.entity.ts#L7)
- [`UpdatePaymentDto`](apps/backend/src/payments/dto/update-payment.dto.ts#L4)
- [`CreatePaymentDto`](apps/backend/src/payments/dto/create-payment.dto.ts#L13)
- [`OperatingHourEntity`](apps/backend/src/operating-hours/entities/operating-hour.entity.ts#L7)
- [`UpdateOperatingHourDto`](apps/backend/src/operating-hours/dto/update-operating-hour.dto.ts#L4)
- [`CreateOperatingHourDto`](apps/backend/src/operating-hours/dto/create-operating-hour.dto.ts#L13)
- [`CustomerEntity`](apps/backend/src/customers/entities/customer.entity.ts#L6)
- [`UpdateCustomerDto`](apps/backend/src/customers/dto/update-customer.dto.ts#L4)
- [`CreateCustomerDto`](apps/backend/src/customers/dto/create-customer.dto.ts#L6)
- [`CalendarEntity`](apps/backend/src/calendars/entities/calendar.entity.ts#L7)
- [`UpdateCalendarDto`](apps/backend/src/calendars/dto/update-calendar.dto.ts#L4)
- [`CreateCalendarDto`](apps/backend/src/calendars/dto/create-calendar.dto.ts#L14)
- [`JwtStrategy`](apps/backend/src/auth/strategies/jwt.strategy.ts#L11)
- [`GoogleStrategy`](apps/backend/src/auth/strategies/google.strategy.ts#L7)
- [`RolesGuard`](apps/backend/src/auth/guards/roles.guard.ts#L8)
- [`JwtAuthGuard`](apps/backend/src/auth/guards/jwt-auth.guard.ts#L9)
- [`TokenExpiredException`](apps/backend/src/auth/exceptions/token-expired.exception.ts#L7)
- [`InvalidTokenException`](apps/backend/src/auth/exceptions/invalid-token.exception.ts#L7)
- [`LoginDto`](apps/backend/src/auth/dto/login.dto.ts#L6)
- [`DateTimeUtils`](apps/backend/src/appointments/utils/date-time.utils.ts#L1)
- [`AppointmentEntity`](apps/backend/src/appointments/entities/appointment.entity.ts#L7)
- [`UpdateAppointmentDto`](apps/backend/src/appointments/dto/update-appointment.dto.ts#L4)
- [`CreateAppointmentDto`](apps/backend/src/appointments/dto/create-appointment.dto.ts#L14)

**Interfaces:**
- [`IUser`](packages/api-types/src/interfaces/user.ts#L6)
- [`ITenant`](packages/api-types/src/interfaces/tenant.ts#L6)
- [`ICreateTenant`](packages/api-types/src/interfaces/tenant.ts#L28)
- [`IUpdateTenant`](packages/api-types/src/interfaces/tenant.ts#L47)
- [`ISubscription`](packages/api-types/src/interfaces/subscription.ts#L6)
- [`ICreateSubscription`](packages/api-types/src/interfaces/subscription.ts#L22)
- [`IUpdateSubscription`](packages/api-types/src/interfaces/subscription.ts#L34)
- [`IService`](packages/api-types/src/interfaces/service.ts#L4)
- [`ICreateService`](packages/api-types/src/interfaces/service.ts#L15)
- [`IUpdateService`](packages/api-types/src/interfaces/service.ts#L25)
- [`ISaasPlan`](packages/api-types/src/interfaces/saas-plan.ts#L6)
- [`ICreateSaasPlan`](packages/api-types/src/interfaces/saas-plan.ts#L19)
- [`IUpdateSaasPlan`](packages/api-types/src/interfaces/saas-plan.ts#L29)
- [`IPlan`](packages/api-types/src/interfaces/plan.ts#L6)
- [`ICreatePlan`](packages/api-types/src/interfaces/plan.ts#L21)
- [`IUpdatePlan`](packages/api-types/src/interfaces/plan.ts#L33)
- [`IPayment`](packages/api-types/src/interfaces/payment.ts#L6)
- [`ICreatePayment`](packages/api-types/src/interfaces/payment.ts#L25)
- [`IUpdatePayment`](packages/api-types/src/interfaces/payment.ts#L41)
- [`IOperatingHour`](packages/api-types/src/interfaces/operating-hour.ts#L6)
- [`ICreateOperatingHour`](packages/api-types/src/interfaces/operating-hour.ts#L19)
- [`IUpdateOperatingHour`](packages/api-types/src/interfaces/operating-hour.ts#L31)
- [`ICustomer`](packages/api-types/src/interfaces/customer.ts#L4)
- [`ICreateCustomer`](packages/api-types/src/interfaces/customer.ts#L16)
- [`IUpdateCustomer`](packages/api-types/src/interfaces/customer.ts#L25)
- [`ICalendar`](packages/api-types/src/interfaces/calendar.ts#L6)
- [`ICreateCalendar`](packages/api-types/src/interfaces/calendar.ts#L21)
- [`IUpdateCalendar`](packages/api-types/src/interfaces/calendar.ts#L33)
- [`ILoginRequest`](packages/api-types/src/interfaces/auth.ts#L6)
- [`ILoginResponse`](packages/api-types/src/interfaces/auth.ts#L14)
- [`IUserSession`](packages/api-types/src/interfaces/auth.ts#L26)
- [`IOAuthLoginResponse`](packages/api-types/src/interfaces/auth.ts#L39)
- [`IAppointment`](packages/api-types/src/interfaces/appointment.ts#L6)
- [`ICreateAppointment`](packages/api-types/src/interfaces/appointment.ts#L26)
- [`IUpdateAppointment`](packages/api-types/src/interfaces/appointment.ts#L42)
- [`BrazilianDDD`](apps/frontend/lib/constants/brazilian-ddd.ts#L6)
- [`JwtPayload`](apps/frontend/lib/auth/token-utils.ts#L4)
- [`CreateTenantRequest`](apps/frontend/lib/api/tenant.ts#L5)
- [`CreateTenantResponse`](apps/frontend/lib/api/tenant.ts#L12)
- [`SubscribeResponse`](apps/frontend/lib/api/tenant.ts#L21)
- [`WebhookPayload`](apps/backend/src/waba/waba.interface.ts#L1)
- [`Entry`](apps/backend/src/waba/waba.interface.ts#L6)
- [`Change`](apps/backend/src/waba/waba.interface.ts#L11)
- [`Value`](apps/backend/src/waba/waba.interface.ts#L16)
- [`Metadata`](apps/backend/src/waba/waba.interface.ts#L23)
- [`Contact`](apps/backend/src/waba/waba.interface.ts#L28)
- [`Profile`](apps/backend/src/waba/waba.interface.ts#L33)
- [`Message`](apps/backend/src/waba/waba.interface.ts#L37)
- [`Text`](apps/backend/src/waba/waba.interface.ts#L45)
- [`JwtPayload`](apps/backend/src/auth/interfaces/jwt-payload.interface.ts#L1)
- [`AuthenticatedUser`](apps/backend/src/auth/interfaces/jwt-payload.interface.ts#L11)
- [`IAuthStrategy`](apps/frontend/lib/auth/strategies.tsx#L9)

## File Structure & Code Organization
- `anotacoes.md` — Shared notes and developer observations.
- `apps/` — Monorepo applications:
    - `/backend`: NestJS API handling business logic, WABA integration, and payments.
    - `/frontend`: Next.js application for the user interface.
- `coverage/` — Automated test coverage reports.
- `implementations/` — Specific implementation details or reference code.
- `package.json` — Root dependencies and scripts for the monorepo.
- `packages/` — Shared workspace packages:
    - `api-types`: Common TypeScript interfaces and enums used by both frontend and backend.
- `pnpm-lock.yaml` — Dependency lockfile for pnpm.
- `pnpm-workspace.yaml` — Defines the pnpm workspace members.
- `README.md` — High-level project documentation.
- `turbo.json` — Turborepo configuration for task orchestration (build, lint, test).

## Technology Stack Summary

The project leverages a robust TypeScript-end-to-end stack to ensure type safety and developer productivity across the monorepo.

### Core Framework Stack
- **Backend**: NestJS (Node.js framework) providing a modular architecture.
- **Frontend**: Next.js (React framework) for a performant and SEO-friendly UI.
- **Database**: PostgreSQL with Prisma ORM for type-safe database access.
- **Task Orchestration**: Turborepo for efficient building and testing.
- **Message Queue**: BullMQ (Redis-backed) for processing background jobs like WABA webhooks and payment processing.

### UI & Interaction Libraries
- **Styling**: Tailwind CSS for utility-first styling.
- **Components**: shadcn/ui (Radix UI primitives) for accessible, themed components.
- **Icons**: Lucide React.

### Development Tools Overview
- **Package Manager**: pnpm.
- **Linting & Formatting**: ESLint and Prettier.
- **Testing**: Jest for unit and integration tests.

## Getting Started Checklist

1. Install dependencies with `pnpm install`.
2. Set up environment variables in `apps/backend/.env` and `apps/frontend/.env.local`.
3. Run database migrations: `pnpm --filter backend prisma migrate dev`.
4. Start the development environment: `pnpm dev`.

## Next Steps

Capture product positioning, key stakeholders, and links to external documentation or product specs here.
