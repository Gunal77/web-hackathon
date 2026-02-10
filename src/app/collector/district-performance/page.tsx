"use client";

import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CollectorFilters, getInitialRange } from "@/components/collector/CollectorFilters";
import { DistrictMap } from "@/components/collector/DistrictMap";
import { useManus } from "@/components/providers/ManuProvider";
import {
  computeDistrictPerformance,
  type DistrictPerformance
} from "@/lib/utils/performance";

const FILTER_KEY = "collector-district-perf-filters";

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

export default function DistrictPerformancePage() {
  const { manus } = useManus();
  const [district, setDistrict] = useState("All Districts");
  const [range, setRange] = useState(getInitialRange);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    total: number;
    byDistrict: Record<string, number>;
    byTaluk: Record<string, number>;
    critical: number;
  } | null>(null);

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

  const performance = useMemo(
    () => computeDistrictPerformance(filtered, range.from, range.to),
    [filtered, range]
  );

  const selectedPerf = useMemo(
    () =>
      selectedDistrict
        ? performance.find((p) => p.district === selectedDistrict) ?? null
        : null,
    [performance, selectedDistrict]
  );

  const bestDistrict = performance.find((p) => p.isBest);
  const needFocus = performance.filter((p) => p.needsFocus);
  const worstByCritical = [...performance]
    .filter((p) => p.critical > 0)
    .sort((a, b) => b.critical - a.critical)[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      const headers = lines[0]?.toLowerCase().split(",") ?? [];
      const rows = lines.slice(1);

      const byDistrict: Record<string, number> = {};
      const byTaluk: Record<string, number> = {};
      let critical = 0;

      rows.forEach((line) => {
        const cells = line.split(",").map((c) => c.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
          row[h.replace(/[\s-]/g, "").toLowerCase()] = cells[i] ?? "";
        });

        const d = row.district ?? row["district"] ?? "";
        const t = row.taluk ?? row["taluk"] ?? "";
        const desc = (row.description ?? row["description"] ?? "").toLowerCase();

        if (d) {
          byDistrict[d] = (byDistrict[d] ?? 0) + 1;
        }
        if (t) {
          byTaluk[t] = (byTaluk[t] ?? 0) + 1;
        }
        if (
          desc.includes("urgent") ||
          desc.includes("critical") ||
          desc.includes("emergency")
        ) {
          critical += 1;
        }
      });

      setUploadResult({
        total: rows.length,
        byDistrict,
        byTaluk,
        critical
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Performance"
        subtitle="Geographical monitoring of district health and risk. Click a district to view details."
      />

      <CollectorFilters
        district={district}
        onDistrictChange={setDistrict}
        from={range.from}
        to={range.to}
        onRangeChange={setRange}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-brand-500 bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
        >
          Bulk Upload Petitions
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          {selectedDistrict ? (
            selectedPerf ? (
              <DistrictDetailPanel perf={selectedPerf} />
            ) : (
              <div className="rounded-2xl border border-surface-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  No performance data for {selectedDistrict}
                </p>
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-surface-100 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Click a district on the map to view details
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-surface-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Insights</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {bestDistrict && (
                <li>
                  <span className="font-medium text-emerald-700">
                    Best performing:
                  </span>{" "}
                  {bestDistrict.district}
                </li>
              )}
              {worstByCritical && (
                <li>
                  <span className="font-medium text-rose-700">
                    Most critical:
                  </span>{" "}
                  {worstByCritical.district} ({worstByCritical.critical}{" "}
                  critical)
                </li>
              )}
              {needFocus.length > 0 && (
                <li>
                  <span className="font-medium text-amber-700">
                    Districts needing focus:
                  </span>{" "}
                  {needFocus.map((p) => p.district).join(", ")}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-3">
          <DistrictMap
            performance={performance}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={setSelectedDistrict}
          />
        </div>
      </div>

      {uploadOpen && (
        <UploadModal
          onClose={() => {
            setUploadOpen(false);
            setUploadResult(null);
          }}
          onFileSelect={handleFileUpload}
          result={uploadResult}
        />
      )}
    </div>
  );
}

function DistrictDetailPanel({ perf }: { perf: DistrictPerformance }) {
  const riskColor =
    perf.riskLevel === "Low"
      ? "text-emerald-700"
      : perf.riskLevel === "Medium"
        ? "text-amber-700"
        : "text-rose-700";

  return (
    <div className="rounded-2xl border border-surface-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">
        {perf.district}
      </h3>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Total petitions</dt>
          <dd className="font-medium text-slate-800">{perf.total}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Critical petitions</dt>
          <dd className="font-medium text-slate-800">{perf.critical}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Avg resolution time</dt>
          <dd className="font-medium text-slate-800">
            {perf.avgResolutionDays} days
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Best department</dt>
          <dd className="font-medium text-slate-800">{perf.bestDepartment}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Worst department</dt>
          <dd className="font-medium text-slate-800">{perf.worstDepartment}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Overall risk</dt>
          <dd className={`font-semibold ${riskColor}`}>{perf.riskLevel}</dd>
        </div>
      </dl>
    </div>
  );
}

function UploadModal({
  onClose,
  onFileSelect,
  result
}: {
  onClose: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  result: {
    total: number;
    byDistrict: Record<string, number>;
    byTaluk: Record<string, number>;
    critical: number;
  } | null;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-surface-100 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-surface-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            Bulk Upload Petitions
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-slate-500 hover:bg-surface-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-5">
          <p className="mb-3 text-sm text-slate-600">
            Upload CSV/Excel (50–100 petitions). Columns: title, description,
            department, district, taluk, priority.
          </p>
          <label className="block">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={onFileSelect}
              className="hidden"
            />
            <span className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-500 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100">
              Choose file
            </span>
          </label>

          {result && (
            <div className="mt-4 rounded-xl border border-surface-100 bg-surface-50/50 p-4">
              <h4 className="text-sm font-semibold text-slate-800">
                Upload summary
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>Total uploaded: {result.total}</li>
                <li>Critical sentiment detected: {result.critical}</li>
              </ul>
              {Object.keys(result.byDistrict).length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-500">
                    District-wise distribution
                  </p>
                  <ul className="mt-1 text-xs text-slate-600">
                    {Object.entries(result.byDistrict).map(([d, n]) => (
                      <li key={d}>
                        {d}: {n}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Object.keys(result.byTaluk).length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-500">
                    Taluk-wise distribution
                  </p>
                  <ul className="mt-1 text-xs text-slate-600">
                    {Object.entries(result.byTaluk).slice(0, 10).map(([t, n]) => (
                      <li key={t}>
                        {t}: {n}
                      </li>
                    ))}
                    {Object.keys(result.byTaluk).length > 10 && (
                      <li>+{Object.keys(result.byTaluk).length - 10} more</li>
                    )}
                  </ul>
                </div>
              )}
              <p className="mt-3 text-xs text-slate-500">
                Petitions routed to: Concerned District Officer, Taluk Officer,
                Department.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
