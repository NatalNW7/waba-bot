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

interface AuthContextType {
  user: IUserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(
    async (token: string): Promise<IUserSession | null> => {
      try {
        const response = await fetch(`${BACKEND_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Session invalid");
        }

        return (await response.json()) as IUserSession;
      } catch {
        return null;
      }
    },
    [],
  );

  const refreshSession = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const session = await fetchSession(token);
    if (session) {
      setUser(session);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
    setIsLoading(false);
  }, [fetchSession]);

  const login = useCallback(
    async (token: string) => {
      localStorage.setItem(TOKEN_KEY, token);
      const session = await fetchSession(token);
      if (session) {
        setUser(session);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        throw new Error("Invalid token");
      }
    },
    [fetchSession],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

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
  return localStorage.getItem(TOKEN_KEY);
}
