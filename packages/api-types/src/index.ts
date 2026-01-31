/**
 * @repo/api-types
 *
 * Shared TypeScript types for the WABA Bot monorepo.
 * Provides a single source of truth for API contracts between backend and frontend.
 */

// Export all enums
export {
  AppointmentStatus,
  CalendarProvider,
  SubscriptionStatus,
  PaymentInterval,
  DayOfWeek,
  PaymentStatus,
  PaymentType,
  PaymentMethod,
  UserRole,
  PaymentProvider,
} from './enums';

// Export all interfaces
export type {
  // Tenant
  ITenant,
  ICreateTenant,
  IUpdateTenant,
  // Customer
  ICustomer,
  ICreateCustomer,
  IUpdateCustomer,
  // Service
  IService,
  ICreateService,
  IUpdateService,
  // Appointment
  IAppointment,
  ICreateAppointment,
  IUpdateAppointment,
  // Subscription
  ISubscription,
  ICreateSubscription,
  IUpdateSubscription,
  // Payment
  IPayment,
  ICreatePayment,
  IUpdatePayment,
  // SaaS Plan
  ISaasPlan,
  ICreateSaasPlan,
  IUpdateSaasPlan,
  // Plan
  IPlan,
  ICreatePlan,
  IUpdatePlan,
  // Calendar
  ICalendar,
  ICreateCalendar,
  IUpdateCalendar,
  // Operating Hour
  IOperatingHour,
  ICreateOperatingHour,
  IUpdateOperatingHour,
  // User
  IUser,
  // Auth
  ILoginRequest,
  ILoginResponse,
  IUserSession,
  IOAuthLoginResponse,
} from './interfaces';
