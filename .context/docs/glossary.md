---
status: filled
generated: 2026-01-13
---

# Glossary & Domain Concepts

List project-specific terminology, acronyms, domain entities, and user personas.

## Type Definitions
- **AuthenticatedUser** (interface) — [`AuthenticatedUser`](apps/backend/src/auth/interfaces/jwt-payload.interface.ts#L11)
- **BrazilianDDD** (interface) — [`BrazilianDDD`](apps/frontend/lib/constants/brazilian-ddd.ts#L6)
- **Change** (interface) — [`Change`](apps/backend/src/waba/waba.interface.ts#L11)
- **Contact** (interface) — [`Contact`](apps/backend/src/waba/waba.interface.ts#L28)
- **CreateTenantRequest** (interface) — [`CreateTenantRequest`](apps/frontend/lib/api/tenant.ts#L5)
- **CreateTenantResponse** (interface) — [`CreateTenantResponse`](apps/frontend/lib/api/tenant.ts#L12)
- **Entry** (interface) — [`Entry`](apps/backend/src/waba/waba.interface.ts#L6)
- **IAppointment** (interface) — [`IAppointment`](packages/api-types/src/interfaces/appointment.ts#L6)
- **IAuthStrategy** (interface) — [`IAuthStrategy`](apps/frontend/lib/auth/strategies.tsx#L9)
- **ICalendar** (interface) — [`ICalendar`](packages/api-types/src/interfaces/calendar.ts#L6)
- **ICreateAppointment** (interface) — [`ICreateAppointment`](packages/api-types/src/interfaces/appointment.ts#L26)
- **ICreateCalendar** (interface) — [`ICreateCalendar`](packages/api-types/src/interfaces/calendar.ts#L21)
- **ICreateCustomer** (interface) — [`ICreateCustomer`](packages/api-types/src/interfaces/customer.ts#L16)
- **ICreateOperatingHour** (interface) — [`ICreateOperatingHour`](packages/api-types/src/interfaces/operating-hour.ts#L19)
- **ICreatePayment** (interface) — [`ICreatePayment`](packages/api-types/src/interfaces/payment.ts#L25)
- **ICreatePlan** (interface) — [`ICreatePlan`](packages/api-types/src/interfaces/plan.ts#L21)
- **ICreateSaasPlan** (interface) — [`ICreateSaasPlan`](packages/api-types/src/interfaces/saas-plan.ts#L19)
- **ICreateService** (interface) — [`ICreateService`](packages/api-types/src/interfaces/service.ts#L15)
- **ICreateSubscription** (interface) — [`ICreateSubscription`](packages/api-types/src/interfaces/subscription.ts#L22)
- **ICreateTenant** (interface) — [`ICreateTenant`](packages/api-types/src/interfaces/tenant.ts#L28)
- **ICustomer** (interface) — [`ICustomer`](packages/api-types/src/interfaces/customer.ts#L4)
- **ILoginRequest** (interface) — [`ILoginRequest`](packages/api-types/src/interfaces/auth.ts#L6)
- **ILoginResponse** (interface) — [`ILoginResponse`](packages/api-types/src/interfaces/auth.ts#L14)
- **IOAuthLoginResponse** (interface) — [`IOAuthLoginResponse`](packages/api-types/src/interfaces/auth.ts#L39)
- **IOperatingHour** (interface) — [`IOperatingHour`](packages/api-types/src/interfaces/operating-hour.ts#L6)
- **IPayment** (interface) — [`IPayment`](packages/api-types/src/interfaces/payment.ts#L6)
- **IPlan** (interface) — [`IPlan`](packages/api-types/src/interfaces/plan.ts#L6)
- **ISaasPlan** (interface) — [`ISaasPlan`](packages/api-types/src/interfaces/saas-plan.ts#L6)
- **IService** (interface) — [`IService`](packages/api-types/src/interfaces/service.ts#L4)
- **ISubscription** (interface) — [`ISubscription`](packages/api-types/src/interfaces/subscription.ts#L6)
- **ITenant** (interface) — [`ITenant`](packages/api-types/src/interfaces/tenant.ts#L6)
- **IUpdateAppointment** (interface) — [`IUpdateAppointment`](packages/api-types/src/interfaces/appointment.ts#L42)
- **IUpdateCalendar** (interface) — [`IUpdateCalendar`](packages/api-types/src/interfaces/calendar.ts#L33)
- **IUpdateCustomer** (interface) — [`IUpdateCustomer`](packages/api-types/src/interfaces/customer.ts#L25)
- **IUpdateOperatingHour** (interface) — [`IUpdateOperatingHour`](packages/api-types/src/interfaces/operating-hour.ts#L31)
- **IUpdatePayment** (interface) — [`IUpdatePayment`](packages/api-types/src/interfaces/payment.ts#L41)
- **IUpdatePlan** (interface) — [`IUpdatePlan`](packages/api-types/src/interfaces/plan.ts#L33)
- **IUpdateSaasPlan** (interface) — [`IUpdateSaasPlan`](packages/api-types/src/interfaces/saas-plan.ts#L29)
- **IUpdateService** (interface) — [`IUpdateService`](packages/api-types/src/interfaces/service.ts#L25)
- **IUpdateSubscription** (interface) — [`IUpdateSubscription`](packages/api-types/src/interfaces/subscription.ts#L34)
- **IUpdateTenant** (interface) — [`IUpdateTenant`](packages/api-types/src/interfaces/tenant.ts#L47)
- **IUser** (interface) — [`IUser`](packages/api-types/src/interfaces/user.ts#L6)
- **IUserSession** (interface) — [`IUserSession`](packages/api-types/src/interfaces/auth.ts#L26)
- **JwtPayload** (interface) — [`JwtPayload`](apps/frontend/lib/auth/token-utils.ts#L4)
- **JwtPayload** (interface) — [`JwtPayload`](apps/backend/src/auth/interfaces/jwt-payload.interface.ts#L1)
- **Message** (interface) — [`Message`](apps/backend/src/waba/waba.interface.ts#L37)
- **Metadata** (interface) — [`Metadata`](apps/backend/src/waba/waba.interface.ts#L23)
- **Profile** (interface) — [`Profile`](apps/backend/src/waba/waba.interface.ts#L33)
- **SpecialMappings** (type) — [`SpecialMappings`](apps/backend/src/common/utils/prisma-include.util.ts#L1)
- **SubscribeResponse** (interface) — [`SubscribeResponse`](apps/frontend/lib/api/tenant.ts#L21)
- **Text** (interface) — [`Text`](apps/backend/src/waba/waba.interface.ts#L45)
- **TokenErrorCode** (type) — [`TokenErrorCode`](apps/frontend/lib/auth/token-utils.ts#L17)
- **Value** (interface) — [`Value`](apps/backend/src/waba/waba.interface.ts#L16)
- **WebhookPayload** (interface) — [`WebhookPayload`](apps/backend/src/waba/waba.interface.ts#L1)

## Enumerations
- **AppointmentStatus** — [`AppointmentStatus`](packages/api-types/src/enums.ts#L7)
- **CalendarProvider** — [`CalendarProvider`](packages/api-types/src/enums.ts#L15)
- **DayOfWeek** — [`DayOfWeek`](packages/api-types/src/enums.ts#L36)
- **PaymentInterval** — [`PaymentInterval`](packages/api-types/src/enums.ts#L29)
- **PaymentMethod** — [`PaymentMethod`](packages/api-types/src/enums.ts#L63)
- **PaymentStatus** — [`PaymentStatus`](packages/api-types/src/enums.ts#L47)
- **PaymentType** — [`PaymentType`](packages/api-types/src/enums.ts#L56)
- **SubscriptionStatus** — [`SubscriptionStatus`](packages/api-types/src/enums.ts#L21)
- **UserRole** — [`UserRole`](packages/api-types/src/enums.ts#L69)

## Core Terms

- **Tenant**: A business entity (e.g., a barbershop) that uses the platform to manage its operations.
- **Customer**: An individual who consumes services provided by a Tenant.
- **SaasPlan**: A subscription tier (e.g., Basic, Pro) that a Tenant pays the platform to use the software.
- **Plan**: A membership or subscription package offered by a Tenant to its Customers (e.g., "Unlimited Haircuts for $50/mo").
- **Service**: A specific offering (e.g., "Beard Trim") with a defined price and duration.
- **Appointment**: A confirmed booking for a specific service at a specific time.
- **WABA**: WhatsApp Business API, the communication channel for notifications and booking.

## Acronyms & Abbreviations
- **MP**: Mercado Pago (Payment Gateway).
- **WABA**: WhatsApp Business API.
- **PIX**: Brazilian instant payment system.
- **RBAC**: Role-Based Access Control (Admin, Tenant, Customer).

## Personas / Actors
- **Admin**: System administrator overseeing the entire SaaS platform.
- **Tenant Owner**: Manages their own salon/barbershop, configures services, and views analytics.
- **Customer**: Books appointments and manages their own subscriptions via web or WhatsApp.

## Domain Rules & Invariants
- **Multi-Tenancy**: A Tenant can only see its own data (Customers, Appointments, Finances).
- **Subscription Lock**: Certain features (or unlimited appointments) may be restricted if the Tenant's SaaS subscription is not `ACTIVE`.
- **Payment Integrity**: Appointment prices are snapshotted at the time of booking to ensure historical accuracy even if the Service price changes later.
- **WhatsApp Identification**: Customers are primarily identified by their phone number (`customers.phone`).
