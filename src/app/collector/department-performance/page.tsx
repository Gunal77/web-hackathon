"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { CollectorFilters, getInitialRange } from "@/components/collector/CollectorFilters";
import { useManus } from "@/components/providers/ManuProvider";
import {
  computeDepartmentPerformance,
  type DepartmentPerformance,
  type PerformanceLevel
} from "@/lib/utils/performance";
import { tamilNaduDistricts } from "@/lib/mock-data/manus";

const FILTER_KEY = "collector-dept-perf-filters";

function loadFilters() {
  if (typeof window === "undefined") {
    return { district: "All Districts", ...getInitialRange() };
  }
  try {
    const raw = sessionStorage.getItem(FILTER_KEY);
    if (!raw) return { district: "All Districts", ...getInitialRange() };
    const parsed = JSON.parse(raw);
    return {
      district: parsed.district ?? "All Districts",
      from: parsed.from ? new Date(parsed.from) : getInitialRange().from,
      to: parsed.to ? new Date(parsed.to) : getInitialRange().to
    };
  } catch {
    return { district: "All Districts", ...getInitialRange() };
  }
}

function isWithinRange(dateStr: string, from: Date, to: Date) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  return d >= from && d <= to;
}

const perfColors: Record<PerformanceLevel, string> = {
  good: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  poor: "bg-rose-50 text-rose-700 border-rose-200"
};

const perfLabels: Record<PerformanceLevel, string> = {
  good: "Good",
  warning: "Needs Attention",
  poor: "Poor"
};

export default function DepartmentPerformancePage() {
  const router = useRouter();
  const { manus } = useManus();
  const [district, setDistrict] = useState("All Districts");
  const [range, setRange] = useState(getInitialRange);

  useEffect(() => {
    setDistrict(loadFilters().district);
    setRange({ from: loadFilters().from, to: loadFilters().to });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(
      FILTER_KEY,
      JSON.stringify({
        district,
        from: range.from.toISOString(),
        to: range.to.toISOString()
      })
    );
  }, [district, range]);

  const filtered = useMemo(() => {
    return manus.filter((m) => {
      if (district !== "All Districts" && m.district !== district) return false;
      return isWithinRange(m.createdDate, range.from, range.to);
    });
  }, [manus, district, range]);

  const deptPerformance = useMemo(
    () =>
      computeDepartmentPerformance(
        filtered,
        district,
        range.from,
        range.to
      ),
    [filtered, district, range]
  );

  const sorted = useMemo(
    () =>
      [...deptPerformance].sort((a, b) => {
        const scoreA = a.slaBreachPct * 2 + a.avgTimeToComplete;
        const scoreB = b.slaBreachPct * 2 + b.avgTimeToComplete;
        return scoreB - scoreA;
      }),
    [deptPerformance]
  );

  const maxAvgComplete = Math.max(
    ...sorted.map((d) => d.avgTimeToComplete),
    1
  );

  const handleDeptClick = (dept: string) => {
    const params = new URLSearchParams();
    params.set("district", district !== "All Districts" ? district : "");
    params.set("department", dept);
    params.set("from", range.from.toISOString().slice(0, 10));
    params.set("to", range.to.toISOString().slice(0, 10));
    router.push(`/collector/dashboard?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Performance"
        subtitle="Measure how efficiently each department handles petitions. Sort by worst performance."
      />

      <CollectorFilters
        district={district}
        onDistrictChange={setDistrict}
        from={range.from}
        to={range.to}
        onRangeChange={setRange}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-surface-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-surface-100 bg-surface-50/80">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Department
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Avg First Action (days)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Avg Complete (days)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      SLA Breach %
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((row) => (
                    <tr
                      key={row.department}
                      onClick={() => handleDeptClick(row.department)}
                      className="cursor-pointer border-b border-surface-50 transition hover:bg-surface-50/50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {row.department}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {row.total}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {row.avgTimeToFirstAction}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {row.avgTimeToComplete}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {row.slaBreachPct}%
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${perfColors[row.performance]}`}
                        >
                          {perfLabels[row.performance]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-surface-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            Avg Completion Time (days)
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Click department in table to view filtered petitions
          </p>
          <div className="mt-4 space-y-3">
            {sorted.slice(0, 7).map((row) => (
              <div key={row.department}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    {row.department}
                  </span>
                  <span className="text-slate-500">
                    {row.avgTimeToComplete} days
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-100">
                  <div
                    className={`h-full rounded-full ${
                      row.performance === "good"
                        ? "bg-emerald-500"
                        : row.performance === "warning"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (row.avgTimeToComplete / maxAvgComplete) * 100
                      )}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
