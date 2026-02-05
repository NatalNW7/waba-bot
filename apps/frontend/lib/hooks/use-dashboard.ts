/**
 * React Query hooks for dashboard data fetching
 * Uses the client API functions for data fetching
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  appointmentsApi,
  customersApi,
  servicesApi,
  plansApi,
  dashboardApi,
  paymentsApi,
  operatingHoursApi,
  calendarsApi,
  tenantApi,
  type AppointmentFilters,
  type CustomerFilters,
} from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";
import {
  ICreateAppointment,
  IUpdateAppointment,
  ICreateCustomer,
  IUpdateCustomer,
  ICreateService,
  IUpdateService,
  ICreatePlan,
  IUpdatePlan,
  ICreateOperatingHour,
  IUpdateOperatingHour,
  IUpdateTenant,
} from "@repo/api-types";

// ============================================
// Query Keys
// ============================================

export const queryKeys = {
  appointments: {
    all: ["appointments"] as const,
    list: (filters?: AppointmentFilters) =>
      ["appointments", "list", filters] as const,
    detail: (id: string) => ["appointments", id] as const,
  },
  customers: {
    all: ["customers"] as const,
    list: (filters?: CustomerFilters) =>
      ["customers", "list", filters] as const,
    detail: (id: string) => ["customers", id] as const,
  },
  services: {
    all: ["services"] as const,
    list: () => ["services", "list"] as const,
    detail: (id: string) => ["services", id] as const,
  },
  plans: {
    all: ["plans"] as const,
    list: () => ["plans", "list"] as const,
    detail: (id: string) => ["plans", id] as const,
  },
  dashboard: {
    stats: () => ["dashboard", "stats"] as const,
  },
  payments: {
    all: ["payments"] as const,
    list: () => ["payments", "list"] as const,
  },
  operatingHours: {
    all: ["operatingHours"] as const,
    list: () => ["operatingHours", "list"] as const,
  },
  calendar: {
    current: () => ["calendar"] as const,
  },
  tenant: {
    current: () => ["tenant", "current"] as const,
  },
};

// ============================================
// Appointments Hooks
// ============================================

/**
 * Fetch a list of appointments with optional filtering
 */
export function useAppointments(filters?: AppointmentFilters) {
  return useQuery({
    queryKey: queryKeys.appointments.list(filters),
    queryFn: () => appointmentsApi.list(filters),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: queryKeys.appointments.detail(id),
    queryFn: () => appointmentsApi.get(id),
    enabled: !!id,
  });
}

/**
 * Create a new appointment
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ICreateAppointment, "tenantId">) =>
      appointmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
    },
  });
}

/**
 * Update an existing appointment
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateAppointment }) =>
      appointmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
    },
  });
}

export function useConfirmAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentsApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      appointmentsApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
    },
  });
}

// ============================================
// Customers Hooks
// ============================================

export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: queryKeys.customers.list(filters),
    queryFn: () => customersApi.list(filters),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn: () => customersApi.get(id),
    enabled: !!id,
  });
}

/**
 * Create a new customer
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ICreateCustomer, "tenantId">) =>
      customersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

/**
 * Update an existing customer
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateCustomer }) =>
      customersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
}

// ============================================
// Services Hooks
// ============================================

export function useServices() {
  return useQuery({
    queryKey: queryKeys.services.list(),
    queryFn: () => servicesApi.list(),
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: queryKeys.services.detail(id),
    queryFn: () => servicesApi.get(id),
    enabled: !!id,
  });
}

/**
 * Create a new service
 */
export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ICreateService, "tenantId">) =>
      servicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
}

/**
 * Update an existing service
 */
export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateService }) =>
      servicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
}

// ============================================
// Plans Hooks
// ============================================

export function usePlans() {
  return useQuery({
    queryKey: queryKeys.plans.list(),
    queryFn: () => plansApi.list(),
  });
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: queryKeys.plans.detail(id),
    queryFn: () => plansApi.get(id),
    enabled: !!id,
  });
}

/**
 * Create a new plan
 */
export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ICreatePlan, "tenantId">) => plansApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all });
    },
  });
}

/**
 * Update an existing plan
 */
export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdatePlan }) =>
      plansApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => plansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all });
    },
  });
}

// ============================================
// Dashboard Hooks
// ============================================

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => dashboardApi.getStats(),
  });
}

// ============================================
// Payments Hooks
// ============================================

export function usePayments() {
  return useQuery({
    queryKey: queryKeys.payments.list(),
    queryFn: () => paymentsApi.list(),
  });
}

// ============================================
// Operating Hours Hooks
// ============================================

export function useOperatingHours() {
  return useQuery({
    queryKey: queryKeys.operatingHours.list(),
    queryFn: () => operatingHoursApi.list(),
  });
}

/**
 * Bulk update operating hours
 */
export function useUpdateOperatingHours() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IUpdateOperatingHour[]) =>
      operatingHoursApi.bulkUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.operatingHours.all });
    },
  });
}

/**
 * Create a new operating hour entry
 */
export function useCreateOperatingHour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ICreateOperatingHour, "tenantId">) =>
      operatingHoursApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.operatingHours.all });
    },
  });
}

// ============================================
// Calendar Hooks
// ============================================

export function useCalendar() {
  return useQuery({
    queryKey: queryKeys.calendar.current(),
    queryFn: () => calendarsApi.get(),
  });
}

export function useConnectCalendar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: string) => calendarsApi.connect(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.current() });
    },
  });
}

export function useDisconnectCalendar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => calendarsApi.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar.current() });
    },
  });
}

// ============================================
// Tenant Hooks
// ============================================

export function useCurrentTenant() {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  return useQuery({
    queryKey: queryKeys.tenant.current(),
    queryFn: () => tenantApi.getCurrent(tenantId!, "saasPlan"),
    enabled: !!tenantId,
  });
}

/**
 * Update current tenant settings
 */
export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IUpdateTenant) => tenantApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenant.current() });
    },
  });
}
