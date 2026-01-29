/**
 * API Configuration
 * Centralized configuration for backend API calls with authentication
 */

const BACKEND_URL = process.env.BACKEND_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/**
 * API configuration object
 */
export const apiConfig = {
  baseUrl: BACKEND_URL,
  endpoints: {
    login: "auth/login",
    saasPlans: "saas-plans",
  },
} as const;

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Get authentication token
 * Fetches a fresh token for server-side requests
 */
async function getAuthToken(): Promise<string> {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required",
    );
  }

  const response = await fetch(
    `${apiConfig.baseUrl}${apiConfig.endpoints.login}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
      // Disable caching for auth requests
      cache: "no-store",
    },
  );
  console.log(response);
  if (!response.ok) {
    throw new ApiError(
      "Authentication failed",
      response.status,
      response.statusText,
    );
  }

  const data = (await response.json()) as { accessToken: string };
  return data.accessToken;
}

/**
 * Authenticated fetch wrapper with error handling
 * @param endpoint - API endpoint (relative to base URL)
 * @param options - Fetch options
 * @returns Parsed JSON response
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${apiConfig.baseUrl}${endpoint}`;
  const token = await getAuthToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    // Cache the data request for 60 seconds
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new ApiError(
      `API request failed: ${response.statusText}`,
      response.status,
      response.statusText,
    );
  }

  return response.json() as Promise<T>;
}
