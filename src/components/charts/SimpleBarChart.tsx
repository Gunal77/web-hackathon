"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: BarDatum[];
}

export function SimpleBarChart({ data }: SimpleBarChartProps) {
  const chartData = data.map((d) => ({
    name: d.label,
    value: d.value,
    fill: d.color ?? "#4F46E5"
  }));

  return (
    <div className="h-64 min-h-[200px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 24, left: -20, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#6B7280" }}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
          />
          <Tooltip
            cursor={{ fill: "rgba(79,70,229,0.04)" }}
            contentStyle={{
              borderRadius: 12,
              borderColor: "#E5E7EB",
              boxShadow:
                "0 10px 15px -3px rgba(15,23,42,0.08), 0 4px 6px -4px rgba(15,23,42,0.06)"
            }}
          />
          <Bar
            dataKey="value"
            radius={[10, 10, 4, 4]}
            maxBarSize={56}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

