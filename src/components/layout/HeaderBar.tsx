"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/collector/district/")) return "Collector · District detail";
  if (pathname.startsWith("/collector/category-analysis"))
    return "Collector · Category analytics";
  if (pathname === "/collector/department-performance")
    return "Collector · Department Performance";
  if (pathname === "/collector/district-performance")
    return "Collector · District Performance";
  if (pathname === "/collector/prediction") return "Collector · Prediction";
  if (pathname.startsWith("/collector")) return "Collector dashboard";
  if (pathname.startsWith("/citizen")) return "Citizen dashboard";
  if (pathname.startsWith("/officer")) return "Taluk officer dashboard";
  if (pathname === "/") return "Overview";
  return "Dashboard";
}

export function HeaderBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userName, logout } = useAuth();
  const title = getPageTitle(pathname);

  const qFromUrl = searchParams.get("q") ?? "";
  const [searchValue, setSearchValue] = useState(qFromUrl);

  useEffect(() => {
    setSearchValue(qFromUrl);
  }, [qFromUrl]);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = searchValue.trim();
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router, searchParams, searchValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-surface-100 bg-white/90 px-4 shadow-sm backdrop-blur md:px-6">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Government of Tamil Nadu · Hackathon
        </p>
        <h1 className="truncate text-sm font-semibold text-slate-900 md:text-base">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        <div className="hidden items-center gap-2 rounded-full border border-surface-100 bg-surface-50 px-3 py-1.5 text-xs text-slate-500 md:flex">
          <span aria-hidden="true" className="text-sm opacity-70">
            🔍
          </span>
          <input
            type="search"
            placeholder="Search petitions, districts, taluks"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-52 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            aria-label="Search petitions, districts, and taluks"
          />
        </div>
        <div className="flex items-center gap-2 rounded-full border border-surface-100 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
          <span className="hidden text-[11px] font-medium text-slate-500 md:inline">
            Viewing as
          </span>
          <span>{userName ?? "District collector"}</span>
        </div>
        <button
          type="button"
          className="hidden h-8 w-8 items-center justify-center rounded-full border border-surface-100 bg-white text-slate-500 shadow-sm hover:bg-surface-50 md:inline-flex"
          aria-label="Notifications (demo only)"
        >
          <span aria-hidden="true" className="text-sm">
            🔔
          </span>
        </button>
        <button
          type="button"
          onClick={logout}
          className="text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          Logout
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white shadow-sm">
          DC
        </div>
      </div>
    </header>
  );
}

