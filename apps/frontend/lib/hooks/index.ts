/**
 * Dashboard hooks - re-export all hooks from use-dashboard.ts
 */

export {
  // Query Keys
  queryKeys,

  // Appointments
  useAppointments,
  useAppointment,
  useCreateAppointment,
  useUpdateAppointment,
  useConfirmAppointment,
  useCancelAppointment,

  // Customers
  useCustomers,
  useCustomer,
  useCreateCustomer,
  useUpdateCustomer,

  // Services
  useServices,
  useService,
  useCreateService,
  useUpdateService,
  useDeleteService,

  // Plans
  usePlans,
  usePlan,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,

  // Dashboard
  useDashboardStats,

  // Payments
  usePayments,

  // Operating Hours
  useOperatingHours,
  useCreateOperatingHour,
  useUpdateOperatingHours,

  // Calendar
  useCalendar,
  useConnectCalendar,
  useDisconnectCalendar,

  // Tenant
  useCurrentTenant,
  useUpdateTenant,
} from "./use-dashboard";
