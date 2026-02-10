import type { RiskLevel } from "@/lib/types/manu";
import { Badge } from "@/components/ui/Badge";

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const map: Record<RiskLevel, string> = {
    Low: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Moderate: "bg-amber-50 text-amber-700 ring-amber-100",
    High: "bg-orange-50 text-orange-700 ring-orange-100",
    Critical: "bg-red-50 text-red-700 ring-red-100"
  };

  return <Badge colorClassName={map[risk]}>{risk}</Badge>;
}

