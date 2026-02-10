"use client";

import type { DepartmentPerformance as DeptPerf } from "@/lib/utils/performance";

interface Props {
  data: DeptPerf[];
  selectedDept: string | null;
  onSelectDept: (dept: string | null) => void;
}

const perfColors = {
  good: "bg-emerald-50 border-emerald-200 text-emerald-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  poor: "bg-rose-50 border-rose-200 text-rose-800"
};

export function DepartmentPerformanceTab({
  data,
  selectedDept,
  onSelectDept
}: Props) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Click a department to highlight it across the dashboard.
      </p>
      <div className="space-y-2">
        {data.map((row) => (
          <button
            key={row.department}
            type="button"
            onClick={() =>
              onSelectDept(selectedDept === row.department ? null : row.department)
            }
            className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
              selectedDept === row.department
                ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                : "border-surface-100 bg-white hover:bg-surface-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-800">
                {row.department}
              </span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                  perfColors[row.performance]
                }`}
              >
                {row.performance === "good" ? "Good" : row.performance === "warning" ? "Warning" : "Poor"}
              </span>
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-slate-600">
              <span title="Total petitions received">Total: {row.total}</span>
              <span title="Average days from submission to first action">1st action: {row.avgTimeToFirstAction}d</span>
              <span title="Average days from submission to resolution">Complete: {row.avgTimeToComplete}d</span>
              <span title="Share of completed petitions that exceeded SLA target">SLA breach: {row.slaBreachPct}%</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
