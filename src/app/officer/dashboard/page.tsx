"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { ManuPriorityCardList } from "@/components/manu/ManuPriorityCardList";
import { useRole } from "@/components/providers/RoleProvider";
import { StatCard } from "@/components/ui/StatCard";
import { SimpleBarChart } from "@/components/charts/SimpleBarChart";
import { useManus } from "@/components/providers/ManuProvider";

type OfficerFilter = "ALL" | "HIGH_CRITICAL" | "SEVERE_DISTRESS" | "BACKLOG";

export default function OfficerDashboardPage() {
  const { role } = useRole();
  const { manus: all } = useManus();
  const allTaluks = Array.from(
    new Set(all.map((m) => `${m.district} – ${m.taluk}`))
  );

  const [selectedTaluk, setSelectedTaluk] = useState<string>(
    allTaluks[0] ?? ""
  );
  const [filter, setFilter] = useState<OfficerFilter>("ALL");

  const [district, taluk] = selectedTaluk.split(" – ");

  const manus = useMemo(
    () =>
      all.filter(
        (m) => m.district === district && m.taluk === taluk
      ),
    [all, district, taluk]
  );

  const highAndCritical = manus.filter((m) =>
    ["High", "Critical"].includes(m.riskLevel)
  );
  const severeDistress = manus.filter(
    (m) => m.sentiment === "Severe Distress"
  );
  const backlogOver14 = manus.filter((m) => m.pendingDays > 14);
  const riskLevelCounts = {
    Low: manus.filter((m) => m.riskLevel === "Low").length,
    Moderate: manus.filter((m) => m.riskLevel === "Moderate").length,
    High: manus.filter((m) => m.riskLevel === "High").length,
    Critical: manus.filter((m) => m.riskLevel === "Critical").length
  };

  if (role !== "TALUK_OFFICER") {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Taluk officer dashboard"
          subtitle="This view is intended for taluk officers. Switch role in the header to continue."
        />
        <Card title="Access restricted">
          <p className="text-sm text-slate-700">
            You are currently viewing the application as{" "}
            <span className="font-semibold lowercase">{role}</span>. Switch the
            role selector in the top-right corner to{" "}
            <span className="font-semibold">Taluk officer</span> to see this
            dashboard.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Taluk officer dashboard"
        subtitle="Prioritised queue of manus for a specific taluk, focussed on high-risk and severe distress cases."
        actions={
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Taluk
            </label>
            <select
              value={selectedTaluk}
              onChange={(e) => setSelectedTaluk(e.target.value)}
              className="mt-1 w-64 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-gov-blue-500 focus:outline-none focus:ring-1 focus:ring-gov-blue-500"
            >
              {allTaluks.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Total manus"
          value={manus.length}
          tone="primary"
          onClick={() => setFilter("ALL")}
          active={filter === "ALL"}
        />
        <StatCard
          label="High & critical"
          value={highAndCritical.length}
          tone="warning"
          onClick={() => setFilter("HIGH_CRITICAL")}
          active={filter === "HIGH_CRITICAL"}
        />
        <StatCard
          label="Severe distress"
          value={severeDistress.length}
          tone="danger"
          onClick={() => setFilter("SEVERE_DISTRESS")}
          active={filter === "SEVERE_DISTRESS"}
        />
        <StatCard
          label="Backlog > 14 days"
          value={backlogOver14.length}
          tone="neutral"
          onClick={() => setFilter("BACKLOG")}
          active={filter === "BACKLOG"}
        />
      </div>

      <Card title="Risk level mix in this taluk">
        <SimpleBarChart
          data={[
            { label: "Low", value: riskLevelCounts.Low, color: "#10B981" },
            {
              label: "Moderate",
              value: riskLevelCounts.Moderate,
              color: "#6366F1"
            },
            {
              label: "High",
              value: riskLevelCounts.High,
              color: "#F59E0B"
            },
            {
              label: "Critical",
              value: riskLevelCounts.Critical,
              color: "#F97373"
            }
          ]}
        />
      </Card>

      <Card title="Top manus to address now">
        <ManuPriorityCardList
          manus={(() => {
            if (filter === "HIGH_CRITICAL") return highAndCritical;
            if (filter === "SEVERE_DISTRESS") return severeDistress;
            if (filter === "BACKLOG") return backlogOver14;
            return manus;
          })()}
          scopeLabel={`${district} – ${taluk}`}
        />
      </Card>
    </div>
  );
}

