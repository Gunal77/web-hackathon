import type {
  DepartmentCategory,
  RiskLevel,
  Sentiment
} from "@/lib/types/manu";

export function analyzeSentiment(text: string): Sentiment {
  const normalized = text.toLowerCase();

  const severeKeywords = [
    "suicide",
    "kill myself",
    "end my life",
    "no hope",
    "threat"
  ];
  if (severeKeywords.some((word) => normalized.includes(word))) {
    return "Severe Distress";
  }

  const negativeKeywords = [
    "angry",
    "complaint",
    "corruption",
    "harassment",
    "issue"
  ];
  if (negativeKeywords.some((word) => normalized.includes(word))) {
    return "Negative";
  }

  const neutralKeywords = ["request", "please", "support"];
  if (neutralKeywords.some((word) => normalized.includes(word))) {
    return "Neutral";
  }

  return "Positive";
}

export function calculateRiskLevel(
  sentiment: Sentiment,
  pendingDays: number,
  _category: DepartmentCategory
): RiskLevel {
  if (sentiment === "Severe Distress") {
    return "Critical";
  }

  if (sentiment === "Negative" && pendingDays > 10) {
    return "High";
  }

  if (sentiment === "Neutral" && pendingDays > 15) {
    return "Moderate";
  }

  return "Low";
}

export function calculatePriorityScore(opts: {
  sentiment: Sentiment;
  riskLevel: RiskLevel;
  pendingDays: number;
}): number {
  let score = 0;

  if (opts.sentiment === "Severe Distress") {
    score += 50;
  }

  if (opts.riskLevel === "High") {
    score += 30;
  } else if (opts.riskLevel === "Moderate") {
    score += 15;
  }

  score += opts.pendingDays * 1.5;

  if (score > 100) return 100;
  if (score < 0) return 0;
  return Math.round(score);
}

/** Critical sentiment types for AI-flagged petitions */
export type CriticalSentimentType =
  | "Suicide risk"
  | "Extreme frustration"
  | "Mental distress"
  | "Health emergency";

export function getCriticalSentimentType(text: string): CriticalSentimentType | null {
  const normalized = text.toLowerCase();
  if (
    /suicide|kill myself|end my life|no hope|threat|want to die/.test(normalized)
  ) {
    return "Suicide risk";
  }
  if (
    /extremely angry|frustrated|cannot take|helpless|nothing works|give up/.test(
      normalized
    )
  ) {
    return "Extreme frustration";
  }
  if (
    /mental|depression|anxiety|stress|distress|trauma|breakdown/.test(normalized)
  ) {
    return "Mental distress";
  }
  if (
    /emergency|urgent|critical|heart attack|stroke|unconscious|immediate/.test(
      normalized
    )
  ) {
    return "Health emergency";
  }
  return null;
}

export function generateShortSummary(text: string, maxLen = 80): string {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (cleaned.length <= maxLen) return cleaned;
  const truncated = cleaned.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLen * 0.6) {
    return truncated.slice(0, lastSpace) + "...";
  }
  return truncated + "...";
}

