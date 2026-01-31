/**
 * Dashboard TypeScript Types
 * Extended interfaces for dashboard views, composing @repo/api-types
 */

import type {
  IAppointment,
  ICustomer,
  IService,
  ITenant,
  ISaasPlan,
  ISubscription,
  IPlan,
  IPayment,
  IOperatingHour,
  ICalendar,
} from "@repo/api-types";

import {
  AppointmentStatus,
  SubscriptionStatus,
  PaymentInterval,
  PaymentStatus,
  PaymentType,
  PaymentMethod,
  DayOfWeek,
  CalendarProvider,
  PaymentProvider,
} from "@repo/api-types";

// Re-export enums for convenience
export {
  AppointmentStatus,
  SubscriptionStatus,
  PaymentInterval,
  PaymentStatus,
  PaymentType,
  PaymentMethod,
  DayOfWeek,
  CalendarProvider,
  PaymentProvider,
};

// ============================================
// Dashboard View Models
// ============================================

/**
 * Appointment with expanded relations for calendar display
 */
export interface DashboardAppointment extends IAppointment {
  customer?: ICustomer;
  service?: IService;
}

/**
 * Customer with subscription status for CRM table
 */
export interface DashboardCustomer extends ICustomer {
  tenantCustomer?: {
    id: string;
    subscription?: ISubscription & {
      plan?: IPlan;
    };
  };
  statusLabel: "Assinante" | "Inadimplente" | "Cancelado" | "Avulsos";
  statusColor: "green" | "yellow" | "red" | "gray";
}

/**
 * Tenant with SaaS plan details for settings
 */
export interface DashboardTenant extends ITenant {
  saasPlan?: ISaasPlan;
}

/**
 * Service with optional plan associations
 */
export interface DashboardService extends IService {
  plans?: IPlan[];
}

/**
 * Plan with service count for catalog display
 */
export interface DashboardPlan extends IPlan {
  services?: IService[];
  intervalLabel: string;
  maxAppointmentsLabel: string;
}

/**
 * Payment for financial history
 */
export interface DashboardPayment extends IPayment {
  statusLabel: string;
  statusColor: "green" | "yellow" | "red" | "gray";
}

/**
 * Operating hour for settings matrix
 */
export interface DashboardOperatingHour extends IOperatingHour {
  dayLabel: string;
}

/**
 * Calendar sync status
 */
export interface DashboardCalendar extends ICalendar {
  isConnected: boolean;
  providerLabel: string;
}

// ============================================
// Utility Types
// ============================================

/**
 * Calendar event for schedule-x
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  appointment: DashboardAppointment;
}

/**
 * Status color mapping
 */
export const appointmentStatusColors: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: "#eab308", // Yellow
  [AppointmentStatus.CONFIRMED]: "#22c55e", // Green
  [AppointmentStatus.CANCELED]: "#ef4444", // Red
  [AppointmentStatus.COMPLETED]: "#3b82f6", // Blue
};

export const subscriptionStatusColors: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: "#22c55e", // Green
  [SubscriptionStatus.PAST_DUE]: "#eab308", // Yellow
  [SubscriptionStatus.CANCELED]: "#ef4444", // Red
  [SubscriptionStatus.EXPIRED]: "#6b7280", // Gray
};

/**
 * Day of week labels in Portuguese
 */
export const dayOfWeekLabels: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: "Segunda",
  [DayOfWeek.TUESDAY]: "Terça",
  [DayOfWeek.WEDNESDAY]: "Quarta",
  [DayOfWeek.THURSDAY]: "Quinta",
  [DayOfWeek.FRIDAY]: "Sexta",
  [DayOfWeek.SATURDAY]: "Sábado",
  [DayOfWeek.SUNDAY]: "Domingo",
};

/**
 * Payment interval labels in Portuguese
 */
export const paymentIntervalLabels: Record<PaymentInterval, string> = {
  [PaymentInterval.MONTHLY]: "Mensal",
  [PaymentInterval.QUARTERLY]: "Trimestral",
  [PaymentInterval.YEARLY]: "Anual",
};
