"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { useRole } from "@/components/providers/RoleProvider";
import { useManus } from "@/components/providers/ManuProvider";
import { tamilNaduDistricts } from "@/lib/mock-data/manus";
import { sortByPriority } from "@/lib/utils/scoring";
import {
  generateShortSummary,
  getCriticalSentimentType
} from "@/lib/utils/ai";
import type { Manu } from "@/lib/types/manu";

const FILTER_KEY = "collector-dashboard-filters";

type DatePreset = "LAST_7" | "LAST_30" | "THIS_MONTH" | "LAST_90";
type LifecycleStatus =
  | "New"
  | "Under Review"
  | "Action Taken"
  | "Pending with Reason"
  | "Escalated"
  | "Completed";

function getInitialRange(): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 30);
  return { from, to };
}

function formatDateInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

function parseDateInput(value: string, fallback: Date): Date {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

function computePercentChange(current: number, previous: number): {
  value: string;
  trend: "up" | "down" | "flat";
} {
  if (previous === 0) {
    if (current === 0) return { value: "0% vs prev", trend: "flat" };
    return { value: "+100% vs prev", trend: "up" };
  }
  const diff = current - previous;
  const pct = (diff / previous) * 100;
  const rounded = `${diff >= 0 ? "+" : ""}${pct.toFixed(1)}% vs prev`;
  if (pct > 1) return { value: rounded, trend: "up" };
  if (pct < -1) return { value: rounded, trend: "down" };
  return { value: rounded, trend: "flat" };
}

function isWithinRange(dateStr: string, from: Date, to: Date) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  return d >= from && d <= to;
}

function mapLifecycleStatus(m: Manu): LifecycleStatus {
  // Escalation has highest precedence
  if (
    m.status === "In Progress" &&
    (m.pendingDays > 10 || ["High", "Critical"].includes(m.riskLevel))
  ) {
    return "Escalated";
  }

  if (m.status === "Resolved") {
    return "Completed";
  }

  if (m.status === "In Progress") {
    if (m.pendingDays <= 3) {
      return "Action Taken";
    }
    return "Under Review";
  }

  // Submitted
  if (m.pendingDays > 7) {
    return "Pending with Reason";
  }

  return "New";
}

const lifecycleStatusColors: Record<LifecycleStatus, string> = {
  "New": "bg-slate-100 text-slate-700",
  "Under Review": "bg-blue-50 text-blue-700",
  "Action Taken": "bg-amber-50 text-amber-700",
  "Pending with Reason": "bg-amber-50 text-amber-800",
  "Escalated": "bg-rose-50 text-rose-700",
  "Completed": "bg-emerald-50 text-emerald-700"
};

function loadFilters(): {
  district: string;
  from: Date;
  to: Date;
  statusFilter: LifecycleStatus[];
} {
  if (typeof window === "undefined") {
    return {
      district: "All Districts",
      ...getInitialRange(),
      statusFilter: [
        "New",
        "Under Review",
        "Action Taken",
        "Pending with Reason",
        "Escalated",
        "Completed"
      ]
    };
  }
  try {
    const raw = sessionStorage.getItem(FILTER_KEY);
    if (!raw) return { district: "All Districts", ...getInitialRange(), statusFilter: ["New", "Under Review", "Action Taken", "Pending with Reason", "Escalated", "Completed"] };
    const parsed = JSON.parse(raw);
    return {
      district: parsed.district ?? "All Districts",
      from: parsed.from ? new Date(parsed.from) : getInitialRange().from,
      to: parsed.to ? new Date(parsed.to) : getInitialRange().to,
      statusFilter: Array.isArray(parsed.statusFilter) ? parsed.statusFilter : ["New", "Under Review", "Action Taken", "Pending with Reason", "Escalated", "Completed"]
    };
  } catch {
    return { district: "All Districts", ...getInitialRange(), statusFilter: ["New", "Under Review", "Action Taken", "Pending with Reason", "Escalated", "Completed"] };
  }
}

