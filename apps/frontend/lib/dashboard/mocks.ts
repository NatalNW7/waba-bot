/**
 * Dashboard Mock Data
 * Realistic mock data adhering to Prisma schema relationships
 * Uses all enum values for status diversity
 */

import {
  AppointmentStatus,
  SubscriptionStatus,
  PaymentInterval,
  PaymentStatus,
  PaymentType,
  PaymentMethod,
  DayOfWeek,
  CalendarProvider,
} from "@repo/api-types";

import type {
  DashboardAppointment,
  DashboardCustomer,
  DashboardTenant,
  DashboardService,
  DashboardPlan,
  DashboardPayment,
  DashboardOperatingHour,
  DashboardCalendar,
} from "./types";

// ============================================
// Helper Functions
// ============================================

const uuid = () => crypto.randomUUID();

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Base date for mocks (today)
const TODAY = new Date();
TODAY.setHours(9, 0, 0, 0);

// ============================================
// Mock Tenant
// ============================================

export const mockTenant: DashboardTenant = {
  id: "1bf381d2-2629-4484-826e-d6ab4d25153f",
  name: "Studio Bella Hair",
  email: "contato@studiobella.com.br",
  phone: "+5511999998888",
  wabaId: null,
  phoneId: null,
  accessToken: null,
  mpAccessToken: "APP_USR-xxxx-mock-token",
  mpPublicKey: "APP_USR-xxxx-public-key",
  mpRefToken: null,
  saasStatus: SubscriptionStatus.ACTIVE,
  saasNextBilling: addDays(TODAY, 15).toISOString(),
  saasPaymentMethodId: "pm_card_visa",
  saasPlanId: "saas-pro-001",
  createdAt: addDays(TODAY, -90).toISOString(),
  updatedAt: TODAY.toISOString(),
  saasPlan: {
    id: "saas-pro-001",
    name: "Pro",
    price: "99.00",
    description: "Plano profissional com recursos avançados",
    interval: PaymentInterval.MONTHLY,
    createdAt: addDays(TODAY, -365).toISOString(),
    updatedAt: TODAY.toISOString(),
  },
};

// ============================================
// Mock Services (5)
// ============================================

export const mockServices: DashboardService[] = [
  {
    id: uuid(),
    name: "Corte Feminino",
    price: "80.00",
    duration: 60,
    tenantId: mockTenant.id,
  },
  {
    id: uuid(),
    name: "Escova Progressiva",
    price: "150.00",
    duration: 90,
    tenantId: mockTenant.id,
  },
  {
    id: uuid(),
    name: "Manicure",
    price: "35.00",
    duration: 45,
    tenantId: mockTenant.id,
  },
  {
    id: uuid(),
    name: "Pedicure",
    price: "40.00",
    duration: 45,
    tenantId: mockTenant.id,
  },
  {
    id: uuid(),
    name: "Coloração",
    price: "120.00",
    duration: 90,
    tenantId: mockTenant.id,
  },
];

// ============================================
// Mock Plans (3)
// ============================================

export const mockPlans: DashboardPlan[] = [
  {
    id: uuid(),
    name: "Básico",
    description: "4 procedimentos por mês",
    price: "99.00",
    interval: PaymentInterval.MONTHLY,
    maxAppointments: 4,
    tenantId: mockTenant.id,
    createdAt: addDays(TODAY, -180).toISOString(),
    updatedAt: TODAY.toISOString(),
    intervalLabel: "Mensal",
    maxAppointmentsLabel: "4 por mês",
    services: [mockServices[0], mockServices[2], mockServices[3]],
  },
  {
    id: uuid(),
    name: "Premium",
    description: "8 procedimentos por mês",
    price: "179.00",
    interval: PaymentInterval.MONTHLY,
    maxAppointments: 8,
    tenantId: mockTenant.id,
    createdAt: addDays(TODAY, -180).toISOString(),
    updatedAt: TODAY.toISOString(),
    intervalLabel: "Mensal",
    maxAppointmentsLabel: "8 por mês",
    services: mockServices,
  },
  {
    id: uuid(),
    name: "VIP Trimestral",
    description: "Acesso ilimitado",
    price: "449.00",
    interval: PaymentInterval.QUARTERLY,
    maxAppointments: -1,
    tenantId: mockTenant.id,
    createdAt: addDays(TODAY, -180).toISOString(),
    updatedAt: TODAY.toISOString(),
    intervalLabel: "Trimestral",
    maxAppointmentsLabel: "Ilimitado",
    services: mockServices,
  },
];

// ============================================
// Mock Customers (5)
// ============================================

