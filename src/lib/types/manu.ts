export type UserRole = "CITIZEN" | "TALUK_OFFICER" | "COLLECTOR";

export type Sentiment = "Positive" | "Neutral" | "Negative" | "Severe Distress";

export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";

export type ManuStatus = "Submitted" | "In Progress" | "Resolved";

export type DepartmentCategory =
  | "Health"
  | "Revenue"
  | "Electricity"
  | "Water Supply"
  | "Roads"
  | "Police"
  | "Education";

export interface Manu {
  id: string;
  citizenName: string;
  district: string;
  taluk: string;
  departmentCategory: DepartmentCategory;
  title: string;
  descriptionText: string;
  sentiment: Sentiment;
  riskLevel: RiskLevel;
  priorityScore: number;
  status: ManuStatus;
  createdDate: string;
  pendingDays: number;
  lastUpdatedDate?: string;
}
