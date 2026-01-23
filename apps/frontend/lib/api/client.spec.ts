/**
 * Unit tests for API client functions
 */

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage for auth token
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

describe("API Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe("clientFetch", () => {
    it("should add auth token to request headers", async () => {
      mockLocalStorage.getItem.mockReturnValue("test-token");
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: "test" }),
      });

      // Import fresh module after mocks are set
      const { appointmentsApi } = await import("../api/client");
      await appointmentsApi.list();

      expect(mockFetch).toHaveBeenCalled();
      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers["Authorization"]).toBe("Bearer test-token");
    });

    it("should throw error on non-ok response", async () => {
      mockLocalStorage.getItem.mockReturnValue("test-token");
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: () => Promise.resolve({ message: "Resource not found" }),
      });

      const { appointmentsApi } = await import("../api/client");

      await expect(appointmentsApi.list()).rejects.toThrow();
    });

    it("should handle network errors", async () => {
      mockLocalStorage.getItem.mockReturnValue("test-token");
      mockFetch.mockRejectedValue(new Error("Network error"));

      const { appointmentsApi } = await import("../api/client");

      await expect(appointmentsApi.list()).rejects.toThrow("Network error");
    });
  });

  describe("appointmentsApi", () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue("test-token");
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    it("should call list endpoint", async () => {
      const { appointmentsApi } = await import("../api/client");
      await appointmentsApi.list();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/appointments"),
        expect.any(Object),
      );
    });

    it("should call get endpoint with id", async () => {
      const { appointmentsApi } = await import("../api/client");
      await appointmentsApi.get("123");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/appointments/123"),
        expect.any(Object),
      );
    });

    it("should call create endpoint with POST", async () => {
      const { appointmentsApi } = await import("../api/client");
      const data = {
        date: "2024-01-01",
        serviceId: "1",
        customerId: "1",
      } as any;
      await appointmentsApi.create(data);

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe("POST");
      expect(options.body).toBe(JSON.stringify(data));
    });

    it("should call update endpoint with PATCH", async () => {
      const { appointmentsApi } = await import("../api/client");
      const data = { status: "CONFIRMED" } as any;
      await appointmentsApi.update("123", data);

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain("/appointments/123");
      expect(options.method).toBe("PATCH");
    });

    it("should call confirm endpoint with PATCH", async () => {
      const { appointmentsApi } = await import("../api/client");
      await appointmentsApi.confirm("123");

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain("/appointments/123/confirm");
      expect(options.method).toBe("PATCH");
    });

    it("should call cancel endpoint with PATCH", async () => {
      const { appointmentsApi } = await import("../api/client");
      await appointmentsApi.cancel("123", "No show");

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain("/appointments/123/cancel");
      expect(options.method).toBe("PATCH");
    });
  });

  describe("customersApi", () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue("test-token");
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    it("should call list endpoint", async () => {
      const { customersApi } = await import("../api/client");
      await customersApi.list();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/customers"),
        expect.any(Object),
      );
    });

    it("should call create endpoint with POST", async () => {
      const { customersApi } = await import("../api/client");
      const data = { name: "John", phone: "11999999999" };
      await customersApi.create(data);

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe("POST");
    });
  });

  describe("servicesApi", () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue("test-token");
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    it("should call list endpoint", async () => {
      const { servicesApi } = await import("../api/client");
      await servicesApi.list();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/services"),
        expect.any(Object),
      );
    });

    it("should call delete endpoint with DELETE", async () => {
      const { servicesApi } = await import("../api/client");
      await servicesApi.delete("123");

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain("/services/123");
      expect(options.method).toBe("DELETE");
    });
  });

  describe("plansApi", () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue("test-token");
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    it("should call list endpoint", async () => {
      const { plansApi } = await import("../api/client");
      await plansApi.list();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/plans"),
        expect.any(Object),
      );
    });

    it("should call delete endpoint with DELETE", async () => {
      const { plansApi } = await import("../api/client");
      await plansApi.delete("123");

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain("/plans/123");
      expect(options.method).toBe("DELETE");
    });
  });

  describe("tenantApi", () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue("test-token");
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    it("should call getCurrent endpoint", async () => {
      const { tenantApi } = await import("../api/client");
      await tenantApi.getCurrent();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/tenants/me"),
        expect.any(Object),
      );
    });

    it("should call update endpoint with PATCH", async () => {
      const { tenantApi } = await import("../api/client");
      await tenantApi.update({ name: "New Name" });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain("/tenants/me");
      expect(options.method).toBe("PATCH");
    });
  });
});
