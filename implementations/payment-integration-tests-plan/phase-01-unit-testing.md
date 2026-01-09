# Phase 01: Unit Testing & Business Logic

This phase focuses on isolating and testing the business logic of individual services without making real external calls. We use mocks to simulate database and Mercado Pago SDK behavior.

## Scope

- `TenantsService`: SaaS subscription creation, OAuth authorization URL, and code exchange logic.
- `SubscriptionsService`: Customer subscription creation logic, plan validation, and date calculations.
- `PaymentsService`: Appointment payment link (preference) generation logic.

## Proposed Tests

### [src/tenants/tenants.service.spec.ts]

- **SaaS Subscription**:
  - [ ] `createSubscription`: Should correctly fetch tenant and plan, then call platform client and return `init_point`.
  - [ ] `createSubscription`: Should throw `NotFoundException` if tenant or plan does not exist.
- **OAuth Flow**:
  - [ ] `getMpAuthorizationUrl`: Should return the correct URL with environment variables and tenant state.
  - [ ] `exchangeMpCode`: Should call OAuth client with correct parameters and update tenant with credentials.

### [src/subscriptions/subscriptions.service.spec.ts]

- **Customer Subscriptions**:
  - [ ] `create`: Should validate plan and customer existence.
  - [ ] `create`: Should correctly calculate `nextBilling` based on plan interval (MONTHLY/YEARLY).
  - [ ] `create`: Should call tenant-specific client and store the `externalId`.
  - [ ] `create`: Should throw `BadRequestException` if `cardTokenId` is missing for automated payments.

### [src/payments/payments.service.spec.ts]

- **Occasional Payments**:
  - [ ] `createAppointmentPayment`: Should fetch appointment with service/tenant/customer relations.
  - [ ] `createAppointmentPayment`: Should create a Preference with the correct unit price and external reference.
  - [ ] `createAppointmentPayment`: Should throw `BadRequestException` if appointment has no service.

## Verification Tools

- **Jest**: Run tests with `pnpm run test`.
- **jest-mock-extended**: For mocking `PrismaService`.
- **Manual Mocks**: Create partial mocks for `mercadopago` SDK classes (`PreApproval`, `Preference`, `OAuth`).
