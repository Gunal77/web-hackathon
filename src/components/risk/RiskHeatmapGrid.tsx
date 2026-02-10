import type { DistrictStats } from "@/lib/utils/aggregations";

interface Props {
  districts: DistrictStats[];
}

const colorMap: Record<DistrictStats["riskColor"], string> = {
  green: "border-emerald-100 bg-emerald-50",
  yellow: "border-amber-100 bg-amber-50",
  red: "border-red-100 bg-red-50"
};

export function RiskHeatmapGrid({ districts }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {districts.map((d) => (
        <button
          key={d.district}
          type="button"
          className={`text-left ${colorMap[d.riskColor]} group flex flex-col rounded-2xl border border-slate-100 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
          onClick={() => {
            window.location.href = `/collector/district/${encodeURIComponent(
              d.district
            )}`;
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-slate-900">
              {d.district}
            </div>
            <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-medium text-slate-700 shadow-sm">
              {d.total} manus
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-700">
            <span>
              High/Critical:{" "}
              <span className="font-semibold">{d.highAndCritical}</span>
            </span>
            <span>
              Severe distress:{" "}
              <span className="font-semibold text-red-700">
                {d.severeDistressCount}
              </span>
            </span>
            <span>
              Avg pending:{" "}
              <span className="font-semibold">{d.averagePendingDays} days</span>
            </span>
          </div>
        </button>
      ))}
      {districts.length === 0 && (
        <p className="text-sm text-slate-600">
          No manus available in the current selection.
        </p>
      )}
    </div>
  );
}

