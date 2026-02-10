import type { ReactNode } from "react";

type Tone = "primary" | "success" | "warning" | "danger" | "neutral";

const toneMap: Record<Tone, string> = {
  primary: "bg-brand-50 text-slate-900",
  success: "bg-emerald-50 text-emerald-900",
  warning: "bg-amber-50 text-amber-900",
  danger: "bg-rose-50 text-rose-900",
  neutral: "bg-surface-50 text-slate-900"
};

type Trend = "up" | "down" | "flat";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  tone?: Tone;
  helperText?: string;
  trend?: Trend;
  onClick?: () => void;
  active?: boolean;
}

export function StatCard({
  label,
  value,
  icon,
  tone = "neutral",
  helperText,
  trend = "flat",
  onClick,
  active
}: StatCardProps) {
  const clickable = Boolean(onClick);

  const trendClass =
    trend === "up"
      ? "text-emerald-600"
      : trend === "down"
        ? "text-rose-600"
        : "text-slate-500";

  return (
    <section
      onClick={onClick}
      className={`flex items-center justify-between gap-3 rounded-2xl p-4 shadow-sm transition ${
        toneMap[tone]
      } ${
        clickable ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : ""
      } ${active ? "ring-2 ring-brand-500" : ""}`}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold leading-tight">{value}</p>
        {helperText && (
          <p className={`mt-1 text-xs ${trendClass}`}>{helperText}</p>
        )}
      </div>
      {icon && (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/70 text-slate-600 shadow-sm">
          {icon}
        </div>
      )}
    </section>
  );
}

