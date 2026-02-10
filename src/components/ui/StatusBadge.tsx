import type { ManuStatus } from "@/lib/types/manu";
import { Badge } from "@/components/ui/Badge";

const statusMap: Record<ManuStatus, string> = {
  Submitted: "bg-slate-100 text-slate-700 ring-slate-200",
  "In Progress": "bg-amber-50 text-amber-800 ring-amber-100",
  Resolved: "bg-emerald-50 text-emerald-800 ring-emerald-100"
};

export function StatusBadge({ status }: { status: ManuStatus }) {
  return <Badge colorClassName={statusMap[status]}>{status}</Badge>;
}

