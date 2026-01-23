"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { IUserSession } from "@repo/api-types";
import {
  isTokenExpired,
  getTokenErrorCode,
  getTokenRemainingTime,
} from "./token-utils";

interface AuthContextType {
  user: IUserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_STORAGE_KEY = "auth_token";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Time before expiration to trigger auto-refresh warning (5 minutes)
 */
const EXPIRATION_WARNING_MS = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Clear token and user state
   */
  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setUser(null);
  }, []);

  const fetchSession = useCallback(
    async (token: string): Promise<IUserSession | null> => {
      // Check expiration client-side first
      if (isTokenExpired(token)) {
        console.warn("Token expired, clearing session");
        clearSession();
        return null;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorCode = getTokenErrorCode(errorData);

          if (errorCode === "TOKEN_EXPIRED") {
            console.warn("Token expired (server), clearing session");
            clearSession();
            return null;
          }

          if (errorCode === "INVALID_TOKEN") {
            console.error("Invalid token, clearing session");
            clearSession();
            return null;
          }

          throw new Error("Session fetch failed");
        }

        return (await response.json()) as IUserSession;
      } catch (error) {
        console.error("Failed to fetch session:", error);
        return null;
      }
    },
    [clearSession],
  );

  const refreshSession = useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Early expiration check
    if (isTokenExpired(token)) {
      console.warn("Token expired during refresh");
      clearSession();
      setIsLoading(false);
      return;
    }

    const session = await fetchSession(token);
    if (session) {
      setUser(session);
    } else {
      clearSession();
    }
    setIsLoading(false);
  }, [fetchSession, clearSession]);

  const login = useCallback(
    async (token: string) => {
      // Validate token before storing
      if (isTokenExpired(token)) {
        throw new Error("Token is already expired");
      }

      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      const session = await fetchSession(token);
      if (session) {
        setUser(session);
      } else {
        clearSession();
        throw new Error("Invalid token");
      }
    },
    [fetchSession, clearSession],
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  /**
   * Set up automatic logout when token expires
   */
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (!token || !user) return;

    const remainingTime = getTokenRemainingTime(token);
    if (remainingTime <= 0) {
      clearSession();
      return;
    }

    // Warn if token is close to expiration
    if (remainingTime <= EXPIRATION_WARNING_MS) {
      console.warn(
        `Token expires in ${Math.round(remainingTime / 1000 / 60)} minutes`,
      );
    }

    // Auto-logout when token expires
    const timeoutId = setTimeout(() => {
      console.warn("Token expired, logging out");
      clearSession();
    }, remainingTime);

    return () => clearTimeout(timeoutId);
  }, [user, clearSession]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Get the stored auth token (for server-side or API calls)
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  // Return null if token is expired
  if (token && isTokenExpired(token)) {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    return null;
  }

  return token;
}
