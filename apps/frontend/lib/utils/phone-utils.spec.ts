import {
  sanitizePhone,
  formatPhoneDisplay,
  isValidBrazilianPhone,
} from "./phone-utils";

describe("phone-utils", () => {
  describe("sanitizePhone", () => {
    it("should remove spaces and dashes from phone number", () => {
      expect(sanitizePhone("+55 11 91234-4321")).toBe("+5511912344321");
    });

    it("should remove parentheses from phone number", () => {
      expect(sanitizePhone("+55 (11) 91234-4321")).toBe("+5511912344321");
    });

    it("should preserve the + prefix", () => {
      expect(sanitizePhone("+55 11 912344321")).toBe("+5511912344321");
    });

    it("should handle phone without + prefix", () => {
      expect(sanitizePhone("55 11 912344321")).toBe("5511912344321");
    });

    it("should handle empty string", () => {
      expect(sanitizePhone("")).toBe("");
    });

    it("should handle null/undefined gracefully", () => {
      expect(sanitizePhone(null as unknown as string)).toBe("");
      expect(sanitizePhone(undefined as unknown as string)).toBe("");
    });

    it("should remove all non-numeric characters except leading +", () => {
      expect(sanitizePhone("+55-11-91234.4321")).toBe("+5511912344321");
    });
  });

  describe("formatPhoneDisplay", () => {
    it("should format 9-digit Brazilian number correctly", () => {
      expect(formatPhoneDisplay("+5511912344321")).toBe("+55 (11) 91234-4321");
    });

    it("should format 8-digit Brazilian number correctly", () => {
      expect(formatPhoneDisplay("+551112344321")).toBe("+55 (11) 1234-4321");
    });

    it("should handle already formatted input", () => {
      expect(formatPhoneDisplay("+55 (11) 91234-4321")).toBe(
        "+55 (11) 91234-4321",
      );
    });
  });

  describe("isValidBrazilianPhone", () => {
    it("should return true for valid 9-digit mobile number", () => {
      expect(isValidBrazilianPhone("+5511912344321")).toBe(true);
    });

    it("should return true for valid 8-digit landline number", () => {
      expect(isValidBrazilianPhone("+551112344321")).toBe(true);
    });

    it("should return false for number without country code", () => {
      expect(isValidBrazilianPhone("11912344321")).toBe(false);
    });

    it("should return false for invalid DDD", () => {
      expect(isValidBrazilianPhone("+5500912344321")).toBe(false);
    });

    it("should return false for too short number", () => {
      expect(isValidBrazilianPhone("+55111234")).toBe(false);
    });
  });
});
