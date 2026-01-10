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

/**
 * Create a new tenant
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
