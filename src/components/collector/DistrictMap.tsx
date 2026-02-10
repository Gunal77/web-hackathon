"use client";

import type { DistrictPerformance } from "@/lib/utils/performance";
import { tamilNaduDistricts } from "@/lib/mock-data/manus";

interface DistrictMapProps {
  performance: DistrictPerformance[];
  selectedDistrict: string | null;
  onSelectDistrict: (district: string | null) => void;
}

const riskColors = {
  Low: "bg-emerald-100 stroke-emerald-300 text-emerald-800 hover:bg-emerald-200",
  Medium:
    "bg-amber-100 stroke-amber-300 text-amber-800 hover:bg-amber-200",
  High: "bg-rose-100 stroke-rose-300 text-rose-800 hover:bg-rose-200"
};

export function DistrictMap({
  performance,
  selectedDistrict,
  onSelectDistrict
}: DistrictMapProps) {
  const perfByDistrict = new Map(performance.map((p) => [p.district, p]));

  return (
    <div className="rounded-2xl border border-surface-100 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">
        Tamil Nadu Districts
      </h3>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
        {tamilNaduDistricts.map((district) => {
          const perf = perfByDistrict.get(district);
          const risk = perf?.riskLevel ?? "Low";
          const isSelected = selectedDistrict === district;

          return (
            <button
              key={district}
              type="button"
              onClick={() =>
                onSelectDistrict(isSelected ? null : district)
              }
              className={`rounded-lg border-2 px-2 py-2 text-center text-[11px] font-medium transition ${
                riskColors[risk]
              } ${isSelected ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}
              title={
                perf
                  ? `${district}: ${perf.total} petitions, ${perf.critical} critical`
                  : district
              }
            >
              {district.length > 10 ? district.slice(0, 8) + "…" : district}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-emerald-200" /> Low risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-200" /> Medium risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-rose-200" /> High risk
        </span>
      </div>
    </div>
  );
}
