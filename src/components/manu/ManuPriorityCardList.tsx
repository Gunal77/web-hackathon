"use client";

import type { Manu } from "@/lib/types/manu";
import { sortByPriority } from "@/lib/utils/scoring";
import { RiskBadge } from "@/components/risk/RiskBadge";
import { SentimentBadge } from "@/components/sentiment/SentimentBadge";

export function ManuPriorityCardList({
  manus,
  scopeLabel
}: {
  manus: Manu[];
  scopeLabel?: string;
}) {
  const sorted = sortByPriority(manus);

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Ranked by risk and sentiment priority for{" "}
        <span className="font-semibold">{scopeLabel}</span>. High-risk and
        severe distress manus appear first.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {sorted.map((m) => (
          <article
            key={m.id}
            className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Manu {m.id}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {m.departmentCategory} · {m.district} / {m.taluk}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                  {m.descriptionText}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Priority
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {m.priorityScore}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {m.pendingDays} days pending
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <RiskBadge risk={m.riskLevel} />
              <SentimentBadge sentiment={m.sentiment} />
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                Status: {m.status}
              </span>
              {m.sentiment === "Severe Distress" && (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                  Needs emotional support
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

