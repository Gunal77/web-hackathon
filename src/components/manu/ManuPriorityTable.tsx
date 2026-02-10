"use client";

import type { Manu } from "@/lib/types/manu";
import { sortByPriority } from "@/lib/utils/scoring";
import { RiskBadge } from "@/components/risk/RiskBadge";
import { SentimentBadge } from "@/components/sentiment/SentimentBadge";
import { Table } from "@/components/ui/Table";

interface Props {
  manus: Manu[];
  scopeLabel?: string;
  hideCitizenFields?: boolean;
}

export function ManuPriorityTable({
  manus,
  scopeLabel,
  hideCitizenFields
}: Props) {
  const sorted = sortByPriority(manus);

  const headers = [
    "Manu ID",
    "Citizen",
    "District / Taluk",
    "Department",
    "Risk",
    "Sentiment",
    "Pending (days)",
    "Priority"
  ].filter((h) => {
    if (hideCitizenFields && ["Risk", "Sentiment", "Priority"].includes(h)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">
        Sorted by risk- and sentiment-based priority, not by submission time.
        {scopeLabel ? ` Scope: ${scopeLabel}.` : null}
      </p>
      <Table headers={headers}>
        {sorted.map((m) => (
          <div
            key={m.id}
            className="border-b border-slate-100 last:border-0 md:table-row"
          >
            <div className="flex justify-between px-3 py-2 text-xs font-medium text-slate-500 md:hidden">
              <span>ID {m.id}</span>
              <span>{m.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 px-3 pb-3 text-sm md:table-row md:border-0 md:px-4 md:py-2">
              <div className="md:table-cell md:align-middle">
                <div className="text-xs font-semibold text-slate-700 md:text-sm">
                  {m.id}
                </div>
                <div className="text-xs text-slate-500 md:hidden">
                  {m.district} / {m.taluk}
                </div>
              </div>
              <div className="md:table-cell md:align-middle">
                <div className="text-xs text-slate-700 md:text-sm">
                  {m.citizenName}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500 md:hidden">
                  {m.departmentCategory}
                </div>
              </div>
              <div className="md:table-cell md:align-middle">
                <div className="hidden text-sm text-slate-700 md:block">
                  {m.district} / {m.taluk}
                </div>
              </div>
              <div className="md:table-cell md:align-middle">
                <span className="text-sm text-slate-700">
                  {m.departmentCategory}
                </span>
              </div>
              {!hideCitizenFields && (
                <>
                  <div className="md:table-cell md:align-middle">
                    <RiskBadge risk={m.riskLevel} />
                  </div>
                  <div className="md:table-cell md:align-middle">
                    <SentimentBadge sentiment={m.sentiment} />
                  </div>
                </>
              )}
              <div className="md:table-cell md:align-middle">
                <span className="text-sm text-slate-800">
                  {m.pendingDays}
                </span>
              </div>
              {!hideCitizenFields && (
                <div className="md:table-cell md:align-middle">
                  <span className="text-sm font-semibold text-slate-900">
                    {m.priorityScore}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </Table>
    </div>
  );
}

