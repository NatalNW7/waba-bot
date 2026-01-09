# Phase 3: Tenant MP Integration (OAuth)

To allow Tenants to receive payments directly, they must link their Mercado Pago account.

## Goals

- Implement Mercado Pago OAuth flow.
- Store `mpAccessToken`, `mpPublicKey`, and `mpRefToken` in the `Tenant` table.

## Proposed Changes

### [MODIFY] TenantsController

- `GET /tenants/auth/mercadopago`: Redirect to Mercado Pago OAuth URL.
- `GET /tenants/auth/mercadopago/callback`: Handle the callback from MP, exchange code for tokens, and save to the Tenant record.

## Technical Details

- Use `MP_CLIENT_ID` and `MP_CLIENT_SECRET` in the OAuth exchange.
- Ensure the `redirect_uri` is correctly configured in the Mercado Pago application.

## Verification

- Manual verification of the OAuth flow in Sandbox.
- Check that tokens are saved to the database for the correct Tenant.
