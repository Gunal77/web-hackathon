"use client";

import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { tamilNaduDistricts } from "@/lib/mock-data/manus";

export function formatDateInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function parseDateInput(value: string, fallback: Date): Date {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

export function getInitialRange(): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 30);
  return { from, to };
}

type DatePreset = "LAST_7" | "LAST_30" | "THIS_MONTH" | "LAST_90";

interface CollectorFiltersProps {
  district: string;
  onDistrictChange: (v: string) => void;
  from: Date;
  to: Date;
  onRangeChange: (range: { from: Date; to: Date }) => void;
}

export function CollectorFilters({
  district,
  onDistrictChange,
  from,
  to,
  onRangeChange
}: CollectorFiltersProps) {
  const handlePreset = (key: DatePreset) => {
    const toDate = new Date();
    const fromDate = new Date();
    if (key === "LAST_7") fromDate.setDate(toDate.getDate() - 7);
    else if (key === "LAST_30") fromDate.setDate(toDate.getDate() - 30);
    else if (key === "LAST_90") fromDate.setDate(toDate.getDate() - 90);
    else {
      fromDate.setDate(1);
      fromDate.setMonth(toDate.getMonth());
      fromDate.setFullYear(toDate.getFullYear());
    }
    onRangeChange({ from: fromDate, to: toDate });
  };

  return (
    <div className="rounded-2xl border border-surface-100 bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Filters
      </p>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <SearchableSelect
            label="District"
            options={["All Districts", ...tamilNaduDistricts]}
            value={district}
            onChange={onDistrictChange}
            placeholder="All Districts"
          />
          <div className="flex gap-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                From
              </label>
              <input
                type="date"
                value={formatDateInput(from)}
                onChange={(e) =>
                  onRangeChange({
                    ...{ from, to },
                    from: parseDateInput(e.target.value, from)
                  })
                }
                className="mt-1 rounded-lg border border-surface-100 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                To
              </label>
              <input
                type="date"
                value={formatDateInput(to)}
                onChange={(e) =>
                  onRangeChange({
                    ...{ from, to },
                    to: parseDateInput(e.target.value, to)
                  })
                }
                className="mt-1 rounded-lg border border-surface-100 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { key: "LAST_7", label: "Last 7 days" },
            { key: "LAST_30", label: "Last 30 days" },
            { key: "THIS_MONTH", label: "This month" },
            { key: "LAST_90", label: "Last 90 days" }
          ].map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => handlePreset(p.key as DatePreset)}
              className="rounded-full border border-surface-100 bg-surface-50 px-3 py-1 font-medium text-slate-700 hover:bg-white"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
