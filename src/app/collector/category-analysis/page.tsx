"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { getCategoryStats } from "@/lib/utils/aggregations";
import { useRole } from "@/components/providers/RoleProvider";
import { useManus } from "@/components/providers/ManuProvider";

export default function CollectorCategoryAnalysisPage() {
  const { role } = useRole();
  const { manus: all } = useManus();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  if (role !== "COLLECTOR") {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Category & risk analytics"
          subtitle="This view is intended for district collectors. Switch role in the header to continue."
        />
        <Card title="Access restricted">
          <p className="text-sm text-slate-700">
            You are currently viewing the application as{" "}
            <span className="font-semibold lowercase">{role}</span>. Switch the
            role selector in the top-right corner to{" "}
            <span className="font-semibold">District collector</span> to see
            category risk analytics.
          </p>
        </Card>
      </div>
    );
  }

  const filtered = useMemo(() => {
    if (selectedCategory === "All") return all;
    return all.filter((m) => m.departmentCategory === selectedCategory);
  }, [all, selectedCategory]);

  const stats = getCategoryStats(filtered);

  const topDistress = [...stats]
    .sort((a, b) => b.severeDistressCount - a.severeDistressCount)
    .slice(0, 3);

  const allCategories = Array.from(
    new Set(all.map((m) => m.departmentCategory))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Category & risk analytics"
        subtitle="Understand which departments carry the highest risk and emotional distress."
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-700">
          Filter the view by department category or look at cross-department
          trends.
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">
            Department category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-gov-blue-500 focus:outline-none focus:ring-1 focus:ring-gov-blue-500 md:w-60"
          >
            <option value="All">All</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Risk-level counts per category">
          <Table
            headers={[
              "Category",
              "Low",
              "Moderate",
              "High",
              "Critical",
              "Severe distress"
            ]}
          >
            {stats.map((row) => (
              <div
                key={row.category}
                className="border-b border-slate-100 last:border-0 md:table-row"
              >
                <div className="px-3 py-2 text-xs font-medium text-slate-800 md:table-cell md:px-4 md:py-2">
                  {row.category}
                </div>
                <div className="px-3 py-2 text-xs text-slate-700 md:table-cell md:px-4 md:py-2">
                  {row.byRisk.Low}
                </div>
                <div className="px-3 py-2 text-xs text-slate-700 md:table-cell md:px-4 md:py-2">
                  {row.byRisk.Moderate}
                </div>
                <div className="px-3 py-2 text-xs text-orange-700 md:table-cell md:px-4 md:py-2">
                  {row.byRisk.High}
                </div>
                <div className="px-3 py-2 text-xs text-red-700 md:table-cell md:px-4 md:py-2">
                  {row.byRisk.Critical}
                </div>
                <div className="px-3 py-2 text-xs text-red-700 md:table-cell md:px-4 md:py-2">
                  {row.severeDistressCount}
                </div>
              </div>
            ))}
          </Table>
        </Card>

        <Card title="Departments with highest emotional distress">
          <ul className="space-y-3 text-sm text-slate-800">
            {topDistress.map((row) => (
              <li key={row.category} className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{row.category}</div>
                  <div className="text-xs text-slate-500">
                    High &amp; critical petitions:{" "}
                    {row.byRisk.High + row.byRisk.Critical}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-wide text-red-700">
                    Severe distress
                  </div>
                  <div className="text-lg font-semibold text-red-700">
                    {row.severeDistressCount}
                  </div>
                </div>
              </li>
            ))}
            {topDistress.length === 0 && (
              <li className="text-sm text-slate-600">
                No severe distress petitions in the current selection.
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}

