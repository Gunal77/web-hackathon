import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  rightSlot?: ReactNode;
}

export function DashboardCard({
  title,
  subtitle,
  children,
  rightSlot
}: DashboardCardProps) {
  return (
    <section className="rounded-2xl border border-surface-100 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 md:text-base">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 md:text-sm">
              {subtitle}
            </p>
          )}
        </div>
        {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}
      </div>
      {children}
    </section>
  );
}

