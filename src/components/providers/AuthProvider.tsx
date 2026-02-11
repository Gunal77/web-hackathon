"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

const AUTH_STORAGE_KEY = "petition-platform-auth";

interface AuthContextValue {
  isAuthenticated: boolean;
  userName: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Demo credentials (for hackathon only)
const DEMO_USERS: Record<string, string> = {
  collector: "collector",
  admin: "admin"
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const { user } = JSON.parse(stored);
        setIsAuthenticated(true);
        setUserName(user ?? "District collector");
      }
    } catch {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setMounted(true);
  }, []);

  const login = (username: string, password: string): boolean => {
    const normalized = username.trim().toLowerCase();
    const validPassword = DEMO_USERS[normalized];
    if (!validPassword || validPassword !== password) {
      return false;
    }
    setIsAuthenticated(true);
    setUserName(username.trim());
    sessionStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ user: username.trim() })
    );
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserName(null);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated, userName, login, logout }),
    [isAuthenticated, userName]
  );

  return (
    <AuthContext.Provider value={value}>
      {mounted ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
