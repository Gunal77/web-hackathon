"use client";

import { useState, useRef } from "react";
import type { DistrictPerformance } from "@/lib/utils/performance";

interface Props {
  data: DistrictPerformance[];
  selectedDistrict: string | null;
  onSelectDistrict: (d: string | null) => void;
}

const riskColors = {
  Low: "bg-emerald-100 border-emerald-300 text-emerald-800",
  Medium: "bg-amber-100 border-amber-300 text-amber-800",
  High: "bg-rose-100 border-rose-300 text-rose-800"
};

export function DistrictPerformanceTab({
  data,
  selectedDistrict,
  onSelectDistrict
}: Props) {
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    total: number;
    byDistrict: Record<string, number>;
    byTaluk: Record<string, number>;
    critical: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selected = selectedDistrict
    ? data.find((d) => d.district === selectedDistrict)
    : null;

  const handleBulkUpload = () => {
    setBulkUploadOpen(true);
    setUploadResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      const headers = lines[0]?.toLowerCase().split(",") ?? [];
      const rows = lines.slice(1);
      const districtIdx = headers.findIndex((h) =>
        h.includes("district")
      );
      const talukIdx = headers.findIndex((h) => h.includes("taluk"));
      const descIdx = headers.findIndex((h) =>
        h.includes("desc") || h.includes("description")
      );

      const byDistrict: Record<string, number> = {};
      const byTaluk: Record<string, number> = {};
      let critical = 0;
      const critWords = ["urgent", "suicide", "emergency", "critical", "frustrat"];

      rows.forEach((row) => {
        const cells = row.split(",").map((c) => c.trim());
        const district = districtIdx >= 0 ? cells[districtIdx] ?? "Unknown" : "Unknown";
        const taluk = talukIdx >= 0 ? cells[talukIdx] ?? "Unknown" : "Unknown";
        const desc = descIdx >= 0 ? (cells[descIdx] ?? "").toLowerCase() : "";

        byDistrict[district] = (byDistrict[district] ?? 0) + 1;
        byTaluk[`${district} · ${taluk}`] =
          (byTaluk[`${district} · ${taluk}`] ?? 0) + 1;
        if (critWords.some((w) => desc.includes(w))) critical += 1;
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

  const districtsToImprove = data.filter((d) => d.needsFocus);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-700">
          Select district
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
        {data.map((row) => (
          <button
            key={row.district}
            type="button"
            onClick={() =>
              onSelectDistrict(
                selectedDistrict === row.district ? null : row.district
              )
            }
            className={`rounded border px-2 py-1.5 text-left text-[11px] transition ${
              selectedDistrict === row.district
                ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                : riskColors[row.riskLevel]
            }`}
          >
            <span className="truncate block">{row.district}</span>
            {row.isBest && (
              <span className="text-amber-600" title="Best performing">★</span>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <div className="rounded-lg border border-surface-200 bg-surface-50 p-3 text-xs">
          <p className="font-medium text-slate-800">{selected.district}</p>
          <div className="mt-1.5 space-y-1 text-slate-600">
            <p>Total: {selected.total} · Critical: {selected.critical}</p>
            <p>Avg resolution: {selected.avgResolutionDays}d</p>
            <p>Best dept: {selected.bestDepartment}</p>
            <p>Worst dept: {selected.worstDepartment}</p>
            <p className="font-medium">
              Risk: {selected.riskLevel}
            </p>
          </div>
        </div>
      )}

      {districtsToImprove.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-2">
          <p className="text-[11px] font-medium text-amber-800">
            Districts to improve
          </p>
          <p className="mt-0.5 text-[10px] text-amber-700">
            {districtsToImprove
              .slice(0, 3)
              .map((d) => d.district)
              .join(", ")}
          </p>
        </div>
      )}

      <div className="border-t border-surface-100 pt-3">
        <button
          type="button"
          onClick={handleBulkUpload}
          className="w-full rounded-lg border border-brand-300 bg-brand-50 py-2 text-xs font-medium text-brand-700 hover:bg-brand-100"
        >
          Bulk Petition Upload
        </button>

        {bulkUploadOpen && (
          <div className="mt-2 rounded-lg border border-surface-200 bg-white p-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded border border-surface-200 bg-surface-50 py-2 text-xs font-medium text-slate-700 hover:bg-surface-100"
            >
              Choose CSV/Excel
            </button>
            <p className="mt-1 text-[10px] text-slate-500">
              Columns: title, description, department, district, taluk, priority
            </p>
            {uploadResult && (
              <div className="mt-2 rounded bg-emerald-50 p-2 text-[11px] text-emerald-800">
                <p className="font-medium">Routed {uploadResult.total} petitions</p>
                <p>Critical flagged: {uploadResult.critical}</p>
                <p className="mt-1">
                  Districts: {Object.keys(uploadResult.byDistrict).length}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
