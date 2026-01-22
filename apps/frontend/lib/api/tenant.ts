import { getAuthToken } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface CreateTenantRequest {
  name: string;
  email: string;
  phone: string;
  saasPlanId: string;
}

export interface CreateTenantResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  saasPlanId: string;
  saasStatus: string;
}

export interface SubscribeResponse {
  initPoint: string;
  externalId: string;
}

export interface OnboardTenantRequest {
  name: string;
  email: string;
  phone: string;
  saasPlanId: string;
  createSubscription?: boolean;
}

export interface OnboardTenantResponse {
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string;
    saasPlanId: string;
    saasStatus: string;
  };
  subscription?: {
    initPoint: string;
    externalId: string;
  };
}

/**
 * Create a new tenant
 * @deprecated Use onboardTenant instead for consolidated onboarding
 */
export async function createTenant(
  data: CreateTenantRequest,
): Promise<CreateTenantResponse> {
  const token = getAuthToken();

  const response = await fetch(`${BACKEND_URL}/tenants`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message || "Falha ao criar negócio",
    );
  }

  return response.json() as Promise<CreateTenantResponse>;
}

/**
 * Create SaaS subscription for tenant and get Mercado Pago payment URL
 * @deprecated Use onboardTenant instead for consolidated onboarding
 */
export async function createSubscription(
  tenantId: string,
): Promise<SubscribeResponse> {
  const token = getAuthToken();

  const response = await fetch(`${BACKEND_URL}/tenants/${tenantId}/subscribe`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message || "Falha ao criar assinatura",
    );
  }

  return response.json() as Promise<SubscribeResponse>;
}

/**
 * Consolidated onboarding - creates tenant AND subscription in one request
 */
export async function onboardTenant(
  data: OnboardTenantRequest,
): Promise<OnboardTenantResponse> {
  const token = getAuthToken();

  const response = await fetch(`${BACKEND_URL}/tenants/onboard`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message || "Falha ao criar negócio",
    );
  }

  return response.json() as Promise<OnboardTenantResponse>;
}

/**
 * Send email verification code
 */
export async function sendVerificationEmail(): Promise<{ message: string }> {
  const token = getAuthToken();

  const response = await fetch(`${BACKEND_URL}/auth/send-verification`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message ||
        "Falha ao enviar código de verificação",
    );
  }

  return response.json() as Promise<{ message: string }>;
}

/**
 * Verify email with code
 */
export async function verifyEmail(
  code: string,
): Promise<{ verified: boolean }> {
  const token = getAuthToken();

  const response = await fetch(`${BACKEND_URL}/auth/verify-email`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message || "Código inválido ou expirado",
    );
  }

  return response.json() as Promise<{ verified: boolean }>;
}

/**
 * Check email verification status
 */
export async function getEmailStatus(): Promise<{ emailVerified: boolean }> {
  const token = getAuthToken();

  const response = await fetch(`${BACKEND_URL}/auth/email-status`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return { emailVerified: false };
  }

  return response.json() as Promise<{ emailVerified: boolean }>;
}