function CollectorDashboardContent() {
  const searchParams = useSearchParams();
  const { role } = useRole();
  const { manus: allManus } = useManus();

  const [{ from, to }, setRange] = useState(getInitialRange);
  const [district, setDistrict] = useState<string>("All Districts");
  const [statusFilter, setStatusFilter] = useState<LifecycleStatus[]>([
    "New",
    "Under Review",
    "Action Taken",
    "Pending with Reason",
    "Escalated",
    "Completed"
  ]);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [expandedTaluk, setExpandedTaluk] = useState<string | null>(null);
  const [deptShowAll, setDeptShowAll] = useState(false);
  const [talukShowAll, setTalukShowAll] = useState(false);
  const searchQuery = searchParams.get("q")?.trim().toLowerCase() ?? "";

  useEffect(() => {
    const loaded = loadFilters();
    const qDistrict = searchParams.get("district");
    const qFrom = searchParams.get("from");
    const qTo = searchParams.get("to");

    const hasQuery = qDistrict || qFrom || qTo;
    if (hasQuery) {
      setDistrict(qDistrict || "All Districts");
      setRange({
        from: qFrom ? new Date(qFrom) : loaded.from,
        to: qTo ? new Date(qTo) : loaded.to
      });
    } else {
      setDistrict(loaded.district);
      setRange({ from: loaded.from, to: loaded.to });
      setStatusFilter(loaded.statusFilter);
    }
  }, [searchParams]);

  useEffect(() => {
    sessionStorage.setItem(
      FILTER_KEY,
      JSON.stringify({
        district,
        from: from.toISOString(),
        to: to.toISOString(),
        statusFilter
      })
    );
  }, [district, from, to, statusFilter]);

  const handlePreset = (preset: DatePreset) => {
    const now = new Date();
    const from = new Date();
    if (preset === "LAST_7") {
      from.setDate(now.getDate() - 7);
    } else if (preset === "LAST_30") {
      from.setDate(now.getDate() - 30);
    } else if (preset === "LAST_90") {
      from.setDate(now.getDate() - 90);
    } else if (preset === "THIS_MONTH") {
      from.setDate(1);
    }
    setRange({ from, to: now });
  };

  const filtered = useMemo(
    () =>
      allManus.filter((m) => {
        if (district !== "All Districts" && m.district !== district) {
          return false;
        }
        const lifecycle = mapLifecycleStatus(m);
        if (!statusFilter.includes(lifecycle)) return false;
        if (!isWithinRange(m.createdDate, from, to)) return false;
        if (searchQuery) {
          const matches =
            m.id.toLowerCase().includes(searchQuery) ||
            m.district.toLowerCase().includes(searchQuery) ||
            m.taluk.toLowerCase().includes(searchQuery) ||
            m.title.toLowerCase().includes(searchQuery) ||
            (m.descriptionText?.toLowerCase().includes(searchQuery) ?? false) ||
            m.citizenName.toLowerCase().includes(searchQuery);
          if (!matches) return false;
        }
        return true;
      }),
    [allManus, district, from, to, statusFilter, searchQuery]
  );

  const previousRange = useMemo(() => {
    const diffMs = to.getTime() - from.getTime();
    const prevTo = new Date(from.getTime() - 1);
    const prevFrom = new Date(from.getTime() - diffMs);
    return { prevFrom, prevTo };
  }, [from, to]);

  const prevFilteredCount = useMemo(
    () =>
      allManus.filter((m) => {
        if (district !== "All Districts" && m.district !== district) {
          return false;
        }
        return isWithinRange(
          m.createdDate,
          previousRange.prevFrom,
          previousRange.prevTo
        );
      }).length,
    [allManus, district, previousRange]
  );

  const criticalFiltered = filtered.filter(
    (m) => m.sentiment === "Severe Distress" || m.riskLevel === "Critical"
  );

  const prevCriticalCount = useMemo(
    () =>
      allManus.filter((m) => {
        if (district !== "All Districts" && m.district !== district) {
          return false;
        }
        const isCrit =
          m.sentiment === "Severe Distress" || m.riskLevel === "Critical";
        return (
          isCrit &&
          isWithinRange(
            m.createdDate,
            previousRange.prevFrom,
            previousRange.prevTo
          )
        );
      }).length,
    [allManus, district, previousRange]
  );

  const departmentsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        total: number;
        statusCounts: Record<string, number>;
        closureDaysSum: number;
        completedCount: number;
      }
    >();
    filtered.forEach((m) => {
      const key = m.departmentCategory;
      if (!map.has(key)) {
        map.set(key, {
          total: 0,
          statusCounts: {},
          closureDaysSum: 0,
          completedCount: 0
        });
      }
      const entry = map.get(key)!;
      entry.total += 1;
      const lifecycle = mapLifecycleStatus(m);
      entry.statusCounts[lifecycle] = (entry.statusCounts[lifecycle] ?? 0) + 1;
      if (m.status === "Resolved") {
        entry.completedCount += 1;
        entry.closureDaysSum += m.pendingDays;
      }
    });
    return map;
  }, [filtered]);

  const talukMap = useMemo(() => {
    const map = new Map<
      string,
      { total: number; pending: number; escalated: number; critical: number; district: string; taluk: string }
    >();
    filtered.forEach((m) => {
      const key = `${m.district} · ${m.taluk}`;
      if (!map.has(key)) {
        map.set(key, { total: 0, pending: 0, escalated: 0, critical: 0, district: m.district, taluk: m.taluk });
      }
      const entry = map.get(key)!;
      entry.total += 1;
      const lifecycle = mapLifecycleStatus(m);
      if (
        ["New", "Under Review", "Pending with Reason"].includes(lifecycle)
      ) {
        entry.pending += 1;
      }
      if (lifecycle === "Escalated") {
        entry.escalated += 1;
      }
      if (m.sentiment === "Severe Distress" || m.riskLevel === "Critical") {
        entry.critical += 1;
      }
    });
    return [...map.entries()].sort((a, b) => {
      const aVal = a[1].critical || a[1].pending;
      const bVal = b[1].critical || b[1].pending;
      return bVal - aVal;
    });
  }, [filtered]);

  const kanbanHighPriority = useMemo(
    () => sortByPriority(filtered).slice(0, 4),
    [filtered]
  );
  const kanbanLongOpen = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => b.pendingDays - a.pendingDays)
        .slice(0, 4),
    [filtered]
  );
  const kanbanEscalated = useMemo(
    () =>
      filtered
        .filter((m) => mapLifecycleStatus(m) === "Escalated")
        .slice(0, 4),
    [filtered]
  );

  const [showAllCritical, setShowAllCritical] = useState(false);

  const petitionsByDept = useMemo(() => {
    const map = new Map<string, Manu[]>();
    filtered.forEach((m) => {
      const key = m.departmentCategory;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });
    map.forEach((arr) => {
      arr.sort((a, b) => b.priorityScore - a.priorityScore);
    });
    return map;
  }, [filtered]);

  const petitionsByTaluk = useMemo(() => {
    const map = new Map<string, Manu[]>();
    filtered.forEach((m) => {
      const key = `${m.district} · ${m.taluk}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });
    map.forEach((arr) => arr.sort((a, b) => b.pendingDays - a.pendingDays));
    return map;
  }, [filtered]);

  const criticalDisplayFiltered = useMemo(() => {
    let result = criticalFiltered;
    if (expandedDept) {
      result = result.filter((m) => m.departmentCategory === expandedDept);
    }
    if (expandedTaluk) {
      const [d, t] = expandedTaluk.split(" · ");
      result = result.filter((m) => m.district === d && m.taluk === t);
    }
    return sortByPriority(result);
  }, [criticalFiltered, expandedDept, expandedTaluk]);

  const topCriticalPetitions = useMemo(
    () => criticalDisplayFiltered.slice(0, 4),
    [criticalDisplayFiltered]
  );

  const totalDeptPetitions = filtered.length;
  const totalTalukPetitions = filtered.length;
  const totalCriticalPetitions = criticalFiltered.length;

  const totalChange = computePercentChange(
    totalDeptPetitions,
    prevFilteredCount
  );
  const criticalChange = computePercentChange(
    totalCriticalPetitions,
    prevCriticalCount
  );

  if (role !== "COLLECTOR") {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Collector dashboard"
          subtitle="This view is intended for district collectors."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tamil Nadu Petitions – Governance Dashboard"
        subtitle="Monitor petitions across districts, departments, taluks, and AI sentiment."
      />

      {/* Top filter bar – compact */}
      <div className="rounded-2xl border border-surface-100 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Filters
        </p>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-end">
            <SearchableSelect
              label="District"
              options={["All Districts", ...tamilNaduDistricts]}
              value={district}
              onChange={setDistrict}
              placeholder="All Districts"
            />
            <div className="flex gap-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  From
                </label>
                <input
                  type="date"
                  value={formatDateInput(from)}
                  onChange={(e) =>
                    setRange((prev) => ({
                      ...prev,
                      from: parseDateInput(e.target.value, prev.from)
                    }))
                  }
                  className="mt-1 rounded-lg border border-surface-100 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  To
                </label>
                <input
                  type="date"
                  value={formatDateInput(to)}
                  onChange={(e) =>
                    setRange((prev) => ({
                      ...prev,
                      to: parseDateInput(e.target.value, prev.to)
                    }))
                  }
                  className="mt-1 rounded-lg border border-surface-100 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { key: "LAST_7", label: "Last 7 days" },
              { key: "LAST_30", label: "Last 30 days" },
              { key: "THIS_MONTH", label: "This month" },
              { key: "LAST_90", label: "Last 90 days" }
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => handlePreset(p.key as DatePreset)}
                className="rounded-full border border-surface-100 bg-surface-50 px-3 py-1 font-medium text-slate-700 hover:bg-white"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {(["New","Under Review","Action Taken","Pending with Reason","Escalated","Completed"] as LifecycleStatus[]).map(
            (status) => {
              const active = statusFilter.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setStatusFilter((prev) =>
                      prev.includes(status)
                        ? prev.filter((s) => s !== status)
                        : [...prev, status]
                    )
                  }
                  className={`rounded-full border px-3 py-1 font-medium transition ${
                    active
                      ? "border-brand-500 bg-brand-50 text-slate-800"
                      : "border-surface-100 bg-surface-50 text-slate-600 hover:bg-white"
                  }`}
                >
                  {status}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total department-wise petitions"
          value={totalDeptPetitions}
          tone="primary"
          helperText={totalChange.value}
          trend={totalChange.trend}
        />
        <StatCard
          label="Total taluk-wise petitions"
          value={totalTalukPetitions}
          tone="neutral"
          helperText={totalChange.value}
          trend={totalChange.trend}
        />
        <StatCard
          label="Critical sentiment petitions"
          value={totalCriticalPetitions}
          tone="danger"
          helperText={criticalChange.value}
          trend={criticalChange.trend}
        />
      </div>

      {/* Three category cards – modern card layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Department-wise – accordion */}
        <div className="flex flex-col rounded-2xl border border-surface-100 bg-white shadow-sm">
          <div className="border-b border-surface-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Department-wise
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Click a department to expand and view its petitions
            </p>
          </div>
          <div className="space-y-1 p-4">
            {Array.from(departmentsMap.entries()).map(([dept, stats]) => {
              const avgClosure =
                stats.completedCount > 0
                  ? Math.round(stats.closureDaysSum / stats.completedCount)
                  : "-";
              const isExpanded = expandedDept === dept;
              const petitions = petitionsByDept.get(dept) ?? [];
              const displayPetitions =
                deptShowAll || petitions.length <= 4 ? petitions : petitions.slice(0, 4);
              const hasMore = petitions.length > 4;

              return (
                <div
                  key={dept}
                  className="overflow-hidden rounded-xl border border-surface-100 bg-surface-50/50"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedDept(isExpanded ? null : dept);
                      if (!isExpanded) {
                        setDeptShowAll(false);
                        setShowAllCritical(false);
                      }
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition hover:bg-brand-50/50 ${
                      isExpanded ? "bg-brand-50" : ""
                    }`}
                  >
                    <span className="text-xs font-medium text-slate-800">
                      {dept}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-slate-600">
                      {stats.total} · {avgClosure}d
                      <span
                        className={`inline-block text-[10px] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        aria-hidden
                      >
                        ▾
                      </span>
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="space-y-2 border-t border-surface-100 bg-white p-3">
                      {displayPetitions.map((m) => (
                        <div
                          key={m.id}
                          className="rounded-lg border border-surface-100 p-3 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="flex-1 text-xs font-medium text-slate-800 line-clamp-2">
                              {m.title || generateShortSummary(m.descriptionText)}
                            </span>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${lifecycleStatusColors[mapLifecycleStatus(m)]}`}
                            >
                              {mapLifecycleStatus(m)}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {m.district} · {m.taluk} · {m.pendingDays}d
                          </p>
                        </div>
                      ))}
                      {hasMore && (
                        <button
                          type="button"
                          onClick={() => setDeptShowAll(!deptShowAll)}
                          className="w-full rounded-lg border border-brand-200 bg-brand-50 py-2 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
                        >
                          {deptShowAll ? "Show less" : `See all petitions (${petitions.length})`}
                        </button>
                      )}
                      {petitions.length === 0 && (
                        <p className="py-2 text-center text-xs text-slate-500">
                          No petitions in this department
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Taluk-wise – accordion */}
        <div className="flex flex-col rounded-2xl border border-surface-100 bg-white shadow-sm">
          <div className="border-b border-surface-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Taluk-wise
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Click a taluk to expand and view its petitions
            </p>
          </div>
          <div className="max-h-[480px] space-y-1 overflow-y-auto p-4">
            {talukMap.map(([key, stats]) => {
              const isExpanded = expandedTaluk === key;
              const petitions = petitionsByTaluk.get(key) ?? [];
              const displayPetitions =
                talukShowAll || petitions.length <= 4 ? petitions : petitions.slice(0, 4);
              const hasMore = petitions.length > 4;
              const talukLabel = key.split(" · ")[1] ?? key;

              return (
                <div
                  key={key}
                  className="overflow-hidden rounded-xl border border-surface-100 bg-surface-50/50"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedTaluk(isExpanded ? null : key);
                      if (!isExpanded) {
                        setTalukShowAll(false);
                        setShowAllCritical(false);
                      }
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition hover:bg-brand-50/50 ${
                      isExpanded ? "bg-brand-50" : ""
                    }`}
                  >
                    <span className="truncate text-xs font-medium text-slate-800">
                      {talukLabel}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-slate-600">
                      {stats.total}
                      <span
                        className={`inline-block text-[10px] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        aria-hidden
                      >
                        ▾
                      </span>
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="space-y-2 border-t border-surface-100 bg-white p-3">
                      {displayPetitions.map((m) => (
                        <div
                          key={m.id}
                          className="rounded-lg border border-surface-100 p-3 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="flex-1 text-xs font-medium text-slate-800 line-clamp-2">
                              {m.title || generateShortSummary(m.descriptionText)}
                            </span>
                            <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                              {m.pendingDays}d
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {m.district} · {m.taluk} · {m.departmentCategory}
                          </p>
                        </div>
                      ))}
                      {hasMore && (
                        <button
                          type="button"
                          onClick={() => setTalukShowAll(!talukShowAll)}
                          className="w-full rounded-lg border border-brand-200 bg-brand-50 py-2 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
                        >
                          {talukShowAll ? "Show less" : `See all petitions (${petitions.length})`}
                        </button>
                      )}
                      {petitions.length === 0 && (
                        <p className="py-2 text-center text-xs text-slate-500">
                          No petitions in this taluk
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Critical sentiment – filtered by expanded dept/taluk */}
        <div className="flex flex-col rounded-2xl border border-surface-100 bg-white shadow-sm">
          <div className="border-b border-surface-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Critical sentiment
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {expandedDept
                ? `AI-flagged in ${expandedDept}`
                : expandedTaluk
                  ? `AI-flagged in ${expandedTaluk.split(" · ")[1] ?? expandedTaluk}`
                  : "AI-flagged high-risk petitions"}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Suicide risk, extreme frustration, mental distress, health emergency
            </p>
          </div>
          <div className="space-y-2 p-4">
            {(showAllCritical ? criticalDisplayFiltered : topCriticalPetitions).map(
              (m) => {
                const criticalType = getCriticalSentimentType(m.descriptionText);
                const sentimentLabel =
                  criticalType ??
                  (m.sentiment === "Severe Distress" ? "Critical" : m.sentiment);
                return (
                  <div
                    key={m.id}
                    className="rounded-xl border border-rose-100 bg-rose-50/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex-1 text-xs font-medium text-slate-800 line-clamp-2">
                        {generateShortSummary(m.descriptionText)}
                      </span>
                      <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                        {sentimentLabel}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">
                        #{m.id} · {m.priorityScore}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${lifecycleStatusColors[mapLifecycleStatus(m)]}`}
                      >
                        {mapLifecycleStatus(m)}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
            {criticalDisplayFiltered.length === 0 && (
              <p className="rounded-xl border border-surface-100 bg-surface-50 px-3 py-4 text-center text-xs text-slate-500">
                No critical petitions in filter
              </p>
            )}
            {criticalDisplayFiltered.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllCritical(!showAllCritical)}
                className="mt-2 w-full rounded-xl border border-brand-200 bg-brand-50 py-2.5 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
              >
                {showAllCritical
                  ? "Show less"
                  : `See all petitions (${criticalDisplayFiltered.length})`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban board – 4 cards each */}
      <div className="rounded-2xl border border-surface-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">
          Priority Kanban
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Top 4 petitions by priority, long open, and escalation
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-surface-100 bg-surface-50/50 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              High priority
            </h4>
            <div className="space-y-2">
              {kanbanHighPriority.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-surface-100 bg-white p-3 text-xs shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800">
                      {m.title || generateShortSummary(m.descriptionText)}
                    </span>
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                      {m.priorityScore}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-slate-600">
                    {generateShortSummary(m.descriptionText)}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {m.district} / {m.taluk} · {m.pendingDays} days pending
                  </p>
                  <span className="mt-1 inline-block rounded bg-surface-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                    {mapLifecycleStatus(m)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-surface-100 bg-surface-50/50 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Long time open
            </h4>
            <div className="space-y-2">
              {kanbanLongOpen.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-surface-100 bg-white p-3 text-xs shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800">
                      {m.title || generateShortSummary(m.descriptionText)}
                    </span>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      {m.pendingDays} days
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-slate-600">
                    {generateShortSummary(m.descriptionText)}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {m.district} / {m.taluk} · Status: {mapLifecycleStatus(m)}
                  </p>
                  <span className="mt-1 inline-block rounded bg-surface-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                    {m.sentiment === "Severe Distress" ? "Critical" : m.sentiment}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-surface-100 bg-surface-50/50 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Escalated
            </h4>
            <div className="space-y-2">
              {kanbanEscalated.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-surface-100 bg-white p-3 text-xs shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800">
                      {m.title || generateShortSummary(m.descriptionText)}
                    </span>
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                      Escalated
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-slate-600">
                    {generateShortSummary(m.descriptionText)}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {m.district} / {m.taluk} · {m.pendingDays} days pending
                  </p>
                  <span className="mt-1 inline-block rounded bg-surface-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                    {mapLifecycleStatus(m)} · {m.sentiment === "Severe Distress" ? "Critical" : m.sentiment}
                  </span>
                </div>
              ))}
              {kanbanEscalated.length === 0 && (
                <p className="text-xs text-slate-500">
                  No escalated petitions in the current filter.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CollectorDashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12 text-slate-500">Loading...</div>}>
      <CollectorDashboardContent />
    </Suspense>
  );
}
