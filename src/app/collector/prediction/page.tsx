"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CollectorFilters, getInitialRange } from "@/components/collector/CollectorFilters";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import {
  getSeasonalForecasts,
  getDeptSlaPredictions,
  getDistrictCriticalPredictions,
  type SeasonalForecast,
  type DeptSlaPrediction,
  type DistrictCriticalPrediction
} from "@/lib/utils/prediction";
import { tamilNaduDistricts } from "@/lib/mock-data/manus";

const FILTER_KEY = "collector-prediction-filters";

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

export default function PredictionPage() {
  const [district, setDistrict] = useState("All Districts");
  const [range, setRange] = useState(getInitialRange);
  const [deptFilter, setDeptFilter] = useState("All Departments");

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

  const selDistrict = district === "All Districts" ? "" : district;

  const seasonal = getSeasonalForecasts(selDistrict, range.from, range.to);
  const slaPredictions = getDeptSlaPredictions(selDistrict);
  const districtPredictions = getDistrictCriticalPredictions(selDistrict);

  const filteredSeasonal =
    deptFilter === "All Departments"
      ? seasonal
      : seasonal.filter((s) => s.department === deptFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prediction & Forecasting"
        subtitle="Forecast future issues and help departments prepare in advance. Based on historical seasonal data."
      />

      <CollectorFilters
        district={district}
        onDistrictChange={setDistrict}
        from={range.from}
        to={range.to}
        onRangeChange={setRange}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <SearchableSelect
          label="Department"
          options={[
            "All Departments",
            ...Array.from(new Set(seasonal.map((s) => s.department)))
          ]}
          value={deptFilter}
          onChange={setDeptFilter}
          placeholder="All Departments"
        />
      </div>

      <p className="text-xs text-slate-500">
        Prediction based on last 3 years seasonal data
      </p>

      <div className="space-y-6">
        <section className="rounded-2xl border border-surface-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            Seasonal Predictions
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Expected petition increase by department
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSeasonal.map((f) => (
              <SeasonalCard key={f.department} forecast={f} />
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-surface-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Departments Likely to Miss SLA
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Next month risk
            </p>
            <ul className="mt-4 space-y-3">
              {slaPredictions.map((p) => (
                <SlaPredictionCard key={p.department} prediction={p} />
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-surface-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Districts – Critical Sentiment Risk
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Likely rise in critical sentiment
            </p>
            <ul className="mt-4 space-y-3">
              {districtPredictions.map((p) => (
                <DistrictPredictionCard key={p.district} prediction={p} />
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function SeasonalCard({ forecast }: { forecast: SeasonalForecast }) {
  return (
    <div className="rounded-xl border border-surface-100 bg-surface-50/50 p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-800">{forecast.department}</h4>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
          +{forecast.expectedIncreasePct}%
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-600">{forecast.reason}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {forecast.highRiskMonths.map((m) => (
          <span
            key={m}
            className="rounded bg-slate-200 px-1.5 py-0.5 text-[11px] font-medium text-slate-700"
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

function SlaPredictionCard({ prediction }: { prediction: DeptSlaPrediction }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-surface-100 bg-white p-3">
      <span
        className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
          prediction.likelyToMissSla ? "bg-rose-500" : "bg-emerald-500"
        }`}
      />
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-800">{prediction.department}</span>
          <span className="text-[11px] text-slate-500">
            ({prediction.confidence} confidence)
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-600">{prediction.reason}</p>
      </div>
    </li>
  );
}

function DistrictPredictionCard({
  prediction
}: {
  prediction: DistrictCriticalPrediction;
}) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-surface-100 bg-white p-3">
      <span
        className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
          prediction.likelyCritical ? "bg-rose-500" : "bg-emerald-500"
        }`}
      />
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-800">{prediction.district}</span>
          <span className="text-[11px] text-slate-500">
            ({prediction.confidence} confidence)
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-600">{prediction.reason}</p>
      </div>
    </li>
  );
}
