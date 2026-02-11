import type { Manu } from "@/lib/types/manu";

export type PerformanceLevel = "good" | "warning" | "poor";

export interface DepartmentPerformance {
  department: string;
  total: number;
  avgTimeToFirstAction: number;
  avgTimeToComplete: number;
  slaBreachPct: number;
  performance: PerformanceLevel;
}

export interface DepartmentRate {
  department: string;
  count: number;
  rate: number;
}

export interface DistrictPerformance {
  district: string;
  total: number;
  critical: number;
  resolved: number;
  avgResolutionDays: number;
  bestDepartment: string;
  worstDepartment: string;
  riskLevel: "Low" | "Medium" | "High";
  departmentRates: DepartmentRate[];
  isBest?: boolean;
  needsFocus?: boolean;
}

const SLA_TARGET_DAYS = 15;

function getPerformanceLevel(
  avgComplete: number,
  slaBreachPct: number
): PerformanceLevel {
  if (avgComplete <= 10 && slaBreachPct <= 10) return "good";
  if (avgComplete <= 18 && slaBreachPct <= 25) return "warning";
  return "poor";
}

export function computeDepartmentPerformance(
  manuscripts: Manu[],
  district: string,
  _from: Date,
  _to: Date
): DepartmentPerformance[] {
  const filtered =
    district && district !== "All Districts"
      ? manuscripts.filter((m) => m.district === district)
      : manuscripts;

  const byDept = new Map<
    string,
    { total: number; completed: number; closureSum: number; firstActionSum: number; firstActionCount: number; breached: number }
  >();

  filtered.forEach((m) => {
    const key = m.departmentCategory;
    if (!byDept.has(key)) {
      byDept.set(key, {
        total: 0,
        completed: 0,
        closureSum: 0,
        firstActionSum: 0,
        firstActionCount: 0,
        breached: 0
      });
    }
    const entry = byDept.get(key)!;
    entry.total += 1;

    if (m.status === "Resolved" || m.status === "In Progress") {
      entry.firstActionCount += 1;
      // First action: typically 1–4 days; longer resolutions imply slower first response
      const firstActionDays =
        m.status === "Resolved"
          ? Math.min(5, Math.max(1, Math.floor(m.pendingDays / 5)))
          : Math.min(3, m.pendingDays);
      entry.firstActionSum += firstActionDays;
    }
    if (m.status === "Resolved") {
      entry.completed += 1;
      entry.closureSum += m.pendingDays;
      if (m.pendingDays > SLA_TARGET_DAYS) entry.breached += 1;
    }
  });

  return Array.from(byDept.entries()).map(([dept, stats]) => {
    const avgFirstAction =
      stats.firstActionCount > 0
        ? Math.round(stats.firstActionSum / stats.firstActionCount)
        : 0;
    const avgComplete =
      stats.completed > 0
        ? Math.round(stats.closureSum / stats.completed)
        : 0;
    const slaBreachPct =
      stats.completed > 0
        ? Math.round((stats.breached / stats.completed) * 100)
        : 0;

    return {
      department: dept,
      total: stats.total,
      avgTimeToFirstAction: avgFirstAction,
      avgTimeToComplete: avgComplete,
      slaBreachPct,
      performance: getPerformanceLevel(avgComplete, slaBreachPct)
    };
  });
}

export function computeDistrictPerformance(
  manuscripts: Manu[],
  _from: Date,
  _to: Date
): DistrictPerformance[] {
  const byDistrict = new Map<
    string,
    {
      total: number;
      critical: number;
      closureSum: number;
      completed: number;
      byDeptTotal: Map<string, number>;
      byDept: Map<string, { total: number; avgDays: number; sumDays: number; count: number }>;
    }
  >();

  manuscripts.forEach((m) => {
    const key = m.district;
    if (!byDistrict.has(key)) {
      byDistrict.set(key, {
        total: 0,
        critical: 0,
        closureSum: 0,
        completed: 0,
        byDeptTotal: new Map(),
        byDept: new Map()
      });
    }
    const entry = byDistrict.get(key)!;
    entry.total += 1;
    if (m.sentiment === "Severe Distress" || m.riskLevel === "Critical") {
      entry.critical += 1;
    }
    const dept = m.departmentCategory;
    entry.byDeptTotal.set(dept, (entry.byDeptTotal.get(dept) ?? 0) + 1);
    if (m.status === "Resolved") {
      entry.completed += 1;
      entry.closureSum += m.pendingDays;
      if (!entry.byDept.has(dept)) {
        entry.byDept.set(dept, { total: 0, avgDays: 0, sumDays: 0, count: 0 });
      }
      const d = entry.byDept.get(dept)!;
      d.count += 1;
      d.sumDays += m.pendingDays;
      d.total += 1;
    }
  });

  const results: DistrictPerformance[] = [];

  byDistrict.forEach((stats, district) => {
    const avgResolutionDays =
      stats.completed > 0
        ? Math.round(stats.closureSum / stats.completed)
        : 0;

    let bestDept = "-";
    let worstDept = "-";
    let bestAvg = Infinity;
    let worstAvg = 0;

    stats.byDept.forEach((d, dept) => {
      const avg = d.count > 0 ? d.sumDays / d.count : 0;
      if (d.count >= 1 && avg < bestAvg) {
        bestAvg = avg;
        bestDept = dept;
      }
      if (d.count >= 1 && avg > worstAvg) {
        worstAvg = avg;
        worstDept = dept;
      }
    });

    const riskLevel =
      stats.critical > 5 || avgResolutionDays > 20
        ? "High"
        : stats.critical > 2 || avgResolutionDays > 15
          ? "Medium"
          : "Low";

    const departmentRates: DepartmentRate[] = Array.from(
      stats.byDeptTotal.entries()
    )
      .map(([dept, count]) => ({
        department: dept,
        count,
        rate: stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    results.push({
      district,
      total: stats.total,
      critical: stats.critical,
      resolved: stats.completed,
      avgResolutionDays,
      bestDepartment: bestDept,
      worstDepartment: worstDept,
      riskLevel,
      departmentRates
    });
  });

  const sortedByGood = [...results].sort((a, b) => {
    const scoreA = a.total - a.critical * 2 - a.avgResolutionDays;

    const scoreB = b.total - b.critical * 2 - b.avgResolutionDays;
    return scoreB - scoreA;
  });
  if (sortedByGood[0]) {
    sortedByGood[0].isBest = true;
  }

  const needsFocus = [...results]
    .filter((r) => r.riskLevel === "High" || r.critical > 3)
    .sort((a, b) => b.critical - a.critical)
    .slice(0, 5);
  needsFocus.forEach((r) => {
    r.needsFocus = true;
  });

  return results.sort((a, b) => b.total - a.total);
}
