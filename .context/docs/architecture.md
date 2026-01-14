---
status: filled
generated: 2026-01-13
---

# Architecture Notes

The waba-bot platform is built as a modular monolith using NestJS, organized into domain-driven feature modules. It follows a clean architecture approach, separating request handling, business logic, and data persistence.

## Codebase Analysis
- **Total Files Analyzed**: 204
- **Total Symbols**: 215
- **Classes**: 100
- **Interfaces**: 61
- **Functions**: 42
- **Types**: 3
- **Enums**: 9
- **Analysis Time**: 433ms

**Languages**:
- .ts: 176 files
- .tsx: 23 files
- .js: 1 files
- .mjs: 4 files

## System Architecture Overview

The system is organized as a monorepo containing a NestJS backend and a Next.js frontend. The backend acts as the central orchestrator for multi-tenant data, communication flows via WhatsApp, and financial transactions through Mercado Pago.

### Key Architectural Pillars
- **Multi-Tenancy**: Data is partitioned by `tenant_id` at the database level.
- **Asynchronous Processing**: External API interactions (WABA webhooks, Payment updates) are handled via message queues (BullMQ) to ensure system resilience.
- **Contract-First**: Shared interfaces in `packages/api-types` define the boundary between frontend and backend.

## Architectural Layers
### Controllers
Request handling and routing
- **Directories**: `packages/api-types/src`, `apps/backend/src`, `packages/api-types/src/interfaces`, `apps/frontend/lib/api`, `apps/backend/src/waba`, `apps/backend/src/tenants`, `apps/backend/src/subscriptions`, `apps/backend/src/saas-plans`, `apps/backend/src/plans`, `apps/backend/src/payments`, `apps/backend/src/operating-hours`, `apps/backend/src/customers`, `apps/backend/src/calendars`, `apps/backend/src/auth`, `apps/backend/src/appointments`
- **Symbols**: 68 total, 67 exported → depends on: Services, Utils, Models
- **Key exports**:
  - [`AppointmentStatus`](packages/api-types/src/enums.ts#L7) (enum)
  - [`CalendarProvider`](packages/api-types/src/enums.ts#L15) (enum)
  - [`SubscriptionStatus`](packages/api-types/src/enums.ts#L21) (enum)
  - [`PaymentInterval`](packages/api-types/src/enums.ts#L29) (enum)
  - [`DayOfWeek`](packages/api-types/src/enums.ts#L36) (enum)
  - [`PaymentStatus`](packages/api-types/src/enums.ts#L47) (enum)
  - [`PaymentType`](packages/api-types/src/enums.ts#L56) (enum)
  - [`PaymentMethod`](packages/api-types/src/enums.ts#L63) (enum)
  - [`UserRole`](packages/api-types/src/enums.ts#L69) (enum)
  - [`AppController`](apps/backend/src/app.controller.ts#L7) (class)
  - [`IUser`](packages/api-types/src/interfaces/user.ts#L6) (interface)
  - [`ITenant`](packages/api-types/src/interfaces/tenant.ts#L6) (interface)
  - [`ICreateTenant`](packages/api-types/src/interfaces/tenant.ts#L28) (interface)
  - [`IUpdateTenant`](packages/api-types/src/interfaces/tenant.ts#L47) (interface)
  - [`ISubscription`](packages/api-types/src/interfaces/subscription.ts#L6) (interface)
  - [`ICreateSubscription`](packages/api-types/src/interfaces/subscription.ts#L22) (interface)
  - [`IUpdateSubscription`](packages/api-types/src/interfaces/subscription.ts#L34) (interface)
  - [`ISaasPlan`](packages/api-types/src/interfaces/saas-plan.ts#L6) (interface)
  - [`ICreateSaasPlan`](packages/api-types/src/interfaces/saas-plan.ts#L19) (interface)
  - [`IUpdateSaasPlan`](packages/api-types/src/interfaces/saas-plan.ts#L29) (interface)
  - [`IPlan`](packages/api-types/src/interfaces/plan.ts#L6) (interface)
  - [`ICreatePlan`](packages/api-types/src/interfaces/plan.ts#L21) (interface)
  - [`IUpdatePlan`](packages/api-types/src/interfaces/plan.ts#L33) (interface)
  - [`IPayment`](packages/api-types/src/interfaces/payment.ts#L6) (interface)
  - [`ICreatePayment`](packages/api-types/src/interfaces/payment.ts#L25) (interface)
  - [`IUpdatePayment`](packages/api-types/src/interfaces/payment.ts#L41) (interface)
  - [`IOperatingHour`](packages/api-types/src/interfaces/operating-hour.ts#L6) (interface)
  - [`ICreateOperatingHour`](packages/api-types/src/interfaces/operating-hour.ts#L19) (interface)
  - [`IUpdateOperatingHour`](packages/api-types/src/interfaces/operating-hour.ts#L31) (interface)
  - [`ICustomer`](packages/api-types/src/interfaces/customer.ts#L4) (interface)
  - [`ICreateCustomer`](packages/api-types/src/interfaces/customer.ts#L16) (interface)
  - [`IUpdateCustomer`](packages/api-types/src/interfaces/customer.ts#L25) (interface)
  - [`ICalendar`](packages/api-types/src/interfaces/calendar.ts#L6) (interface)
  - [`ICreateCalendar`](packages/api-types/src/interfaces/calendar.ts#L21) (interface)
  - [`IUpdateCalendar`](packages/api-types/src/interfaces/calendar.ts#L33) (interface)
  - [`ILoginRequest`](packages/api-types/src/interfaces/auth.ts#L6) (interface)
  - [`ILoginResponse`](packages/api-types/src/interfaces/auth.ts#L14) (interface)
  - [`IUserSession`](packages/api-types/src/interfaces/auth.ts#L26) (interface)
  - [`IOAuthLoginResponse`](packages/api-types/src/interfaces/auth.ts#L39) (interface)
  - [`IAppointment`](packages/api-types/src/interfaces/appointment.ts#L6) (interface)
  - [`ICreateAppointment`](packages/api-types/src/interfaces/appointment.ts#L26) (interface)
  - [`IUpdateAppointment`](packages/api-types/src/interfaces/appointment.ts#L42) (interface)
  - [`CreateTenantRequest`](apps/frontend/lib/api/tenant.ts#L5) (interface)
  - [`CreateTenantResponse`](apps/frontend/lib/api/tenant.ts#L12) (interface)
  - [`SubscribeResponse`](apps/frontend/lib/api/tenant.ts#L21) (interface)
  - [`createTenant`](apps/frontend/lib/api/tenant.ts#L29) (function)
  - [`createSubscription`](apps/frontend/lib/api/tenant.ts#L56) (function)
  - [`getSaasPlans`](apps/frontend/lib/api/saas-plans.ts#L12) (function)
  - [`groupPlansByInterval`](apps/frontend/lib/api/saas-plans.ts#L27) (function)
  - [`formatPrice`](apps/frontend/lib/api/saas-plans.ts#L55) (function)
  - [`getIntervalLabel`](apps/frontend/lib/api/saas-plans.ts#L70) (function)
  - [`getPeriodText`](apps/frontend/lib/api/saas-plans.ts#L84) (function)
  - [`ApiError`](apps/frontend/lib/api/config.ts#L24) (class)
  - [`apiFetch`](apps/frontend/lib/api/config.ts#L80) (function)
  - [`WabaController`](apps/backend/src/waba/waba.controller.ts#L8) (class)
  - [`WabaAPI`](apps/backend/src/waba/waba.api.ts#L3) (function)
  - [`TenantsController`](apps/backend/src/tenants/tenants.controller.ts#L30) (class)
  - [`SubscriptionsController`](apps/backend/src/subscriptions/subscriptions.controller.ts#L29) (class)
  - [`SaasPlansController`](apps/backend/src/saas-plans/saas-plans.controller.ts#L29) (class)
  - [`PlansController`](apps/backend/src/plans/plans.controller.ts#L29) (class)
  - [`WebhooksController`](apps/backend/src/payments/webhooks.controller.ts#L20) (class)
  - [`PaymentsController`](apps/backend/src/payments/payments.controller.ts#L27) (class)
  - [`OperatingHoursController`](apps/backend/src/operating-hours/operating-hours.controller.ts#L27) (class)
  - [`CustomersController`](apps/backend/src/customers/customers.controller.ts#L29) (class)
  - [`CalendarsController`](apps/backend/src/calendars/calendars.controller.ts#L27) (class)
  - [`AuthController`](apps/backend/src/auth/auth.controller.ts#L29) (class)
  - [`AppointmentsController`](apps/backend/src/appointments/appointments.controller.ts#L27) (class)

### Utils
Shared utilities and helpers
- **Directories**: `apps/frontend/lib`, `apps/backend/test`, `apps/frontend/lib/utils`, `apps/frontend/lib/constants`, `apps/frontend/lib/auth`, `apps/backend/src/common/utils`, `apps/backend/src/appointments/utils`
- **Symbols**: 23 total, 22 exported
- **Key exports**:
  - [`cn`](apps/frontend/lib/utils.ts#L4) (function)
  - [`getAuthToken`](apps/backend/test/auth-helper.ts#L8) (function)
  - [`authRequest`](apps/backend/test/auth-helper.ts#L24) (function)
  - [`sanitizePhone`](apps/frontend/lib/utils/phone-utils.ts#L10) (function)
  - [`formatPhoneDisplay`](apps/frontend/lib/utils/phone-utils.ts#L25) (function)
  - [`isValidBrazilianPhone`](apps/frontend/lib/utils/phone-utils.ts#L50) (function)
  - [`BrazilianDDD`](apps/frontend/lib/constants/brazilian-ddd.ts#L6) (interface)
  - [`getDDDByCode`](apps/frontend/lib/constants/brazilian-ddd.ts#L139) (function)
  - [`searchDDDs`](apps/frontend/lib/constants/brazilian-ddd.ts#L146) (function)
  - [`JwtPayload`](apps/frontend/lib/auth/token-utils.ts#L4) (interface)
  - [`TokenErrorCode`](apps/frontend/lib/auth/token-utils.ts#L17) (type)
  - [`parseJwt`](apps/frontend/lib/auth/token-utils.ts#L25) (function)
  - [`isTokenExpired`](apps/frontend/lib/auth/token-utils.ts#L42) (function)
  - [`getTokenExpirationDate`](apps/frontend/lib/auth/token-utils.ts#L53) (function)
  - [`getTokenRemainingTime`](apps/frontend/lib/auth/token-utils.ts#L64) (function)
  - [`getTokenErrorCode`](apps/frontend/lib/auth/token-utils.ts#L75) (function)
  - [`SpecialMappings`](apps/backend/src/common/utils/prisma-include.util.ts#L1) (type)
  - [`parseInclude`](apps/backend/src/common/utils/prisma-include.util.ts#L11) (function)
  - [`DateTimeUtils`](apps/backend/src/appointments/utils/date-time.utils.ts#L1) (class)
  - [`IAuthStrategy`](apps/frontend/lib/auth/strategies.tsx#L9) (interface)
  - [`AuthProvider`](apps/frontend/lib/auth/context.tsx#L37) (function)
  - [`getAuthToken`](apps/frontend/lib/auth/context.tsx#L198) (function)

### Services
Business logic and orchestration
- **Directories**: `apps/backend/test`, `apps/backend/src`, `packages/api-types/src/interfaces`, `apps/backend/src/tenants`, `apps/backend/src/subscriptions`, `apps/backend/src/services`, `apps/backend/src/saas-plans`, `apps/backend/src/prisma`, `apps/backend/src/plans`, `apps/backend/src/payments`, `apps/backend/src/operating-hours`, `apps/backend/src/customers`, `apps/backend/src/calendars`, `apps/backend/src/auth`, `apps/backend/src/appointments`, `apps/backend/src/services/entities`, `apps/backend/src/services/dto`
- **Symbols**: 42 total, 38 exported
- **Key exports**:
  - [`AppService`](apps/backend/src/app.service.ts#L4) (class)
  - [`IService`](packages/api-types/src/interfaces/service.ts#L4) (interface)
  - [`ICreateService`](packages/api-types/src/interfaces/service.ts#L15) (interface)
  - [`IUpdateService`](packages/api-types/src/interfaces/service.ts#L25) (interface)
  - [`TenantsService`](apps/backend/src/tenants/tenants.service.ts#L15) (class)
  - [`TenantSaasService`](apps/backend/src/tenants/tenant-saas.service.ts#L18) (class)
  - [`TenantRepository`](apps/backend/src/tenants/tenant-repository.service.ts#L6) (class)
  - [`TenantMpAuthService`](apps/backend/src/tenants/tenant-mp-auth.service.ts#L7) (class)
  - [`SubscriptionsService`](apps/backend/src/subscriptions/subscriptions.service.ts#L11) (class)
  - [`SubscriptionRepository`](apps/backend/src/subscriptions/subscription-repository.service.ts#L6) (class)
  - [`SubscriptionBillingService`](apps/backend/src/subscriptions/subscription-billing.service.ts#L4) (class)
  - [`CustomerSubscriptionService`](apps/backend/src/subscriptions/customer-subscription.service.ts#L6) (class)
  - [`ServicesService`](apps/backend/src/services/services.service.ts#L12) (class)
  - [`ServicesModule`](apps/backend/src/services/services.module.ts#L9) (class)
  - [`ServicesController`](apps/backend/src/services/services.controller.ts#L29) (class)
  - [`SaasPlansService`](apps/backend/src/saas-plans/saas-plans.service.ts#L8) (class)
  - [`PrismaService`](apps/backend/src/prisma/prisma.service.ts#L6) (class)
  - [`PlansService`](apps/backend/src/plans/plans.service.ts#L8) (class)
  - [`PaymentsService`](apps/backend/src/payments/payments.service.ts#L10) (class)
  - [`PaymentRepository`](apps/backend/src/payments/payment-repository.service.ts#L6) (class)
  - [`PaymentPreferenceService`](apps/backend/src/payments/payment-preference.service.ts#L14) (class)
  - [`MercadoPagoService`](apps/backend/src/payments/mercadopago.service.ts#L10) (class)
  - [`MercadoPagoWebhooksService`](apps/backend/src/payments/mercadopago-webhooks.service.ts#L6) (class)
  - [`OperatingHoursService`](apps/backend/src/operating-hours/operating-hours.service.ts#L7) (class)
  - [`CustomersService`](apps/backend/src/customers/customers.service.ts#L12) (class)
  - [`CalendarsService`](apps/backend/src/calendars/calendars.service.ts#L7) (class)
  - [`TokenService`](apps/backend/src/auth/token.service.ts#L17) (class)
  - [`AuthService`](apps/backend/src/auth/auth.service.ts#L9) (class)
  - [`TenantCustomerService`](apps/backend/src/appointments/tenant-customer.service.ts#L5) (class)
  - [`SchedulingService`](apps/backend/src/appointments/scheduling.service.ts#L8) (class)
  - [`RelatedEntitiesValidator`](apps/backend/src/appointments/related-entities-validator.service.ts#L29) (class)
  - [`AppointmentsService`](apps/backend/src/appointments/appointments.service.ts#L17) (class)
  - [`AppointmentRepository`](apps/backend/src/appointments/appointment-repository.service.ts#L6) (class)
  - [`AppointmentPaymentValidator`](apps/backend/src/appointments/appointment-payment.service.ts#L5) (class)
  - [`AppointmentOperatingHoursValidator`](apps/backend/src/appointments/appointment-operating-hours.service.ts#L6) (class)
  - [`ServiceEntity`](apps/backend/src/services/entities/service.entity.ts#L6) (class)
  - [`UpdateServiceDto`](apps/backend/src/services/dto/update-service.dto.ts#L4) (class)
  - [`CreateServiceDto`](apps/backend/src/services/dto/create-service.dto.ts#L6) (class)

### Models
Data structures and domain objects
- **Directories**: `apps/backend/src/tenants/entities`, `apps/backend/src/subscriptions/entities`, `apps/backend/src/saas-plans/entities`, `apps/backend/src/plans/entities`, `apps/backend/src/payments/entities`, `apps/backend/src/operating-hours/entities`, `apps/backend/src/customers/entities`, `apps/backend/src/calendars/entities`, `apps/backend/src/appointments/entities`
- **Symbols**: 9 total, 9 exported → depends on: Services
- **Key exports**:
  - [`TenantEntity`](apps/backend/src/tenants/entities/tenant.entity.ts#L15) (class)
  - [`SubscriptionEntity`](apps/backend/src/subscriptions/entities/subscription.entity.ts#L7) (class)
  - [`SaasPlanEntity`](apps/backend/src/saas-plans/entities/saas-plan.entity.ts#L7) (class)
  - [`PlanEntity`](apps/backend/src/plans/entities/plan.entity.ts#L7) (class)
  - [`PaymentEntity`](apps/backend/src/payments/entities/payment.entity.ts#L7) (class)
  - [`OperatingHourEntity`](apps/backend/src/operating-hours/entities/operating-hour.entity.ts#L7) (class)
  - [`CustomerEntity`](apps/backend/src/customers/entities/customer.entity.ts#L6) (class)
  - [`CalendarEntity`](apps/backend/src/calendars/entities/calendar.entity.ts#L7) (class)
  - [`AppointmentEntity`](apps/backend/src/appointments/entities/appointment.entity.ts#L7) (class)

### Components
UI components and views
- **Directories**: `apps/frontend/components`, `apps/frontend/app`, `apps/frontend/components/ui`, `apps/frontend/app/termos-de-servico`, `apps/frontend/app/profile`, `apps/frontend/app/politica-de-privacidade`, `apps/frontend/app/onboarding`, `apps/frontend/app/login`, `apps/frontend/app/auth/callback`
- **Symbols**: 13 total, 7 exported
- **Key exports**:
  - [`WhatIsCliqtree`](apps/frontend/components/what-is-cliqtree.tsx#L3) (function)
  - [`ThemeProvider`](apps/frontend/components/theme-provider.tsx#L9) (function)
  - [`HeroSection`](apps/frontend/components/hero-section.tsx#L4) (function)
  - [`Header`](apps/frontend/components/header.tsx#L5) (function)
  - [`BenefitsSection`](apps/frontend/components/benefits-section.tsx#L39) (function)
  - [`Home`](apps/frontend/app/page.tsx#L10) (function)
  - [`TermsOfServicePage`](apps/frontend/app/termos-de-servico/page.tsx#L10) (function)


## Detected Design Patterns
| Pattern | Confidence | Locations | Description |
|---------|------------|-----------|-------------|
| Repository | 90% | `TenantRepository` ([tenant-repository.service.ts](apps/backend/src/tenants/tenant-repository.service.ts)), `SubscriptionRepository` ([subscription-repository.service.ts](apps/backend/src/subscriptions/subscription-repository.service.ts)), `PaymentRepository` ([payment-repository.service.ts](apps/backend/src/payments/payment-repository.service.ts)), `AppointmentRepository` ([appointment-repository.service.ts](apps/backend/src/appointments/appointment-repository.service.ts)) | Abstracts data access logic |
| Service Layer | 85% | `AppService` ([app.service.ts](apps/backend/src/app.service.ts)), `TenantsService` ([tenants.service.ts](apps/backend/src/tenants/tenants.service.ts)), `TenantSaasService` ([tenant-saas.service.ts](apps/backend/src/tenants/tenant-saas.service.ts)), `TenantMpAuthService` ([tenant-mp-auth.service.ts](apps/backend/src/tenants/tenant-mp-auth.service.ts)), `SubscriptionsService` ([subscriptions.service.ts](apps/backend/src/subscriptions/subscriptions.service.ts)), `SubscriptionBillingService` ([subscription-billing.service.ts](apps/backend/src/subscriptions/subscription-billing.service.ts)), `CustomerSubscriptionService` ([customer-subscription.service.ts](apps/backend/src/subscriptions/customer-subscription.service.ts)), `ServicesService` ([services.service.ts](apps/backend/src/services/services.service.ts)), `SaasPlansService` ([saas-plans.service.ts](apps/backend/src/saas-plans/saas-plans.service.ts)), `PrismaService` ([prisma.service.ts](apps/backend/src/prisma/prisma.service.ts)), `PlansService` ([plans.service.ts](apps/backend/src/plans/plans.service.ts)), `PaymentsService` ([payments.service.ts](apps/backend/src/payments/payments.service.ts)), `PaymentPreferenceService` ([payment-preference.service.ts](apps/backend/src/payments/payment-preference.service.ts)), `MercadoPagoService` ([mercadopago.service.ts](apps/backend/src/payments/mercadopago.service.ts)), `MercadoPagoWebhooksService` ([mercadopago-webhooks.service.ts](apps/backend/src/payments/mercadopago-webhooks.service.ts)), `OperatingHoursService` ([operating-hours.service.ts](apps/backend/src/operating-hours/operating-hours.service.ts)), `CustomersService` ([customers.service.ts](apps/backend/src/customers/customers.service.ts)), `CalendarsService` ([calendars.service.ts](apps/backend/src/calendars/calendars.service.ts)), `TokenService` ([token.service.ts](apps/backend/src/auth/token.service.ts)), `AuthService` ([auth.service.ts](apps/backend/src/auth/auth.service.ts)), `TenantCustomerService` ([tenant-customer.service.ts](apps/backend/src/appointments/tenant-customer.service.ts)), `SchedulingService` ([scheduling.service.ts](apps/backend/src/appointments/scheduling.service.ts)), `AppointmentsService` ([appointments.service.ts](apps/backend/src/appointments/appointments.service.ts)) | Encapsulates business logic in service classes |
| Controller | 90% | `AppController` ([app.controller.ts](apps/backend/src/app.controller.ts)), `WabaController` ([waba.controller.ts](apps/backend/src/waba/waba.controller.ts)), `TenantsController` ([tenants.controller.ts](apps/backend/src/tenants/tenants.controller.ts)), `SubscriptionsController` ([subscriptions.controller.ts](apps/backend/src/subscriptions/subscriptions.controller.ts)), `ServicesController` ([services.controller.ts](apps/backend/src/services/services.controller.ts)), `SaasPlansController` ([saas-plans.controller.ts](apps/backend/src/saas-plans/saas-plans.controller.ts)), `PlansController` ([plans.controller.ts](apps/backend/src/plans/plans.controller.ts)), `WebhooksController` ([webhooks.controller.ts](apps/backend/src/payments/webhooks.controller.ts)), `PaymentsController` ([payments.controller.ts](apps/backend/src/payments/payments.controller.ts)), `OperatingHoursController` ([operating-hours.controller.ts](apps/backend/src/operating-hours/operating-hours.controller.ts)), `CustomersController` ([customers.controller.ts](apps/backend/src/customers/customers.controller.ts)), `CalendarsController` ([calendars.controller.ts](apps/backend/src/calendars/calendars.controller.ts)), `AuthController` ([auth.controller.ts](apps/backend/src/auth/auth.controller.ts)), `AppointmentsController` ([appointments.controller.ts](apps/backend/src/appointments/appointments.controller.ts)) | Handles incoming requests and returns responses |

## Entry Points
- [`packages/api-types/src/index.ts`](packages/api-types/src/index.ts)
- [`apps/backend/src/main.ts`](apps/backend/src/main.ts)
- [`packages/api-types/src/interfaces/index.ts`](packages/api-types/src/interfaces/index.ts)
- [`apps/frontend/lib/auth/index.ts`](apps/frontend/lib/auth/index.ts)
- [`apps/backend/src/auth/index.ts`](apps/backend/src/auth/index.ts)
- [`apps/backend/src/auth/exceptions/index.ts`](apps/backend/src/auth/exceptions/index.ts)

## Public API
| Symbol | Type | Location |
| --- | --- | --- |
| [`ApiError`](apps/frontend/lib/api/config.ts#L24) | class | apps/frontend/lib/api/config.ts:24 |
| [`apiFetch`](apps/frontend/lib/api/config.ts#L80) | function | apps/frontend/lib/api/config.ts:80 |
| [`AppController`](apps/backend/src/app.controller.ts#L7) | class | apps/backend/src/app.controller.ts:7 |
| [`AppModule`](apps/backend/src/app.module.ts#L50) | class | apps/backend/src/app.module.ts:50 |
| [`AppointmentEntity`](apps/backend/src/appointments/entities/appointment.entity.ts#L7) | class | apps/backend/src/appointments/entities/appointment.entity.ts:7 |
| [`AppointmentOperatingHoursValidator`](apps/backend/src/appointments/appointment-operating-hours.service.ts#L6) | class | apps/backend/src/appointments/appointment-operating-hours.service.ts:6 |
| [`AppointmentPaymentValidator`](apps/backend/src/appointments/appointment-payment.service.ts#L5) | class | apps/backend/src/appointments/appointment-payment.service.ts:5 |
| [`AppointmentRepository`](apps/backend/src/appointments/appointment-repository.service.ts#L6) | class | apps/backend/src/appointments/appointment-repository.service.ts:6 |
| [`AppointmentsController`](apps/backend/src/appointments/appointments.controller.ts#L27) | class | apps/backend/src/appointments/appointments.controller.ts:27 |
| [`AppointmentsModule`](apps/backend/src/appointments/appointments.module.ts#L25) | class | apps/backend/src/appointments/appointments.module.ts:25 |
| [`AppointmentsService`](apps/backend/src/appointments/appointments.service.ts#L17) | class | apps/backend/src/appointments/appointments.service.ts:17 |
| [`AppService`](apps/backend/src/app.service.ts#L4) | class | apps/backend/src/app.service.ts:4 |
| [`AuthController`](apps/backend/src/auth/auth.controller.ts#L29) | class | apps/backend/src/auth/auth.controller.ts:29 |
| [`AuthenticatedUser`](apps/backend/src/auth/interfaces/jwt-payload.interface.ts#L11) | interface | apps/backend/src/auth/interfaces/jwt-payload.interface.ts:11 |
| [`AuthModule`](apps/backend/src/auth/auth.module.ts#L24) | class | apps/backend/src/auth/auth.module.ts:24 |
| [`AuthProvider`](apps/frontend/lib/auth/context.tsx#L37) | function | apps/frontend/lib/auth/context.tsx:37 |
| [`authRequest`](apps/backend/test/auth-helper.ts#L24) | function | apps/backend/test/auth-helper.ts:24 |
| [`AuthService`](apps/backend/src/auth/auth.service.ts#L9) | class | apps/backend/src/auth/auth.service.ts:9 |
| [`BenefitsSection`](apps/frontend/components/benefits-section.tsx#L39) | function | apps/frontend/components/benefits-section.tsx:39 |
| [`BrazilianDDD`](apps/frontend/lib/constants/brazilian-ddd.ts#L6) | interface | apps/frontend/lib/constants/brazilian-ddd.ts:6 |
| [`CalendarEntity`](apps/backend/src/calendars/entities/calendar.entity.ts#L7) | class | apps/backend/src/calendars/entities/calendar.entity.ts:7 |
| [`CalendarsController`](apps/backend/src/calendars/calendars.controller.ts#L27) | class | apps/backend/src/calendars/calendars.controller.ts:27 |
| [`CalendarsModule`](apps/backend/src/calendars/calendars.module.ts#L11) | class | apps/backend/src/calendars/calendars.module.ts:11 |
| [`CalendarsService`](apps/backend/src/calendars/calendars.service.ts#L7) | class | apps/backend/src/calendars/calendars.service.ts:7 |
| [`Change`](apps/backend/src/waba/waba.interface.ts#L11) | interface | apps/backend/src/waba/waba.interface.ts:11 |
| [`cn`](apps/frontend/lib/utils.ts#L4) | function | apps/frontend/lib/utils.ts:4 |
| [`Contact`](apps/backend/src/waba/waba.interface.ts#L28) | interface | apps/backend/src/waba/waba.interface.ts:28 |
| [`CreateAppointmentDto`](apps/backend/src/appointments/dto/create-appointment.dto.ts#L14) | class | apps/backend/src/appointments/dto/create-appointment.dto.ts:14 |
| [`CreateCalendarDto`](apps/backend/src/calendars/dto/create-calendar.dto.ts#L14) | class | apps/backend/src/calendars/dto/create-calendar.dto.ts:14 |
| [`CreateCustomerDto`](apps/backend/src/customers/dto/create-customer.dto.ts#L6) | class | apps/backend/src/customers/dto/create-customer.dto.ts:6 |
| [`CreateOperatingHourDto`](apps/backend/src/operating-hours/dto/create-operating-hour.dto.ts#L13) | class | apps/backend/src/operating-hours/dto/create-operating-hour.dto.ts:13 |
| [`CreatePaymentDto`](apps/backend/src/payments/dto/create-payment.dto.ts#L13) | class | apps/backend/src/payments/dto/create-payment.dto.ts:13 |
| [`CreatePlanDto`](apps/backend/src/plans/dto/create-plan.dto.ts#L13) | class | apps/backend/src/plans/dto/create-plan.dto.ts:13 |
| [`CreateSaasPlanDto`](apps/backend/src/saas-plans/dto/create-saas-plan.dto.ts#L13) | class | apps/backend/src/saas-plans/dto/create-saas-plan.dto.ts:13 |
| [`CreateServiceDto`](apps/backend/src/services/dto/create-service.dto.ts#L6) | class | apps/backend/src/services/dto/create-service.dto.ts:6 |
| [`createSubscription`](apps/frontend/lib/api/tenant.ts#L56) | function | apps/frontend/lib/api/tenant.ts:56 |
| [`CreateSubscriptionDto`](apps/backend/src/subscriptions/dto/create-subscription.dto.ts#L13) | class | apps/backend/src/subscriptions/dto/create-subscription.dto.ts:13 |
| [`createTenant`](apps/frontend/lib/api/tenant.ts#L29) | function | apps/frontend/lib/api/tenant.ts:29 |
| [`CreateTenantDto`](apps/backend/src/tenants/dto/create-tenant.dto.ts#L14) | class | apps/backend/src/tenants/dto/create-tenant.dto.ts:14 |
| [`CreateTenantRequest`](apps/frontend/lib/api/tenant.ts#L5) | interface | apps/frontend/lib/api/tenant.ts:5 |
| [`CreateTenantResponse`](apps/frontend/lib/api/tenant.ts#L12) | interface | apps/frontend/lib/api/tenant.ts:12 |
| [`CustomerEntity`](apps/backend/src/customers/entities/customer.entity.ts#L6) | class | apps/backend/src/customers/entities/customer.entity.ts:6 |
| [`CustomersController`](apps/backend/src/customers/customers.controller.ts#L29) | class | apps/backend/src/customers/customers.controller.ts:29 |
| [`CustomersModule`](apps/backend/src/customers/customers.module.ts#L9) | class | apps/backend/src/customers/customers.module.ts:9 |
| [`CustomersService`](apps/backend/src/customers/customers.service.ts#L12) | class | apps/backend/src/customers/customers.service.ts:12 |
| [`CustomerSubscriptionService`](apps/backend/src/subscriptions/customer-subscription.service.ts#L6) | class | apps/backend/src/subscriptions/customer-subscription.service.ts:6 |
| [`DateTimeUtils`](apps/backend/src/appointments/utils/date-time.utils.ts#L1) | class | apps/backend/src/appointments/utils/date-time.utils.ts:1 |
| [`Entry`](apps/backend/src/waba/waba.interface.ts#L6) | interface | apps/backend/src/waba/waba.interface.ts:6 |
| [`FindTenantQueryDto`](apps/backend/src/tenants/dto/find-tenant-query.dto.ts#L6) | class | apps/backend/src/tenants/dto/find-tenant-query.dto.ts:6 |
| [`formatPhoneDisplay`](apps/frontend/lib/utils/phone-utils.ts#L25) | function | apps/frontend/lib/utils/phone-utils.ts:25 |
| [`formatPrice`](apps/frontend/lib/api/saas-plans.ts#L55) | function | apps/frontend/lib/api/saas-plans.ts:55 |
| [`getAuthToken`](apps/backend/test/auth-helper.ts#L8) | function | apps/backend/test/auth-helper.ts:8 |
| [`getAuthToken`](apps/frontend/lib/auth/context.tsx#L198) | function | apps/frontend/lib/auth/context.tsx:198 |
| [`getDDDByCode`](apps/frontend/lib/constants/brazilian-ddd.ts#L139) | function | apps/frontend/lib/constants/brazilian-ddd.ts:139 |
| [`getIntervalLabel`](apps/frontend/lib/api/saas-plans.ts#L70) | function | apps/frontend/lib/api/saas-plans.ts:70 |
| [`getPeriodText`](apps/frontend/lib/api/saas-plans.ts#L84) | function | apps/frontend/lib/api/saas-plans.ts:84 |
| [`getSaasPlans`](apps/frontend/lib/api/saas-plans.ts#L12) | function | apps/frontend/lib/api/saas-plans.ts:12 |
| [`getTokenErrorCode`](apps/frontend/lib/auth/token-utils.ts#L75) | function | apps/frontend/lib/auth/token-utils.ts:75 |
| [`getTokenExpirationDate`](apps/frontend/lib/auth/token-utils.ts#L53) | function | apps/frontend/lib/auth/token-utils.ts:53 |
| [`getTokenRemainingTime`](apps/frontend/lib/auth/token-utils.ts#L64) | function | apps/frontend/lib/auth/token-utils.ts:64 |
| [`GoogleStrategy`](apps/backend/src/auth/strategies/google.strategy.ts#L7) | class | apps/backend/src/auth/strategies/google.strategy.ts:7 |
| [`groupPlansByInterval`](apps/frontend/lib/api/saas-plans.ts#L27) | function | apps/frontend/lib/api/saas-plans.ts:27 |
| [`Header`](apps/frontend/components/header.tsx#L5) | function | apps/frontend/components/header.tsx:5 |
| [`HeroSection`](apps/frontend/components/hero-section.tsx#L4) | function | apps/frontend/components/hero-section.tsx:4 |
| [`Home`](apps/frontend/app/page.tsx#L10) | function | apps/frontend/app/page.tsx:10 |
| [`IAppointment`](packages/api-types/src/interfaces/appointment.ts#L6) | interface | packages/api-types/src/interfaces/appointment.ts:6 |
| [`IAuthStrategy`](apps/frontend/lib/auth/strategies.tsx#L9) | interface | apps/frontend/lib/auth/strategies.tsx:9 |
| [`ICalendar`](packages/api-types/src/interfaces/calendar.ts#L6) | interface | packages/api-types/src/interfaces/calendar.ts:6 |
| [`ICreateAppointment`](packages/api-types/src/interfaces/appointment.ts#L26) | interface | packages/api-types/src/interfaces/appointment.ts:26 |
| [`ICreateCalendar`](packages/api-types/src/interfaces/calendar.ts#L21) | interface | packages/api-types/src/interfaces/calendar.ts:21 |
| [`ICreateCustomer`](packages/api-types/src/interfaces/customer.ts#L16) | interface | packages/api-types/src/interfaces/customer.ts:16 |
| [`ICreateOperatingHour`](packages/api-types/src/interfaces/operating-hour.ts#L19) | interface | packages/api-types/src/interfaces/operating-hour.ts:19 |
| [`ICreatePayment`](packages/api-types/src/interfaces/payment.ts#L25) | interface | packages/api-types/src/interfaces/payment.ts:25 |
| [`ICreatePlan`](packages/api-types/src/interfaces/plan.ts#L21) | interface | packages/api-types/src/interfaces/plan.ts:21 |
| [`ICreateSaasPlan`](packages/api-types/src/interfaces/saas-plan.ts#L19) | interface | packages/api-types/src/interfaces/saas-plan.ts:19 |
| [`ICreateService`](packages/api-types/src/interfaces/service.ts#L15) | interface | packages/api-types/src/interfaces/service.ts:15 |
| [`ICreateSubscription`](packages/api-types/src/interfaces/subscription.ts#L22) | interface | packages/api-types/src/interfaces/subscription.ts:22 |
| [`ICreateTenant`](packages/api-types/src/interfaces/tenant.ts#L28) | interface | packages/api-types/src/interfaces/tenant.ts:28 |
| [`ICustomer`](packages/api-types/src/interfaces/customer.ts#L4) | interface | packages/api-types/src/interfaces/customer.ts:4 |
| [`ILoginRequest`](packages/api-types/src/interfaces/auth.ts#L6) | interface | packages/api-types/src/interfaces/auth.ts:6 |
| [`ILoginResponse`](packages/api-types/src/interfaces/auth.ts#L14) | interface | packages/api-types/src/interfaces/auth.ts:14 |
| [`InvalidTokenException`](apps/backend/src/auth/exceptions/invalid-token.exception.ts#L7) | class | apps/backend/src/auth/exceptions/invalid-token.exception.ts:7 |
| [`IOAuthLoginResponse`](packages/api-types/src/interfaces/auth.ts#L39) | interface | packages/api-types/src/interfaces/auth.ts:39 |
| [`IOperatingHour`](packages/api-types/src/interfaces/operating-hour.ts#L6) | interface | packages/api-types/src/interfaces/operating-hour.ts:6 |
| [`IPayment`](packages/api-types/src/interfaces/payment.ts#L6) | interface | packages/api-types/src/interfaces/payment.ts:6 |
| [`IPlan`](packages/api-types/src/interfaces/plan.ts#L6) | interface | packages/api-types/src/interfaces/plan.ts:6 |
| [`ISaasPlan`](packages/api-types/src/interfaces/saas-plan.ts#L6) | interface | packages/api-types/src/interfaces/saas-plan.ts:6 |
| [`IService`](packages/api-types/src/interfaces/service.ts#L4) | interface | packages/api-types/src/interfaces/service.ts:4 |
| [`isTokenExpired`](apps/frontend/lib/auth/token-utils.ts#L42) | function | apps/frontend/lib/auth/token-utils.ts:42 |
| [`ISubscription`](packages/api-types/src/interfaces/subscription.ts#L6) | interface | packages/api-types/src/interfaces/subscription.ts:6 |
| [`isValidBrazilianPhone`](apps/frontend/lib/utils/phone-utils.ts#L50) | function | apps/frontend/lib/utils/phone-utils.ts:50 |
| [`ITenant`](packages/api-types/src/interfaces/tenant.ts#L6) | interface | packages/api-types/src/interfaces/tenant.ts:6 |
| [`IUpdateAppointment`](packages/api-types/src/interfaces/appointment.ts#L42) | interface | packages/api-types/src/interfaces/appointment.ts:42 |
| [`IUpdateCalendar`](packages/api-types/src/interfaces/calendar.ts#L33) | interface | packages/api-types/src/interfaces/calendar.ts:33 |
| [`IUpdateCustomer`](packages/api-types/src/interfaces/customer.ts#L25) | interface | packages/api-types/src/interfaces/customer.ts:25 |
| [`IUpdateOperatingHour`](packages/api-types/src/interfaces/operating-hour.ts#L31) | interface | packages/api-types/src/interfaces/operating-hour.ts:31 |
| [`IUpdatePayment`](packages/api-types/src/interfaces/payment.ts#L41) | interface | packages/api-types/src/interfaces/payment.ts:41 |
| [`IUpdatePlan`](packages/api-types/src/interfaces/plan.ts#L33) | interface | packages/api-types/src/interfaces/plan.ts:33 |
| [`IUpdateSaasPlan`](packages/api-types/src/interfaces/saas-plan.ts#L29) | interface | packages/api-types/src/interfaces/saas-plan.ts:29 |
| [`IUpdateService`](packages/api-types/src/interfaces/service.ts#L25) | interface | packages/api-types/src/interfaces/service.ts:25 |
| [`IUpdateSubscription`](packages/api-types/src/interfaces/subscription.ts#L34) | interface | packages/api-types/src/interfaces/subscription.ts:34 |
| [`IUpdateTenant`](packages/api-types/src/interfaces/tenant.ts#L47) | interface | packages/api-types/src/interfaces/tenant.ts:47 |
| [`IUser`](packages/api-types/src/interfaces/user.ts#L6) | interface | packages/api-types/src/interfaces/user.ts:6 |
| [`IUserSession`](packages/api-types/src/interfaces/auth.ts#L26) | interface | packages/api-types/src/interfaces/auth.ts:26 |
| [`JwtAuthGuard`](apps/backend/src/auth/guards/jwt-auth.guard.ts#L9) | class | apps/backend/src/auth/guards/jwt-auth.guard.ts:9 |
| [`JwtPayload`](apps/frontend/lib/auth/token-utils.ts#L4) | interface | apps/frontend/lib/auth/token-utils.ts:4 |
| [`JwtPayload`](apps/backend/src/auth/interfaces/jwt-payload.interface.ts#L1) | interface | apps/backend/src/auth/interfaces/jwt-payload.interface.ts:1 |
| [`JwtStrategy`](apps/backend/src/auth/strategies/jwt.strategy.ts#L11) | class | apps/backend/src/auth/strategies/jwt.strategy.ts:11 |
| [`LoginDto`](apps/backend/src/auth/dto/login.dto.ts#L6) | class | apps/backend/src/auth/dto/login.dto.ts:6 |
| [`MercadoPagoService`](apps/backend/src/payments/mercadopago.service.ts#L10) | class | apps/backend/src/payments/mercadopago.service.ts:10 |
| [`MercadoPagoWebhooksService`](apps/backend/src/payments/mercadopago-webhooks.service.ts#L6) | class | apps/backend/src/payments/mercadopago-webhooks.service.ts:6 |
| [`Message`](apps/backend/src/waba/waba.interface.ts#L37) | interface | apps/backend/src/waba/waba.interface.ts:37 |
| [`Metadata`](apps/backend/src/waba/waba.interface.ts#L23) | interface | apps/backend/src/waba/waba.interface.ts:23 |
| [`OperatingHourEntity`](apps/backend/src/operating-hours/entities/operating-hour.entity.ts#L7) | class | apps/backend/src/operating-hours/entities/operating-hour.entity.ts:7 |
| [`OperatingHoursController`](apps/backend/src/operating-hours/operating-hours.controller.ts#L27) | class | apps/backend/src/operating-hours/operating-hours.controller.ts:27 |
| [`OperatingHoursModule`](apps/backend/src/operating-hours/operating-hours.module.ts#L11) | class | apps/backend/src/operating-hours/operating-hours.module.ts:11 |
| [`OperatingHoursService`](apps/backend/src/operating-hours/operating-hours.service.ts#L7) | class | apps/backend/src/operating-hours/operating-hours.service.ts:7 |
| [`parseInclude`](apps/backend/src/common/utils/prisma-include.util.ts#L11) | function | apps/backend/src/common/utils/prisma-include.util.ts:11 |
| [`parseJwt`](apps/frontend/lib/auth/token-utils.ts#L25) | function | apps/frontend/lib/auth/token-utils.ts:25 |
| [`PaymentEntity`](apps/backend/src/payments/entities/payment.entity.ts#L7) | class | apps/backend/src/payments/entities/payment.entity.ts:7 |
| [`PaymentPreferenceService`](apps/backend/src/payments/payment-preference.service.ts#L14) | class | apps/backend/src/payments/payment-preference.service.ts:14 |
| [`PaymentQueueProcessor`](apps/backend/src/payments/processors/payment-webhook.processor.ts#L16) | class | apps/backend/src/payments/processors/payment-webhook.processor.ts:16 |
| [`PaymentRepository`](apps/backend/src/payments/payment-repository.service.ts#L6) | class | apps/backend/src/payments/payment-repository.service.ts:6 |
| [`PaymentsController`](apps/backend/src/payments/payments.controller.ts#L27) | class | apps/backend/src/payments/payments.controller.ts:27 |
| [`PaymentsModule`](apps/backend/src/payments/payments.module.ts#L31) | class | apps/backend/src/payments/payments.module.ts:31 |
| [`PaymentsService`](apps/backend/src/payments/payments.service.ts#L10) | class | apps/backend/src/payments/payments.service.ts:10 |
| [`PlanEntity`](apps/backend/src/plans/entities/plan.entity.ts#L7) | class | apps/backend/src/plans/entities/plan.entity.ts:7 |
| [`PlansController`](apps/backend/src/plans/plans.controller.ts#L29) | class | apps/backend/src/plans/plans.controller.ts:29 |
| [`PlansModule`](apps/backend/src/plans/plans.module.ts#L11) | class | apps/backend/src/plans/plans.module.ts:11 |
| [`PlansService`](apps/backend/src/plans/plans.service.ts#L8) | class | apps/backend/src/plans/plans.service.ts:8 |
| [`PrismaModule`](apps/backend/src/prisma/prisma.module.ts#L9) | class | apps/backend/src/prisma/prisma.module.ts:9 |
| [`PrismaService`](apps/backend/src/prisma/prisma.service.ts#L6) | class | apps/backend/src/prisma/prisma.service.ts:6 |
| [`Profile`](apps/backend/src/waba/waba.interface.ts#L33) | interface | apps/backend/src/waba/waba.interface.ts:33 |
| [`Providers`](apps/frontend/app/providers.tsx#L10) | function | apps/frontend/app/providers.tsx:10 |
| [`RelatedEntitiesValidator`](apps/backend/src/appointments/related-entities-validator.service.ts#L29) | class | apps/backend/src/appointments/related-entities-validator.service.ts:29 |
| [`RolesGuard`](apps/backend/src/auth/guards/roles.guard.ts#L8) | class | apps/backend/src/auth/guards/roles.guard.ts:8 |
| [`RootLayout`](apps/frontend/app/layout.tsx#L42) | function | apps/frontend/app/layout.tsx:42 |
| [`SaasPlanEntity`](apps/backend/src/saas-plans/entities/saas-plan.entity.ts#L7) | class | apps/backend/src/saas-plans/entities/saas-plan.entity.ts:7 |
| [`SaasPlansController`](apps/backend/src/saas-plans/saas-plans.controller.ts#L29) | class | apps/backend/src/saas-plans/saas-plans.controller.ts:29 |
| [`SaasPlansModule`](apps/backend/src/saas-plans/saas-plans.module.ts#L9) | class | apps/backend/src/saas-plans/saas-plans.module.ts:9 |
| [`SaasPlansService`](apps/backend/src/saas-plans/saas-plans.service.ts#L8) | class | apps/backend/src/saas-plans/saas-plans.service.ts:8 |
| [`sanitizePhone`](apps/frontend/lib/utils/phone-utils.ts#L10) | function | apps/frontend/lib/utils/phone-utils.ts:10 |
| [`SchedulingService`](apps/backend/src/appointments/scheduling.service.ts#L8) | class | apps/backend/src/appointments/scheduling.service.ts:8 |
| [`searchDDDs`](apps/frontend/lib/constants/brazilian-ddd.ts#L146) | function | apps/frontend/lib/constants/brazilian-ddd.ts:146 |
| [`ServiceEntity`](apps/backend/src/services/entities/service.entity.ts#L6) | class | apps/backend/src/services/entities/service.entity.ts:6 |
| [`ServicesController`](apps/backend/src/services/services.controller.ts#L29) | class | apps/backend/src/services/services.controller.ts:29 |
| [`ServicesModule`](apps/backend/src/services/services.module.ts#L9) | class | apps/backend/src/services/services.module.ts:9 |
| [`ServicesService`](apps/backend/src/services/services.service.ts#L12) | class | apps/backend/src/services/services.service.ts:12 |
| [`SpecialMappings`](apps/backend/src/common/utils/prisma-include.util.ts#L1) | type | apps/backend/src/common/utils/prisma-include.util.ts:1 |
| [`SubscribeResponse`](apps/frontend/lib/api/tenant.ts#L21) | interface | apps/frontend/lib/api/tenant.ts:21 |
| [`SubscriptionBillingService`](apps/backend/src/subscriptions/subscription-billing.service.ts#L4) | class | apps/backend/src/subscriptions/subscription-billing.service.ts:4 |
| [`SubscriptionEntity`](apps/backend/src/subscriptions/entities/subscription.entity.ts#L7) | class | apps/backend/src/subscriptions/entities/subscription.entity.ts:7 |
| [`SubscriptionRepository`](apps/backend/src/subscriptions/subscription-repository.service.ts#L6) | class | apps/backend/src/subscriptions/subscription-repository.service.ts:6 |
| [`SubscriptionsController`](apps/backend/src/subscriptions/subscriptions.controller.ts#L29) | class | apps/backend/src/subscriptions/subscriptions.controller.ts:29 |
| [`SubscriptionsModule`](apps/backend/src/subscriptions/subscriptions.module.ts#L20) | class | apps/backend/src/subscriptions/subscriptions.module.ts:20 |
| [`SubscriptionsService`](apps/backend/src/subscriptions/subscriptions.service.ts#L11) | class | apps/backend/src/subscriptions/subscriptions.service.ts:11 |
| [`TenantCustomerService`](apps/backend/src/appointments/tenant-customer.service.ts#L5) | class | apps/backend/src/appointments/tenant-customer.service.ts:5 |
| [`TenantEntity`](apps/backend/src/tenants/entities/tenant.entity.ts#L15) | class | apps/backend/src/tenants/entities/tenant.entity.ts:15 |
| [`TenantMpAuthService`](apps/backend/src/tenants/tenant-mp-auth.service.ts#L7) | class | apps/backend/src/tenants/tenant-mp-auth.service.ts:7 |
| [`TenantRepository`](apps/backend/src/tenants/tenant-repository.service.ts#L6) | class | apps/backend/src/tenants/tenant-repository.service.ts:6 |
| [`TenantSaasService`](apps/backend/src/tenants/tenant-saas.service.ts#L18) | class | apps/backend/src/tenants/tenant-saas.service.ts:18 |
| [`TenantsController`](apps/backend/src/tenants/tenants.controller.ts#L30) | class | apps/backend/src/tenants/tenants.controller.ts:30 |
| [`TenantsModule`](apps/backend/src/tenants/tenants.module.ts#L19) | class | apps/backend/src/tenants/tenants.module.ts:19 |
| [`TenantsService`](apps/backend/src/tenants/tenants.service.ts#L15) | class | apps/backend/src/tenants/tenants.service.ts:15 |
| [`TermsOfServicePage`](apps/frontend/app/termos-de-servico/page.tsx#L10) | function | apps/frontend/app/termos-de-servico/page.tsx:10 |
| [`Text`](apps/backend/src/waba/waba.interface.ts#L45) | interface | apps/backend/src/waba/waba.interface.ts:45 |
| [`ThemeProvider`](apps/frontend/components/theme-provider.tsx#L9) | function | apps/frontend/components/theme-provider.tsx:9 |
| [`TokenErrorCode`](apps/frontend/lib/auth/token-utils.ts#L17) | type | apps/frontend/lib/auth/token-utils.ts:17 |
| [`TokenExpiredException`](apps/backend/src/auth/exceptions/token-expired.exception.ts#L7) | class | apps/backend/src/auth/exceptions/token-expired.exception.ts:7 |
| [`TokenService`](apps/backend/src/auth/token.service.ts#L17) | class | apps/backend/src/auth/token.service.ts:17 |
| [`UpdateAppointmentDto`](apps/backend/src/appointments/dto/update-appointment.dto.ts#L4) | class | apps/backend/src/appointments/dto/update-appointment.dto.ts:4 |
| [`UpdateCalendarDto`](apps/backend/src/calendars/dto/update-calendar.dto.ts#L4) | class | apps/backend/src/calendars/dto/update-calendar.dto.ts:4 |
| [`UpdateCustomerDto`](apps/backend/src/customers/dto/update-customer.dto.ts#L4) | class | apps/backend/src/customers/dto/update-customer.dto.ts:4 |
| [`UpdateOperatingHourDto`](apps/backend/src/operating-hours/dto/update-operating-hour.dto.ts#L4) | class | apps/backend/src/operating-hours/dto/update-operating-hour.dto.ts:4 |
| [`UpdatePaymentDto`](apps/backend/src/payments/dto/update-payment.dto.ts#L4) | class | apps/backend/src/payments/dto/update-payment.dto.ts:4 |
| [`UpdatePlanDto`](apps/backend/src/plans/dto/update-plan.dto.ts#L4) | class | apps/backend/src/plans/dto/update-plan.dto.ts:4 |
| [`UpdateSaasPlanDto`](apps/backend/src/saas-plans/dto/update-saas-plan.dto.ts#L4) | class | apps/backend/src/saas-plans/dto/update-saas-plan.dto.ts:4 |
| [`UpdateServiceDto`](apps/backend/src/services/dto/update-service.dto.ts#L4) | class | apps/backend/src/services/dto/update-service.dto.ts:4 |
| [`UpdateSubscriptionDto`](apps/backend/src/subscriptions/dto/update-subscription.dto.ts#L4) | class | apps/backend/src/subscriptions/dto/update-subscription.dto.ts:4 |
| [`UpdateTenantDto`](apps/backend/src/tenants/dto/update-tenant.dto.ts#L4) | class | apps/backend/src/tenants/dto/update-tenant.dto.ts:4 |
| [`Value`](apps/backend/src/waba/waba.interface.ts#L16) | interface | apps/backend/src/waba/waba.interface.ts:16 |
| [`WabaAPI`](apps/backend/src/waba/waba.api.ts#L3) | function | apps/backend/src/waba/waba.api.ts:3 |
| [`WabaController`](apps/backend/src/waba/waba.controller.ts#L8) | class | apps/backend/src/waba/waba.controller.ts:8 |
| [`WabaModule`](apps/backend/src/waba/waba.module.ts#L21) | class | apps/backend/src/waba/waba.module.ts:21 |
| [`WabaProcessor`](apps/backend/src/waba/waba.processor.ts#L6) | class | apps/backend/src/waba/waba.processor.ts:6 |
| [`WebhookPayload`](apps/backend/src/waba/waba.interface.ts#L1) | interface | apps/backend/src/waba/waba.interface.ts:1 |
| [`WebhooksController`](apps/backend/src/payments/webhooks.controller.ts#L20) | class | apps/backend/src/payments/webhooks.controller.ts:20 |
| [`WhatIsCliqtree`](apps/frontend/components/what-is-cliqtree.tsx#L3) | function | apps/frontend/components/what-is-cliqtree.tsx:3 |

## Internal System Boundaries

The system is divided into clear-bounded contexts:
- **Tenant Management**: Handles onboarding, SaaS subscriptions, and configuration.
- **Core Operations**: Manages services, operating hours, and customer relationships.
- **Booking Engine**: Orchestrates appointments, availability checks, and calendar synchronization.
- **Finance Engine**: Manages payments, billing cycles, and integration with Mercado Pago.
- **Communication Layer**: Dedicated `waba` module for all WhatsApp-related logic.

## External Service Dependencies

### 1. WhatsApp Business API (Meta)
- **Role**: Primary communication and booking channel.
- **Integration**: Webhooks for incoming messages; REST API for outgoing templates.
- **Boundaries**: Encapsulated in the `waba` module.

### 2. Mercado Pago
- **Role**: Payment gateway and subscription management.
- **Integration**: OAuth for seller authorization; Webhooks for payment lifecycle events.
- **Boundaries**: Encapsulated in the `payments` module.

### 3. Google/Apple Calendars
- **Role**: External sync for tenant schedules.
- **Boundaries**: Handled in the `calendars` module.

## Key Decisions & Trade-offs
- **Modular Monolith**: Chosen for development speed and deployment simplicity while maintaining a path toward microservices if needed.
- **Repository Pattern**: Added an abstraction layer over Prisma to simplify testing and allow for potential data-source changes without leaking ORM details into the service layer.
- **BullMQ for Webhooks**: Ensures that heavy external processing or transient failures in third-party APIs don't block the HTTP request cycle.

## Diagrams
*(Mermaid diagrams go here)*

## Risks & Constraints
- **WABA Rate Limits**: Heavy traffic must be managed via queues to avoid Meta API throttling.
- **Webhooks Reliability**: Idempotency is implemented in payment and message processors to handle duplicate webhook deliveries.

## Top Directories Snapshot
- `anotacoes.md/` — approximately 1 files
- `apps/` — approximately 569 files
- `coverage/` — approximately 125 files
- `implementations/` — approximately 33 files
- `package.json/` — approximately 1 files
- `packages/` — approximately 62 files
- `pnpm-lock.yaml/` — approximately 1 files
- `pnpm-workspace.yaml/` — approximately 1 files
- `README.md/` — approximately 1 files
- `turbo.json/` — approximately 1 files

## Related Resources

- [Project Overview](./project-overview.md)
- Update [agents/README.md](../agents/README.md) when architecture changes.
