/**
 * Phone number utilities for Brazilian phone numbers
 */

/**
 * Sanitize a phone number by removing all non-numeric characters except the leading +
 * Input: "+55 11 91234-4321" or "+55 (11) 91234-4321"
 * Output: "+5511912344321"
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return "";

  // Keep the + if it exists at the start, then keep only digits
  const hasPlus = phone.startsWith("+");
  const digitsOnly = phone.replace(/\D/g, "");

  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

/**
 * Format a phone number for display
 * Input: "+5511912344321"
 * Output: "+55 (11) 91234-4321"
 */
export function formatPhoneDisplay(phone: string): string {
  const sanitized = sanitizePhone(phone);

  // Check if it's a Brazilian number with country code
  if (sanitized.startsWith("+55") && sanitized.length >= 13) {
    const ddd = sanitized.slice(3, 5);
    const number = sanitized.slice(5);

    // Format as +55 (DD) NNNNN-NNNN for 9-digit numbers
    if (number.length === 9) {
      return `+55 (${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`;
    }
    // Format as +55 (DD) NNNN-NNNN for 8-digit numbers
    if (number.length === 8) {
      return `+55 (${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;
    }
  }

  return sanitized;
}

/**
 * Validate a Brazilian phone number
 * Expects format: +55DDNNNNNNNNN (13 or 14 digits total with country code)
 */
export function isValidBrazilianPhone(phone: string): boolean {
  const sanitized = sanitizePhone(phone);

  // Must start with +55
  if (!sanitized.startsWith("+55")) return false;

  // DDD must be 2 digits (11-99 range)
  const ddd = sanitized.slice(3, 5);
  const dddNum = parseInt(ddd, 10);
  if (dddNum < 11 || dddNum > 99) return false;

  // Phone number must be 8 or 9 digits
  const number = sanitized.slice(5);
  if (number.length < 8 || number.length > 9) return false;

  return true;
}
