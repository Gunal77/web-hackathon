"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { AppShell } from "./AppShell";

export function ShellWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (isLoginPage) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoginPage, isAuthenticated, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
