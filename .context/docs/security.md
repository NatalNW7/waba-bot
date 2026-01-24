---
status: filled
generated: 2026-01-24
---

# Security & Compliance Notes

Capture the policies and guardrails that keep this project secure and compliant.

## Authentication & Authorization

- **Strategy**: Role-Based Access Control (RBAC) enforced via NestJS Guards.
- **Identity Providers**:
    - Email/Password (Local).
    - Google OAuth (Social).
- **Session Management**: Passport.js with JWT Strategy. Tokens are used for both frontend API requests and WABA identification where applicable.
- **Roles**:
    - **ADMIN**: Global system access.
    - **TENANT**: Access limited to their business data (defined by `tenant_id`).
    - **CUSTOMER**: Access limited to their personal profile and bookings.

## Secrets & Sensitive Data

- **Environment Variables**: Managed via `.env` files (excluded from Git).
- **Password Protection**: Hashed using `bcrypt`.
- **Integrations**:
    - **Mercado Pago**: Tenant-specific access tokens stored in the database.
    - **WABA**: Permanent system user tokens managed in environment variables.

## Compliance & Policies

- **LGPD/GDPR**: Customer data (phone, email) is stored; privacy policy must be presented during onboarding.
- **WABA Policies**: Must adhere to Meta's commerce and business policies for message templates.
- **SSL**: All external communications (Web, WABA Webhooks, MP Webhooks) must be over HTTPS.

## Incident Response

Note on-call contacts, escalation steps, and tooling for detection, triage, and post-incident analysis.
