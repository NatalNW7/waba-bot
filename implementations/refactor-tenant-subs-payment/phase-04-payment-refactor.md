# Phase 4: Payment & Preference Logic

## Objective
Decouple `PaymentsService` from the complex logic of creating appointment payment links.

## Proposed Changes

### [NEW] `src/payments/appointment-payment.service.ts`
- Move `createAppointmentPayment` (MP Preference creation) here.
- Responsibility: Map appointment data to MP Preference body and handle SDK call.

### [MODIFY] `src/payments/payments.service.ts`
- Focus on payment record management (CRUD).
- Delegate complex preference creation to `AppointmentPaymentService`.

## Verification
- Verify that `notification_url` and `back_urls` are correctly populated.
- E2E test for appointment payment generation.