export const mockCustomers: DashboardCustomer[] = [
  {
    id: uuid(),
    name: "Maria Silva",
    phone: "+5511987654321",
    email: "maria.silva@email.com",
    createdAt: addDays(TODAY, -60).toISOString(),
    updatedAt: TODAY.toISOString(),
    tenantCustomer: {
      id: uuid(),
      subscription: {
        id: uuid(),
        status: SubscriptionStatus.ACTIVE,
        startDate: addDays(TODAY, -30).toISOString(),
        nextBilling: addDays(TODAY, 5).toISOString(),
        cardTokenId: "tok_visa_xxx",
        externalId: "sub_mp_001",
        planId: mockPlans[1].id,
        tenantCustomerId: uuid(),
        createdAt: addDays(TODAY, -30).toISOString(),
        updatedAt: TODAY.toISOString(),
        plan: mockPlans[1],
      },
    },
    statusLabel: "Assinante",
    statusColor: "green",
  },
  {
    id: uuid(),
    name: "Ana Costa",
    phone: "+5511976543210",
    email: "ana.costa@email.com",
    createdAt: addDays(TODAY, -45).toISOString(),
    updatedAt: TODAY.toISOString(),
    tenantCustomer: {
      id: uuid(),
      subscription: {
        id: uuid(),
        status: SubscriptionStatus.PAST_DUE,
        startDate: addDays(TODAY, -60).toISOString(),
        nextBilling: addDays(TODAY, -5).toISOString(),
        cardTokenId: "tok_master_xxx",
        externalId: "sub_mp_002",
        planId: mockPlans[0].id,
        tenantCustomerId: uuid(),
        createdAt: addDays(TODAY, -60).toISOString(),
        updatedAt: TODAY.toISOString(),
        plan: mockPlans[0],
      },
    },
    statusLabel: "Inadimplente",
    statusColor: "yellow",
  },
  {
    id: uuid(),
    name: "Carla Mendes",
    phone: "+5511965432109",
    email: "carla.mendes@email.com",
    createdAt: addDays(TODAY, -90).toISOString(),
    updatedAt: TODAY.toISOString(),
    tenantCustomer: {
      id: uuid(),
      subscription: {
        id: uuid(),
        status: SubscriptionStatus.CANCELED,
        startDate: addDays(TODAY, -90).toISOString(),
        nextBilling: addDays(TODAY, -30).toISOString(),
        cardTokenId: "tok_visa_yyy",
        externalId: "sub_mp_003",
        planId: mockPlans[0].id,
        tenantCustomerId: uuid(),
        createdAt: addDays(TODAY, -90).toISOString(),
        updatedAt: TODAY.toISOString(),
        plan: mockPlans[0],
      },
    },
    statusLabel: "Cancelado",
    statusColor: "red",
  },
  {
    id: uuid(),
    name: "Julia Santos",
    phone: "+5511954321098",
    email: "julia.santos@email.com",
    createdAt: addDays(TODAY, -15).toISOString(),
    updatedAt: TODAY.toISOString(),
    tenantCustomer: undefined,
    statusLabel: "Walk-in",
    statusColor: "gray",
  },
  {
    id: uuid(),
    name: "Fernanda Lima",
    phone: "+5511943210987",
    email: "fernanda.lima@email.com",
    createdAt: addDays(TODAY, -7).toISOString(),
    updatedAt: TODAY.toISOString(),
    tenantCustomer: undefined,
    statusLabel: "Walk-in",
    statusColor: "gray",
  },
];

// ============================================
// Mock Appointments (10)
// ============================================

