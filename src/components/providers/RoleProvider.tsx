"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { UserRole } from "@/lib/types/manu";

interface RoleContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

const ROLE_STORAGE_KEY = "petition-platform-role";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("COLLECTOR");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(ROLE_STORAGE_KEY) as
      | UserRole
      | null;
    if (stored) {
      setRoleState(stored);
    }
  }, []);

  const setRole = (next: UserRole) => {
    setRoleState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ROLE_STORAGE_KEY, next);
    }
  };

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      setRole
    }),
    [role]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return ctx;
}

