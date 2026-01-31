/**
 * Client-side API functions
 * Used with React Query for data fetching in client components
 */

import {
  IAppointment,
  ICreateAppointment,
  IUpdateAppointment,
  ICustomer,
  ICreateCustomer,
  IUpdateCustomer,
  IService,
  ICreateService,
  IUpdateService,
  IPlan,
  ICreatePlan,
  IUpdatePlan,
  IPayment,
  IOperatingHour,
  IUpdateOperatingHour,
  ICalendar,
  ITenant,
  IUpdateTenant,
} from "@repo/api-types";

/**
 * Get the base API URL for client-side requests
 */
const getApiUrl = () => {
  // In the browser, use relative URL to leverage Next.js proxy or same-origin
  // The actual backend URL is configured in next.config.js rewrites
  return process.env.NEXT_PUBLIC_BACKEND_URL;
};

/**
 * Get auth token from session/cookies for client-side requests
 */
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;

  // Get token from localStorage (set during login via AuthContext)
  return localStorage.getItem("auth_token");
};

/**
 * Custom error class for API errors
 */
export class ClientApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ClientApiError";
  }
}

/**
 * Base fetch wrapper for client-side API calls
 */
async function clientFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}${endpoint}`;
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    throw new ClientApiError(
      `API request failed: ${response.statusText}`,
      response.status,
      response.statusText,
      errorData,
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

// ============================================
// Appointments API
// ============================================

export interface AppointmentFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  customerId?: string;
}

export const appointmentsApi = {
  list: (filters?: AppointmentFilters) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.customerId) params.set("customerId", filters.customerId);

    const query = params.toString();
    return clientFetch<IAppointment[]>(
      `/appointments${query ? `?${query}` : ""}`,
    );
  },

  get: (id: string) => clientFetch<IAppointment>(`/appointments/${id}`),

  create: (data: Omit<ICreateAppointment, "tenantId">) =>
    clientFetch<IAppointment>("/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: IUpdateAppointment) =>
    clientFetch<IAppointment>(`/appointments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    clientFetch<void>(`/appointments/${id}`, { method: "DELETE" }),

  confirm: (id: string) =>
    clientFetch<IAppointment>(`/appointments/${id}/confirm`, {
      method: "POST",
    }),

  cancel: (id: string, reason?: string) =>
    clientFetch<IAppointment>(`/appointments/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};

// ============================================
// Customers API
// ============================================

export interface CustomerFilters {
  search?: string;
  limit?: number;
  offset?: number;
}

export const customersApi = {
  list: (filters?: CustomerFilters) => {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.limit) params.set("limit", String(filters.limit));
    if (filters?.offset) params.set("offset", String(filters.offset));

    const query = params.toString();
    return clientFetch<ICustomer[]>(`/customers${query ? `?${query}` : ""}`);
  },

  get: (id: string) => clientFetch<ICustomer>(`/customers/${id}`),

  create: (data: Omit<ICreateCustomer, "tenantId">) =>
    clientFetch<ICustomer>("/customers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: IUpdateCustomer) =>
    clientFetch<ICustomer>(`/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    clientFetch<void>(`/customers/${id}`, { method: "DELETE" }),
};

// ============================================
// Services API
// ============================================

export const servicesApi = {
  list: () => clientFetch<IService[]>("/services"),

  get: (id: string) => clientFetch<IService>(`/services/${id}`),

  create: (data: Omit<ICreateService, "tenantId">) =>
    clientFetch<IService>("/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: IUpdateService) =>
    clientFetch<IService>(`/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    clientFetch<void>(`/services/${id}`, { method: "DELETE" }),
};

// ============================================
// Plans API
// ============================================

export const plansApi = {
  list: () => clientFetch<IPlan[]>("/plans"),

  get: (id: string) => clientFetch<IPlan>(`/plans/${id}`),

  create: (data: Omit<ICreatePlan, "tenantId">) =>
    clientFetch<IPlan>("/plans", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: IUpdatePlan) =>
    clientFetch<IPlan>(`/plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    clientFetch<void>(`/plans/${id}`, { method: "DELETE" }),
};

// ============================================
// Dashboard Stats API
// ============================================

export interface DashboardStats {
  totalAppointments: number;
  totalCustomers: number;
  totalRevenue: number;
  appointmentsByStatus: Record<string, number>;
  recentAppointments: IAppointment[];
}

export const dashboardApi = {
  getStats: () => clientFetch<DashboardStats>("/dashboard/stats"),
};

// ============================================
// Payments API
// ============================================

export const paymentsApi = {
  list: () => clientFetch<IPayment[]>("/payments"),
  get: (id: string) => clientFetch<IPayment>(`/payments/${id}`),
};

// ============================================
// Operating Hours API
// ============================================

export const operatingHoursApi = {
  list: () => clientFetch<IOperatingHour[]>("/operating-hours"),
  update: (id: string, data: IUpdateOperatingHour) =>
    clientFetch<IOperatingHour>(`/operating-hours/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  bulkUpdate: (data: IUpdateOperatingHour[]) =>
    clientFetch<IOperatingHour[]>("/operating-hours/bulk", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ============================================
// Calendars API
// ============================================

export const calendarsApi = {
  get: () => clientFetch<ICalendar>("/calendars"),
  connect: (provider: string) =>
    clientFetch<ICalendar>(`/calendars/connect/${provider}`, {
      method: "POST",
    }),
  disconnect: () =>
    clientFetch<void>("/calendars/disconnect", { method: "POST" }),
};

// ============================================
// Tenant API (current user's tenant)
// ============================================

export const tenantApi = {
  getCurrent: (id: string, query?: string) =>
    clientFetch<ITenant>(`/tenants/${id}?include=${query}`),
  update: (data: IUpdateTenant) => {
    const { id, ...rest } = data;
    return clientFetch<ITenant>(`/tenants/${id}`, {
      method: "PATCH",
      body: JSON.stringify(rest),
    });
  },
};