export const mockAppointments: DashboardAppointment[] = [
  // Today - PENDING
  {
    id: uuid(),
    date: addHours(TODAY, 1).toISOString(),
    status: AppointmentStatus.PENDING,
    price: "80.00",
    tenantId: mockTenant.id,
    customerId: mockCustomers[0].id,
    serviceId: mockServices[0].id,
    createdAt: addDays(TODAY, -1).toISOString(),
    updatedAt: TODAY.toISOString(),
    customer: mockCustomers[0],
    service: mockServices[0],
  },
  // Today - CONFIRMED
  {
    id: uuid(),
    date: addHours(TODAY, 3).toISOString(),
    status: AppointmentStatus.CONFIRMED,
    price: "35.00",
    tenantId: mockTenant.id,
    customerId: mockCustomers[1].id,
    serviceId: mockServices[2].id,
    createdAt: addDays(TODAY, -2).toISOString(),
    updatedAt: TODAY.toISOString(),
    customer: mockCustomers[1],
    service: mockServices[2],
  },
  // Today - CONFIRMED
  {
    id: uuid(),
    date: addHours(TODAY, 5).toISOString(),
    status: AppointmentStatus.CONFIRMED,
    price: "150.00",
    tenantId: mockTenant.id,
    customerId: mockCustomers[3].id,
    serviceId: mockServices[1].id,
    createdAt: addDays(TODAY, -1).toISOString(),
    updatedAt: TODAY.toISOString(),
    customer: mockCustomers[3],
    service: mockServices[1],
  },
  // Tomorrow - PENDING
  {
    id: uuid(),
    date: addDays(addHours(TODAY, 2), 1).toISOString(),
    status: AppointmentStatus.PENDING,
    price: "120.00",
    tenantId: mockTenant.id,
    customerId: mockCustomers[4].id,
    serviceId: mockServices[4].id,
    createdAt: TODAY.toISOString(),
    updatedAt: TODAY.toISOString(),
    customer: mockCustomers[4],
    service: mockServices[4],
  },
  // Tomorrow - CONFIRMED
  {
    id: uuid(),
    date: addDays(addHours(TODAY, 4), 1).toISOString(),
    status: AppointmentStatus.CONFIRMED,
    price: "40.00",
    tenantId: mockTenant.id,
    customerId: mockCustomers[0].id,
    serviceId: mockServices[3].id,
    createdAt: TODAY.toISOString(),
    updatedAt: TODAY.toISOString(),
    customer: mockCustomers[0],
    service: mockServices[3],
  },
  // Past - COMPLETED
  {
    id: uuid(),
    date: addDays(addHours(TODAY, 2), -1).toISOString(),
    status: AppointmentStatus.COMPLETED,
    price: "80.00",
    tenantId: mockTenant.id,
    customerId: mockCustomers[1].id,
    serviceId: mockServices[0].id,
    createdAt: addDays(TODAY, -3).toISOString(),
    updatedAt: addDays(TODAY, -1).toISOString(),
    customer: mockCustomers[1],
    service: mockServices[0],
  },
  // Past - COMPLETED
  {
    id: uuid(),
    date: addDays(addHours(TODAY, 3), -2).toISOString(),
    status: AppointmentStatus.COMPLETED,
    price: "150.00",
    tenantId: mockTenant.id,
    customerId: mockCustomers[2].id,
    serviceId: mockServices[1].id,
    createdAt: addDays(TODAY, -5).toISOString(),
    updatedAt: addDays(TODAY, -2).toISOString(),
    customer: mockCustomers[2],
    service: mockServices[1],
  },
  // Past - CANCELED
  {
    id: uuid(),
    date: addDays(addHours(TODAY, 4), -3).toISOString(),
    status: AppointmentStatus.CANCELED,
    cancellationReason: "Cliente solicitou cancelamento",
    canceledAt: addDays(TODAY, -4).toISOString(),
    price: "35.00",
    tenantId: mockTenant.id,
    customerId: mockCustomers[3].id,
    serviceId: mockServices[2].id,
    createdAt: addDays(TODAY, -7).toISOString(),
    updatedAt: addDays(TODAY, -4).toISOString(),
    customer: mockCustomers[3],
    service: mockServices[2],
  },
  // Next week - PENDING
  {
    id: uuid(),
    date: addDays(addHours(TODAY, 2), 5).toISOString(),
    status: AppointmentStatus.PENDING,
    price: "80.00",
    tenantId: mockTenant.id,
    customerId: mockCustomers[4].id,
    serviceId: mockServices[0].id,
    createdAt: TODAY.toISOString(),
    updatedAt: TODAY.toISOString(),
    customer: mockCustomers[4],
    service: mockServices[0],
  },
  // Next week - CONFIRMED
  {
    id: uuid(),
    date: addDays(addHours(TODAY, 3), 7).toISOString(),
    status: AppointmentStatus.CONFIRMED,
    price: "120.00",
    tenantId: mockTenant.id,
    customerId: mockCustomers[0].id,
    serviceId: mockServices[4].id,
    createdAt: TODAY.toISOString(),
    updatedAt: TODAY.toISOString(),
    customer: mockCustomers[0],
    service: mockServices[4],
  },
];

// ============================================
// Mock Operating Hours (7 days)
// ============================================

