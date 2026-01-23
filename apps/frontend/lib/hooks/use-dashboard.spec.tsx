/**
 * Unit tests for dashboard React Query hooks
 */

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

import {
  useAppointments,
  useCustomers,
  useServices,
  usePlans,
  usePayments,
  useOperatingHours,
  useCalendar,
  useCurrentTenant,
  queryKeys,
} from "./use-dashboard";

// Mock the API client
jest.mock("@/lib/api/client", () => ({
  appointmentsApi: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    confirm: jest.fn(),
    cancel: jest.fn(),
  },
  customersApi: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  servicesApi: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  plansApi: {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  dashboardApi: {
    getStats: jest.fn(),
  },
  paymentsApi: {
    list: jest.fn(),
    get: jest.fn(),
  },
  operatingHoursApi: {
    list: jest.fn(),
    update: jest.fn(),
    bulkUpdate: jest.fn(),
  },
  calendarsApi: {
    get: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  },
  tenantApi: {
    getCurrent: jest.fn(),
    update: jest.fn(),
  },
}));

import {
  appointmentsApi,
  customersApi,
  servicesApi,
  plansApi,
  paymentsApi,
  operatingHoursApi,
  calendarsApi,
  tenantApi,
} from "@/lib/api/client";

// Create a wrapper with QueryClient for testing
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryClientWrapper";
  return Wrapper;
};

describe("Dashboard Hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useAppointments", () => {
    it("should fetch appointments successfully", async () => {
      const mockAppointments = [
        { id: "1", date: "2024-01-01", status: "PENDING" },
        { id: "2", date: "2024-01-02", status: "CONFIRMED" },
      ];
      (appointmentsApi.list as jest.Mock).mockResolvedValue(mockAppointments);

      const { result } = renderHook(() => useAppointments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAppointments);
      expect(appointmentsApi.list).toHaveBeenCalledTimes(1);
    });

    it("should handle fetch error", async () => {
      const error = new Error("Failed to fetch");
      (appointmentsApi.list as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useAppointments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(error);
    });

    it("should pass filters to API", async () => {
      (appointmentsApi.list as jest.Mock).mockResolvedValue([]);
      const filters = { status: "PENDING" };

      renderHook(() => useAppointments(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() =>
        expect(appointmentsApi.list).toHaveBeenCalledWith(filters),
      );
    });
  });

  describe("useCustomers", () => {
    it("should fetch customers successfully", async () => {
      const mockCustomers = [
        { id: "1", name: "Customer 1", phone: "11999999999" },
        { id: "2", name: "Customer 2", phone: "11888888888" },
      ];
      (customersApi.list as jest.Mock).mockResolvedValue(mockCustomers);

      const { result } = renderHook(() => useCustomers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCustomers);
      expect(customersApi.list).toHaveBeenCalledTimes(1);
    });

    it("should handle fetch error", async () => {
      const error = new Error("Failed to fetch");
      (customersApi.list as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useCustomers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(error);
    });
  });

  describe("useServices", () => {
    it("should fetch services successfully", async () => {
      const mockServices = [
        { id: "1", name: "Corte", price: 50, duration: 30 },
        { id: "2", name: "Barba", price: 25, duration: 15 },
      ];
      (servicesApi.list as jest.Mock).mockResolvedValue(mockServices);

      const { result } = renderHook(() => useServices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockServices);
      expect(servicesApi.list).toHaveBeenCalledTimes(1);
    });

    it("should handle fetch error", async () => {
      const error = new Error("Failed to fetch");
      (servicesApi.list as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useServices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(error);
    });
  });

  describe("usePlans", () => {
    it("should fetch plans successfully", async () => {
      const mockPlans = [
        { id: "1", name: "Basic", price: 99, interval: "MONTHLY" },
        { id: "2", name: "Premium", price: 199, interval: "MONTHLY" },
      ];
      (plansApi.list as jest.Mock).mockResolvedValue(mockPlans);

      const { result } = renderHook(() => usePlans(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPlans);
      expect(plansApi.list).toHaveBeenCalledTimes(1);
    });

    it("should handle fetch error", async () => {
      const error = new Error("Failed to fetch");
      (plansApi.list as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => usePlans(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(error);
    });
  });

  describe("usePayments", () => {
    it("should fetch payments successfully", async () => {
      const mockPayments = [
        { id: "1", amount: 99, status: "PAID" },
        { id: "2", amount: 199, status: "PENDING" },
      ];
      (paymentsApi.list as jest.Mock).mockResolvedValue(mockPayments);

      const { result } = renderHook(() => usePayments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPayments);
      expect(paymentsApi.list).toHaveBeenCalledTimes(1);
    });
  });

  describe("useOperatingHours", () => {
    it("should fetch operating hours successfully", async () => {
      const mockHours = [
        { id: "1", day: "MONDAY", startTime: "09:00", endTime: "18:00" },
        { id: "2", day: "TUESDAY", startTime: "09:00", endTime: "18:00" },
      ];
      (operatingHoursApi.list as jest.Mock).mockResolvedValue(mockHours);

      const { result } = renderHook(() => useOperatingHours(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockHours);
      expect(operatingHoursApi.list).toHaveBeenCalledTimes(1);
    });
  });

  describe("useCalendar", () => {
    it("should fetch calendar successfully", async () => {
      const mockCalendar = {
        id: "1",
        isConnected: true,
        email: "test@example.com",
      };
      (calendarsApi.get as jest.Mock).mockResolvedValue(mockCalendar);

      const { result } = renderHook(() => useCalendar(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCalendar);
      expect(calendarsApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("useCurrentTenant", () => {
    it("should fetch current tenant successfully", async () => {
      const mockTenant = {
        id: "1",
        name: "Test Tenant",
        saasStatus: "ACTIVE",
      };
      (tenantApi.getCurrent as jest.Mock).mockResolvedValue(mockTenant);

      const { result } = renderHook(() => useCurrentTenant(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTenant);
      expect(tenantApi.getCurrent).toHaveBeenCalledTimes(1);
    });
  });

  describe("queryKeys", () => {
    it("should generate correct query keys for appointments", () => {
      expect(queryKeys.appointments.all).toEqual(["appointments"]);
      expect(queryKeys.appointments.list()).toEqual([
        "appointments",
        "list",
        undefined,
      ]);
      expect(queryKeys.appointments.detail("123")).toEqual([
        "appointments",
        "123",
      ]);
    });

    it("should generate correct query keys for customers", () => {
      expect(queryKeys.customers.all).toEqual(["customers"]);
      expect(queryKeys.customers.list()).toEqual([
        "customers",
        "list",
        undefined,
      ]);
      expect(queryKeys.customers.detail("456")).toEqual(["customers", "456"]);
    });

    it("should generate correct query keys for services", () => {
      expect(queryKeys.services.all).toEqual(["services"]);
      expect(queryKeys.services.list()).toEqual(["services", "list"]);
      expect(queryKeys.services.detail("789")).toEqual(["services", "789"]);
    });

    it("should generate correct query keys for plans", () => {
      expect(queryKeys.plans.all).toEqual(["plans"]);
      expect(queryKeys.plans.list()).toEqual(["plans", "list"]);
      expect(queryKeys.plans.detail("abc")).toEqual(["plans", "abc"]);
    });
  });
});
