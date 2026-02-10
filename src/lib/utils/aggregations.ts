import type { Manu, RiskLevel, Sentiment } from "@/lib/types/manu";
import { manus } from "@/lib/mock-data/manus";

export interface DistrictStats {
  district: string;
  total: number;
  highAndCritical: number;
  severeDistressCount: number;
  averagePendingDays: number;
  resolvedCount: number;
  riskColor: "green" | "yellow" | "red";
}

export interface TalukStatsRow {
  taluk: string;
  total: number;
  highAndCritical: number;
  severeDistressCount: number;
  averagePendingDays: number;
}

export interface CategoryStatsRow {
  category: string;
  byRisk: Record<RiskLevel, number>;
  severeDistressCount: number;
}

export interface SentimentDistribution {
  sentiment: Sentiment;
  count: number;
}

export function getAllManus(): Manu[] {
  return manus;
}

export function getDistrictStats(all: Manu[] = manus): DistrictStats[] {
  const byDistrict = new Map<string, Manu[]>();

  all.forEach((m) => {
    const list = byDistrict.get(m.district) ?? [];
    list.push(m);
    byDistrict.set(m.district, list);
  });

  const result: DistrictStats[] = [];

  byDistrict.forEach((items, district) => {
    const total = items.length;
    const highAndCritical = items.filter((m) =>
      ["High", "Critical"].includes(m.riskLevel)
    ).length;
    const severeDistressCount = items.filter(
      (m) => m.sentiment === "Severe Distress"
    ).length;
    const resolvedCount = items.filter((m) => m.status === "Resolved").length;
    const averagePendingDays =
      items.reduce((sum, m) => sum + m.pendingDays, 0) / (items.length || 1);

    const highRatio = total ? highAndCritical / total : 0;
    let riskColor: DistrictStats["riskColor"] = "green";
    if (highRatio > 0.4 || severeDistressCount > 10) {
      riskColor = "red";
    } else if (highRatio > 0.2) {
      riskColor = "yellow";
    }

    result.push({
      district,
      total,
      highAndCritical,
      severeDistressCount,
      averagePendingDays: Math.round(averagePendingDays),
      resolvedCount,
      riskColor
    });
  });

  return result;
}

export function getTalukStatsForDistrict(
  district: string,
  all: Manu[] = manus
): TalukStatsRow[] {
  const byTaluk = new Map<string, Manu[]>();

  all
    .filter((m) => m.district === district)
    .forEach((m) => {
      const list = byTaluk.get(m.taluk) ?? [];
      list.push(m);
      byTaluk.set(m.taluk, list);
    });

  const rows: TalukStatsRow[] = [];
  byTaluk.forEach((items, taluk) => {
    const total = items.length;
    const highAndCritical = items.filter((m) =>
      ["High", "Critical"].includes(m.riskLevel)
    ).length;
    const severeDistressCount = items.filter(
      (m) => m.sentiment === "Severe Distress"
    ).length;
    const averagePendingDays =
      items.reduce((sum, m) => sum + m.pendingDays, 0) / (items.length || 1);

    rows.push({
      taluk,
      total,
      highAndCritical,
      severeDistressCount,
      averagePendingDays: Math.round(averagePendingDays)
    });
  });

  return rows;
}

export function getCategoryStats(
  scope: Manu[] = manus
): CategoryStatsRow[] {
  const byCategory = new Map<string, Manu[]>();

  scope.forEach((m) => {
    const list = byCategory.get(m.departmentCategory) ?? [];
    list.push(m);
    byCategory.set(m.departmentCategory, list);
  });

  const rows: CategoryStatsRow[] = [];

  byCategory.forEach((items, category) => {
    const byRisk: CategoryStatsRow["byRisk"] = {
      Low: 0,
      Moderate: 0,
      High: 0,
      Critical: 0
    };

    items.forEach((m) => {
      byRisk[m.riskLevel] += 1;
    });

    const severeDistressCount = items.filter(
      (m) => m.sentiment === "Severe Distress"
    ).length;

    rows.push({
      category,
      byRisk,
      severeDistressCount
    });
  });

  return rows;
}

export function getSentimentDistribution(
  scope: Manu[] = manus
): SentimentDistribution[] {
  const map = new Map<Sentiment, number>();

  scope.forEach((m) => {
    const current = map.get(m.sentiment) ?? 0;
    map.set(m.sentiment, current + 1);
  });

  const result: SentimentDistribution[] = [];
  map.forEach((count, sentiment) => {
    result.push({ sentiment, count });
  });
  return result;
}

