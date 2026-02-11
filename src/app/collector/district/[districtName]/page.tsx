"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { ManuPriorityTable } from "@/components/manu/ManuPriorityTable";
import { getTalukStatsForDistrict } from "@/lib/utils/aggregations";
import { Table } from "@/components/ui/Table";
import { useRole } from "@/components/providers/RoleProvider";
import { useManus } from "@/components/providers/ManuProvider";

export default function CollectorDistrictPage() {
  const { role } = useRole();
  const { manus: allManus } = useManus();
  const params = useParams<{ districtName: string }>();
  const router = useRouter();
  const district = decodeURIComponent(params.districtName);

  if (role !== "COLLECTOR") {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Collector district detail"
          subtitle="This view is intended for district collectors. Switch role in the header to continue."
          actions={
            <button
              type="button"
              onClick={() => router.push("/collector/dashboard")}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to collector dashboard
            </button>
          }
        />
        <Card title="Access restricted">
          <p className="text-sm text-slate-700">
            You are currently viewing the application as{" "}
            <span className="font-semibold lowercase">{role}</span>. Switch the
            role selector in the top-right corner to{" "}
            <span className="font-semibold">District collector</span> to see
            this district detail view.
          </p>
        </Card>
      </div>
    );
  }

  const manus = useMemo(
    () => allManus.filter((m) => m.district === district),
    [allManus, district]
  );

  const talukStats = getTalukStatsForDistrict(district, manus);

  const total = manus.length;
  const open = manus.filter((m) => m.status !== "Resolved").length;
  const resolved = manus.filter((m) => m.status === "Resolved").length;
  const severeDistress = manus.filter(
    (m) => m.sentiment === "Severe Distress"
  ).length;

  const avgPending =
    manus.reduce((sum, m) => sum + m.pendingDays, 0) / (manus.length || 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`District detail – ${district}`}
        subtitle="Taluk-wise comparison and risk-prioritised petition list."
        actions={
          <button
            type="button"
            onClick={() => router.push("/collector/dashboard")}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to collector dashboard
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-5">
        <Card title="Total petitions">
          <p className="text-2xl font-semibold text-slate-900">{total}</p>
        </Card>
        <Card title="Open petitions">
          <p className="text-2xl font-semibold text-orange-700">{open}</p>
        </Card>
        <Card title="Resolved">
          <p className="text-2xl font-semibold text-emerald-700">
            {resolved}
          </p>
        </Card>
        <Card title="Severe distress">
          <p className="text-2xl font-semibold text-red-700">
            {severeDistress}
          </p>
        </Card>
        <Card title="Avg pending days">
          <p className="text-2xl font-semibold text-slate-900">
            {Math.round(avgPending)}
          </p>
        </Card>
      </div>

      <Card title="Taluk-wise risk comparison">
        <Table
          headers={[
            "Taluk",
            "Total petitions",
            "High & critical",
            "Severe distress",
            "Avg pending days"
          ]}
        >
          {talukStats.map((row) => (
            <div
              key={row.taluk}
              className="border-b border-slate-100 last:border-0 md:table-row"
            >
              <div className="px-3 py-2 text-xs font-medium text-slate-800 md:table-cell md:px-4 md:py-2">
                {row.taluk}
              </div>
              <div className="px-3 py-2 text-xs text-slate-700 md:table-cell md:px-4 md:py-2">
                {row.total}
              </div>
              <div className="px-3 py-2 text-xs text-orange-700 md:table-cell md:px-4 md:py-2">
                {row.highAndCritical}
              </div>
              <div className="px-3 py-2 text-xs text-red-700 md:table-cell md:px-4 md:py-2">
                {row.severeDistressCount}
              </div>
              <div className="px-3 py-2 text-xs text-slate-700 md:table-cell md:px-4 md:py-2">
                {Math.round(row.averagePendingDays)}
              </div>
            </div>
          ))}
        </Table>
      </Card>

      <Card title="Priority-based petition listing">
        <ManuPriorityTable manus={manus} scopeLabel={`District: ${district}`} />
      </Card>
    </div>
  );
}

