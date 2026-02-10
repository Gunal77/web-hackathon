import type { ReactNode } from "react";

type Tone = "primary" | "success" | "warning" | "danger" | "neutral";

const toneClasses: Record<Tone, string> = {
  primary: "bg-indigo-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  neutral: "bg-slate-400"
};

interface BarDatum {
  label: string;
  value: number;
  tone?: Tone;
  helper?: ReactNode;
}

interface VerticalBarChartProps {
  data: BarDatum[];
}

function getHeightClass(value: number, max: number): string {
  if (!max) return "h-4";
  const ratio = value / max;
  if (ratio >= 0.9) return "h-40";
  if (ratio >= 0.7) return "h-32";
  if (ratio >= 0.5) return "h-28";
  if (ratio >= 0.3) return "h-24";
  if (ratio >= 0.15) return "h-20";
  return "h-14";
}

export function VerticalBarChart({ data }: VerticalBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 0);

  return (
    <div className="flex h-56 items-end gap-4 overflow-x-auto pb-2">
      {data.map((d) => {
        const heightClass = getHeightClass(d.value, max);
        const tone = d.tone ?? "neutral";

        return (
          <div
            key={d.label}
            className="flex min-w-[64px] flex-1 flex-col items-center gap-2"
          >
            <div className="flex flex-col items-center gap-1 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">
                {d.value.toFixed(0)}
              </span>
              {d.helper && <span className="text-[11px]">{d.helper}</span>}
            </div>
            <div className="flex w-full flex-1 items-end">
              <div
                className={`w-full rounded-t-xl ${heightClass} ${toneClasses[tone]} bg-gradient-to-t from-white/40`}
              />
            </div>
            <div className="mt-1 w-full text-center text-[11px] font-medium text-slate-500">
              {d.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

