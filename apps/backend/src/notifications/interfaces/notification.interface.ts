/**
 * Appointment data needed for notifications
 */
export interface AppointmentNotificationData {
  appointmentId: string;
  serviceName: string;
  date: Date;
  price: number;
}

/**
 * Customer data needed for notifications
 */
export interface CustomerNotificationData {
  name: string;
  email: string | null;
  phone: string;
}

/**
 * Tenant data needed for notifications
 */
export interface TenantNotificationData {
  name: string;
  phoneId: string | null;
}