export const mockOperatingHours: DashboardOperatingHour[] = [
  {
    id: uuid(),
    day: DayOfWeek.MONDAY,
    startTime: "09:00",
    endTime: "18:00",
    isClosed: false,
    onlyForSubscribers: false,
    tenantId: mockTenant.id,
    dayLabel: "Segunda",
  },
  {
    id: uuid(),
    day: DayOfWeek.TUESDAY,
    startTime: "09:00",
    endTime: "18:00",
    isClosed: false,
    onlyForSubscribers: false,
    tenantId: mockTenant.id,
    dayLabel: "Terça",
  },
  {
    id: uuid(),
    day: DayOfWeek.WEDNESDAY,
    startTime: "09:00",
    endTime: "18:00",
    isClosed: false,
    onlyForSubscribers: false,
    tenantId: mockTenant.id,
    dayLabel: "Quarta",
  },
  {
    id: uuid(),
    day: DayOfWeek.THURSDAY,
    startTime: "09:00",
    endTime: "18:00",
    isClosed: false,
    onlyForSubscribers: false,
    tenantId: mockTenant.id,
    dayLabel: "Quinta",
  },
  {
    id: uuid(),
    day: DayOfWeek.FRIDAY,
    startTime: "09:00",
    endTime: "20:00",
    isClosed: false,
    onlyForSubscribers: false,
    tenantId: mockTenant.id,
    dayLabel: "Sexta",
  },
  {
    id: uuid(),
    day: DayOfWeek.SATURDAY,
    startTime: "09:00",
    endTime: "16:00",
    isClosed: false,
    onlyForSubscribers: true,
    tenantId: mockTenant.id,
    dayLabel: "Sábado",
  },
  {
    id: uuid(),
    day: DayOfWeek.SUNDAY,
    startTime: "00:00",
    endTime: "00:00",
    isClosed: true,
    onlyForSubscribers: false,
    tenantId: mockTenant.id,
    dayLabel: "Domingo",
  },
];

// ============================================
// Mock Payments (SAAS_FEE history)
// ============================================

export const mockPayments: DashboardPayment[] = [
  {
    id: uuid(),
    externalId: "pay_mp_001",
    amount: "99.00",
    netAmount: "94.05",
    fee: "4.95",
    status: PaymentStatus.APPROVED,
    type: PaymentType.SAAS_FEE,
    method: PaymentMethod.CREDIT_CARD,
    tenantId: mockTenant.id,
    createdAt: addDays(TODAY, -30).toISOString(),
    updatedAt: addDays(TODAY, -30).toISOString(),
    statusLabel: "Aprovado",
    statusColor: "green",
  },
  {
    id: uuid(),
    externalId: "pay_mp_002",
    amount: "99.00",
    netAmount: "94.05",
    fee: "4.95",
    status: PaymentStatus.APPROVED,
    type: PaymentType.SAAS_FEE,
    method: PaymentMethod.CREDIT_CARD,
    tenantId: mockTenant.id,
    createdAt: addDays(TODAY, -60).toISOString(),
    updatedAt: addDays(TODAY, -60).toISOString(),
    statusLabel: "Aprovado",
    statusColor: "green",
  },
  {
    id: uuid(),
    externalId: "pay_mp_003",
    amount: "99.00",
    netAmount: "94.05",
    fee: "4.95",
    status: PaymentStatus.APPROVED,
    type: PaymentType.SAAS_FEE,
    method: PaymentMethod.PIX,
    tenantId: mockTenant.id,
    createdAt: addDays(TODAY, -90).toISOString(),
    updatedAt: addDays(TODAY, -90).toISOString(),
    statusLabel: "Aprovado",
    statusColor: "green",
  },
];

// ============================================
// Mock Calendar (Google sync)
// ============================================

export const mockCalendar: DashboardCalendar | null = {
  id: uuid(),
  provider: CalendarProvider.GOOGLE,
  email: "studiobella@gmail.com",
  accessToken: "ya29.mock-access-token",
  refreshToken: "1//mock-refresh-token",
  tokenExpiry: addDays(TODAY, 30).toISOString(),
  tenantId: mockTenant.id,
  createdAt: addDays(TODAY, -30).toISOString(),
  updatedAt: TODAY.toISOString(),
  isConnected: true,
  providerLabel: "Google Calendar",
};

// ============================================
// Dashboard Summary Statistics
// ============================================

export const mockDashboardStats = {
  todayAppointments: mockAppointments.filter((a) => {
    const appointmentDate = new Date(a.date);
    return (
      appointmentDate.toDateString() === TODAY.toDateString() &&
      a.status !== AppointmentStatus.CANCELED
    );
  }).length,
  weekAppointments: mockAppointments.filter((a) => {
    const appointmentDate = new Date(a.date);
    const weekFromNow = addDays(TODAY, 7);
    return (
      appointmentDate >= TODAY &&
      appointmentDate <= weekFromNow &&
      a.status !== AppointmentStatus.CANCELED
    );
  }).length,
  activeSubscribers: mockCustomers.filter(
    (c) => c.tenantCustomer?.subscription?.status === SubscriptionStatus.ACTIVE,
  ).length,
  totalCustomers: mockCustomers.length,
  revenueThisMonth: mockPayments
    .filter((p) => {
      const paymentDate = new Date(p.createdAt);
      return (
        paymentDate.getMonth() === TODAY.getMonth() &&
        paymentDate.getFullYear() === TODAY.getFullYear()
      );
    })
    .reduce((sum, p) => sum + parseFloat(p.amount as string), 0),
};
