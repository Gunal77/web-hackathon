export type ConfidenceLevel = "Low" | "Medium" | "High";

export interface SeasonalForecast {
  department: string;
  expectedIncreasePct: number;
  highRiskMonths: string[];
  reason: string;
}

export interface DeptSlaPrediction {
  department: string;
  likelyToMissSla: boolean;
  confidence: ConfidenceLevel;
  reason: string;
}

export interface DistrictCriticalPrediction {
  district: string;
  likelyCritical: boolean;
  confidence: ConfidenceLevel;
  reason: string;
}

export function getSeasonalForecasts(
  _district: string,
  _dateFrom: Date,
  _dateTo: Date
): SeasonalForecast[] {
  const now = new Date();
  const month = now.getMonth();
  return [
    {
      department: "Water Supply",
      expectedIncreasePct: 35,
      highRiskMonths: ["Apr", "May", "Jun"],
      reason: "Past summer data: water shortage complaints rise 30–40%"
    },
    {
      department: "Roads",
      expectedIncreasePct: 28,
      highRiskMonths: ["Oct", "Nov"],
      reason: "Monsoon damage; road complaints typically spike post-rain"
    },
    {
      department: "Health",
      expectedIncreasePct: 22,
      highRiskMonths: ["Jul", "Aug", "Sep"],
      reason: "Seasonal illnesses; rainy season drives health complaints"
    },
    {
      department: "Electricity",
      expectedIncreasePct: 18,
      highRiskMonths: ["Apr", "May"],
      reason: "Summer demand; power outage complaints increase"
    }
  ];
}

export function getDeptSlaPredictions(
  _district: string
): DeptSlaPrediction[] {
  return [
    {
      department: "Roads",
      likelyToMissSla: true,
      confidence: "High",
      reason: "Current backlog 42; avg resolution 18d vs 15d SLA"
    },
    {
      department: "Health",
      likelyToMissSla: true,
      confidence: "Medium",
      reason: "28 open; 3 critical; resolution trend worsening"
    },
    {
      department: "Water Supply",
      likelyToMissSla: false,
      confidence: "High",
      reason: "Resolution within SLA; low backlog"
    }
  ];
}

export function getDistrictCriticalPredictions(
  _district: string
): DistrictCriticalPrediction[] {
  return [
    {
      district: "Chennai",
      likelyCritical: true,
      confidence: "High",
      reason: "4 critical petitions this month; sentiment trend up"
    },
    {
      district: "Madurai",
      likelyCritical: true,
      confidence: "Medium",
      reason: "High pending days; 2 critical in 30d"
    },
    {
      district: "Coimbatore",
      likelyCritical: false,
      confidence: "High",
      reason: "Low critical count; stable resolution"
    }
  ];
}
