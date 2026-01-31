/**
 * Shared enums for API types
 * These mirror the Prisma schema enums but are independent of Prisma
 */

// Appointment status
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELED = 'CANCELED',
  COMPLETED = 'COMPLETED',
}

// Calendar provider
export enum CalendarProvider {
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
}

// Subscription status
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}

// Payment interval
export enum PaymentInterval {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

// Day of week
export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

// Payment status
export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  FAILED = 'FAILED',
}

// Payment type
export enum PaymentType {
  APPOINTMENT = 'APPOINTMENT',
  SUBSCRIPTION = 'SUBSCRIPTION',
  SAAS_FEE = 'SAAS_FEE',
}

// Payment method
export enum PaymentMethod {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
}

// User role
export enum UserRole {
  ADMIN = 'ADMIN',
  TENANT = 'TENANT',
  CUSTOMER = 'CUSTOMER',
}

// Payment provider
export enum PaymentProvider {
  MERCADO_PAGO = 'MERCADO_PAGO',
  INFINITE_PAY = 'INFINITE_PAY',
}
