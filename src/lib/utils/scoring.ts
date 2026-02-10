import type { Manu } from "@/lib/types/manu";
import { calculatePriorityScore } from "@/lib/utils/ai";

export function computePriorityScore(input: {
  sentiment: Manu["sentiment"];
  riskLevel: Manu["riskLevel"];
  pendingDays: Manu["pendingDays"];
}): number {
  return calculatePriorityScore(input);
}

export function sortByPriority<T extends Pick<Manu, "priorityScore">>(
  manus: T[]
): T[] {
  return [...manus].sort((a, b) => b.priorityScore - a.priorityScore);
}

