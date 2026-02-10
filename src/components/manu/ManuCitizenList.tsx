import type { Manu } from "@/lib/types/manu";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface Props {
  manus: Manu[];
  onViewTracking?: (manu: Manu) => void;
}

export function ManuCitizenList({ manus, onViewTracking }: Props) {
  const headers = [
    "Manu ID",
    "District / Taluk",
    "Department",
    "Status",
    "Submitted on",
    "Pending (days)",
    onViewTracking ? "Tracking" : ""
  ].filter(Boolean) as string[];

  return (
    <Table headers={headers}>
      {manus.map((m) => (
        <div
          key={m.id}
          className="border-b border-slate-100 last:border-0 md:table-row"
        >
          <div className="px-3 py-2 text-xs font-medium text-slate-700 md:table-cell md:px-4 md:py-2">
            {m.id}
          </div>
          <div className="px-3 py-2 text-xs text-slate-700 md:table-cell md:px-4 md:py-2">
            {m.district} / {m.taluk}
          </div>
          <div className="px-3 py-2 text-xs text-slate-700 md:table-cell md:px-4 md:py-2">
            {m.departmentCategory}
          </div>
          <div className="px-3 py-2 text-xs font-medium text-slate-800 md:table-cell md:px-4 md:py-2">
            <StatusBadge status={m.status} />
          </div>
          <div className="px-3 py-2 text-xs text-slate-700 md:table-cell md:px-4 md:py-2">
            {new Date(m.createdDate).toLocaleDateString()}
          </div>
          <div className="px-3 py-2 text-xs text-slate-800 md:table-cell md:px-4 md:py-2">
            {m.pendingDays}
          </div>
          {onViewTracking && (
            <div className="px-3 py-2 text-xs text-slate-800 md:table-cell md:px-4 md:py-2">
              <button
                type="button"
                onClick={() => onViewTracking(m)}
                className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                View tracking
              </button>
            </div>
          )}
        </div>
      ))}
    </Table>
  );
}

