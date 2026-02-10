import type { SentimentDistribution } from "@/lib/utils/aggregations";

const colorMap: Record<string, string> = {
  Positive: "bg-emerald-500",
  Neutral: "bg-slate-400",
  Negative: "bg-orange-500",
  "Severe Distress": "bg-red-600"
};

export function SentimentSummaryBar({
  distribution
}: {
  distribution: SentimentDistribution[];
}) {
  const total = distribution.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="space-y-2">
      <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
        {distribution.map((d) => {
          const width = (d.count / total) * 100;
          return (
            <div
              key={d.sentiment}
              className={colorMap[d.sentiment]}
              style={{ width: `${width}%` }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
        {distribution.map((d) => (
          <div key={d.sentiment} className="flex items-center gap-1">
            <span
              className={`h-2 w-2 rounded-full ${
                colorMap[d.sentiment] ?? "bg-slate-400"
              }`}
            />
            <span>
              {d.sentiment}:{" "}
              <span className="font-semibold">{d.count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

