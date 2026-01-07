# Phase 5: Occasional Payments

One-time payments for appointments or specific services.

## Goals
- Generate payment links (Checkout Pro) or process API payments.
- Link `Payment` to `Appointment`.

## Proposed Changes

### [MODIFY] PaymentsService / AppointmentsService
- When an appointment is created with "pay now", generate a Mercado Pago payment.
- Use the **Tenant's client** so the money goes to the Tenant.

## Verification
- Generate a payment link.
- Verify that a `Payment` record is created and linked to the `Appointment`.
