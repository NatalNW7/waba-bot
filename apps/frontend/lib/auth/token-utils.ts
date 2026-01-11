/**
 * JWT Payload structure (decoded without verification)
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId?: string;
  customerId?: string;
  iat: number;
  exp: number;
}

/**
 * Token error codes returned by the backend
 */
export type TokenErrorCode = "TOKEN_EXPIRED" | "INVALID_TOKEN";

/**
 * Parse a JWT token without verification.
 * For client-side inspection only - server must verify authenticity.
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;

    const payload = atob(base64Payload);
    return JSON.parse(payload) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Check if a token has expired based on its exp claim.
 * @param token - JWT token string
 * @returns true if expired or invalid, false if still valid
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

/**
 * Get the expiration date of a token.
 * @param token - JWT token string
 * @returns Expiration Date or null if invalid
 */
export function getTokenExpirationDate(token: string): Date | null {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return null;
  return new Date(payload.exp * 1000);
}

/**
 * Get remaining time until token expires in milliseconds.
 * @param token - JWT token string
 * @returns Remaining time in ms, or 0 if expired/invalid
 */
export function getTokenRemainingTime(token: string): number {
  const expirationDate = getTokenExpirationDate(token);
  if (!expirationDate) return 0;
  return Math.max(0, expirationDate.getTime() - Date.now());
}

/**
 * Check if the error response indicates a token error.
 * @param error - Error response from API
 * @returns TokenErrorCode if token error, null otherwise
 */
export function getTokenErrorCode(error: unknown): TokenErrorCode | null {
  if (typeof error === "object" && error !== null) {
    const errorObj = error as Record<string, unknown>;
    if (errorObj.code === "TOKEN_EXPIRED") return "TOKEN_EXPIRED";
    if (errorObj.code === "INVALID_TOKEN") return "INVALID_TOKEN";
  }
  return null;
}
