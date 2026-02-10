"use client";

import { useState } from "react";
import {
  computeDepartmentPerformance,
  computeDistrictPerformance
} from "@/lib/utils/performance";
import { DepartmentPerformanceTab } from "./DepartmentPerformanceTab";
import { DistrictPerformanceTab } from "./DistrictPerformanceTab";
import { PredictionForecastingTab } from "./PredictionForecastingTab";
import type { Manu } from "@/lib/types/manu";

export type SidebarTab = "department" | "district" | "prediction";

interface Props {
  manuscripts: Manu[];
  district: string;
  dateFrom: Date;
  dateTo: Date;
  sidebarDept: string | null;
  sidebarDistrict: string | null;
  onSidebarDeptChange: (d: string | null) => void;
  onSidebarDistrictChange: (d: string | null) => void;
  onDashboardDeptFilter?: (d: string | null) => void;
  onDashboardDistrictFilter?: (d: string | null) => void;
  embedded?: boolean;
}

const tabs: { id: SidebarTab; label: string }[] = [
  { id: "department", label: "Department" },
  { id: "district", label: "District" },
  { id: "prediction", label: "Prediction" }
];

export function DashboardRightSidebar({
  manuscripts,
  district,
  dateFrom,
  dateTo,
  sidebarDept,
  sidebarDistrict,
  onSidebarDeptChange,
  onSidebarDistrictChange,
  onDashboardDeptFilter,
  onDashboardDistrictFilter,
  embedded = false
}: Props) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("department");
  const [collapsed, setCollapsed] = useState(false);

  const deptPerf = computeDepartmentPerformance(
    manuscripts,
    district,
    dateFrom,
    dateTo
  );
  const districtPerf = computeDistrictPerformance(manuscripts, dateFrom, dateTo);

  const handleDeptSelect = (d: string | null) => {
    onSidebarDeptChange(d);
    onDashboardDeptFilter?.(d);
  };

  const handleDistrictSelect = (d: string | null) => {
    onSidebarDistrictChange(d);
    onDashboardDistrictFilter?.(d);
  };

  if (!embedded && collapsed) {
    return (
      <div className="flex shrink-0 flex-col border-l border-surface-100 bg-white">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex h-full w-10 items-center justify-center border-l border-surface-100 bg-surface-50 text-slate-500 hover:bg-surface-100"
          aria-label="Expand sidebar"
        >
          ◀
        </button>
      </div>
    );
  }

  return (
    <aside className={`flex flex-col ${embedded ? "" : "w-80 shrink-0 border-l border-surface-100 bg-white shadow-sm"}`}>
      <div className="flex items-center justify-between border-b border-surface-100 px-3 py-2">
        <span className="text-xs font-semibold text-slate-700">Insights</span>
        {!embedded && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="rounded p-1 text-slate-500 hover:bg-surface-100"
            aria-label="Collapse sidebar"
          >
            ▶
          </button>
        )}
      </div>
      <div className="flex border-b border-surface-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-2 py-2 text-[11px] font-medium transition ${
              activeTab === tab.id
                ? "border-b-2 border-brand-500 text-brand-700"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "department" && (
          <DepartmentPerformanceTab
            data={deptPerf}
            selectedDept={sidebarDept}
            onSelectDept={handleDeptSelect}
          />
        )}
        {activeTab === "district" && (
          <DistrictPerformanceTab
            data={districtPerf}
            selectedDistrict={sidebarDistrict}
            onSelectDistrict={handleDistrictSelect}
          />
        )}
        {activeTab === "prediction" && (
          <PredictionForecastingTab
            district={district}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        )}
      </div>
    </aside>
  );
}
