"use client";

import {
  getSeasonalForecasts,
  getDeptSlaPredictions,
  getDistrictCriticalPredictions
} from "@/lib/utils/prediction";

interface Props {
  district: string;
  dateFrom: Date;
  dateTo: Date;
}

export function PredictionForecastingTab({
  district,
  dateFrom,
  dateTo
}: Props) {
  const seasonal = getSeasonalForecasts(district, dateFrom, dateTo);
  const slaPred = getDeptSlaPredictions(district);
  const criticalPred = getDistrictCriticalPredictions(district);

  return (
    <div className="space-y-4">
      <section>
        <p className="text-xs font-medium text-slate-700">
          Seasonal issue forecasting
        </p>
        <div className="mt-2 space-y-2">
          {seasonal.map((s) => (
            <div
              key={s.department}
              className="rounded-lg border border-surface-200 bg-white p-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-800">
                  {s.department}
                </span>
                <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                  +{s.expectedIncreasePct}%
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-500">
                High-risk: {s.highRiskMonths.join(", ")}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-600 italic">
                {s.reason}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs font-medium text-slate-700">
          Departments likely to miss SLA
        </p>
        <div className="mt-2 space-y-2">
          {slaPred
            .filter((p) => p.likelyToMissSla)
            .map((p) => (
              <div
                key={p.department}
                className="rounded-lg border border-rose-200 bg-rose-50/50 p-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-rose-800">
                    {p.department}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {p.confidence} confidence
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-600">{p.reason}</p>
              </div>
            ))}
        </div>
      </section>

      <section>
        <p className="text-xs font-medium text-slate-700">
          Districts likely to generate critical petitions
        </p>
        <div className="mt-2 space-y-2">
          {criticalPred
            .filter((p) => p.likelyCritical)
            .map((p) => (
              <div
                key={p.district}
                className="rounded-lg border border-amber-200 bg-amber-50/50 p-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-800">
                    {p.district}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {p.confidence} confidence
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-600">{p.reason}</p>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
