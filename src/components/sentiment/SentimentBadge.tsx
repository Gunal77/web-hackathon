import type { Sentiment } from "@/lib/types/manu";
import { Badge } from "@/components/ui/Badge";

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const map: Record<Sentiment, string> = {
    Positive: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    Neutral: "bg-slate-50 text-slate-700 ring-slate-200",
    Negative: "bg-orange-50 text-orange-700 ring-orange-100",
    "Severe Distress": "bg-red-50 text-red-700 ring-red-100"
  };

  return <Badge colorClassName={map[sentiment]}>{sentiment}</Badge>;
}

