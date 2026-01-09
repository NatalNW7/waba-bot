# Phase 1: Infrastructure & SDK Setup

This phase focuses on setting up the foundation for all Mercado Pago interactions.

## Goals

- Install and configure Mercado Pago SDK.
- Define environment variables for Platform credentials.
- Create a shared `MercadoPagoService` to provide configured clients.

## Proposed Changes

### Configuration

Update `.env` with Platform credentials:

- `MP_PLATFORM_ACCESS_TOKEN`
- `MP_PLATFORM_PUBLIC_KEY`
- `MP_WEBHOOK_SECRET` (optional, for signature verification)

## Test Credentials & Sandbox Info

> [!IMPORTANT]
> Use these credentials for initial platform-level testing and sandbox verification.

**Platform Test Credentials:**

- **Public Key**: `TEST-3c37daa6-5033-456b-9236-d4522a09312f`
- **Access Token**: `TEST-7681122337146693-010219-8ac0901b520a70aa446467eff6ed64d7-257942709`

**Test User Account:**

- **User ID**: `2615364343`
- **Username**: `TESTUSER286128689`
- **Password**: `F39swao1u8`

**Test Card for Subscriptions/Payments:**

- **Number**: `5031 4332 1540 6351`
- **Security Code**: `123`
- **Expiry**: `11/30`

### [NEW] MercadoPagoService (Shared)

A service that provides:

- `getPlatformClient()`: Returns a client configured with platform credentials.
- `getTenantClient(tenantId)`: Returns a client configured with a specific Tenant's access token retrieved from the DB.

### [MODIFY] PaymentsModule

- Export `MercadoPagoService` for use in other modules (`Tenants`, `Subscriptions`).

## Verification

- Verify that `mercadopago` package is installed.
- Unit test for `MercadoPagoService` to ensure it correctly selects credentials.
- **MCP Tool**: Use `quality_checklist` to ensure the planned architecture meets Mercado Pago's integration standards.
- **MCP Tool**: Use `search_documentation` for specific terms like "Preference API" or "Pre-approval API" during coding.
