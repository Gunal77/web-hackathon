"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { HeaderBar } from "@/components/layout/HeaderBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="flex h-screen max-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <HeaderBar />
          <main className="flex-1 overflow-y-auto bg-surface-50">
            <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
              {children}
            </div>
          </main>
          <footer className="border-t border-slate-200 bg-white/90">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-xs text-slate-500 md:px-8">
              <span>Mudhalvarin Mugavari – Analytics overlay (demo only)</span>
              <span className="hidden md:inline">
                Risk · Sentiment · District &amp; Taluk visibility
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

