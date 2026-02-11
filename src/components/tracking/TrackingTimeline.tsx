import type { Manu } from "@/lib/types/manu";

interface Props {
  manu: Manu;
  isOfficialView?: boolean;
}

export function TrackingTimeline({ manu, isOfficialView }: Props) {
  const submitted = new Date(manu.createdDate);
  const lastUpdated = manu.lastUpdatedDate
    ? new Date(manu.lastUpdatedDate)
    : submitted;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">
        Tracking for Petition {manu.id}
      </h3>
      <ol className="space-y-3 text-sm text-slate-700">
        <li className="flex items-start gap-3">
          <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Submitted
            </div>
            <div>
              {submitted.toLocaleString()} by{" "}
              <span className="font-semibold">{manu.citizenName}</span>
            </div>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <div className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Routed to department
            </div>
            <div>
              {manu.departmentCategory} department · {manu.district} /{" "}
              {manu.taluk}
            </div>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Current status
            </div>
            <div>
              Status: <span className="font-semibold">{manu.status}</span> ·
              Last updated on {lastUpdated.toLocaleString()} ·{" "}
              <span className="font-semibold">{manu.pendingDays}</span> days
              pending
            </div>
          </div>
        </li>
        {isOfficialView && (
          <li className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Internal analysis
              </div>
              <div>
                Sentiment:{" "}
                <span className="font-semibold">{manu.sentiment}</span> ·
                Risk level:{" "}
                <span className="font-semibold">{manu.riskLevel}</span> ·
                Priority score:{" "}
                <span className="font-semibold">{manu.priorityScore}</span>
              </div>
            </div>
          </li>
        )}
      </ol>
      {!isOfficialView && (
        <p className="mt-2 text-xs text-slate-500">
          Internal analysis (sentiment and risk) is used by officials for
          prioritisation and is not shown in the citizen view.
        </p>
      )}
    </div>
  );
}

