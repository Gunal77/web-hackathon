"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { Manu, ManuStatus } from "@/lib/types/manu";
import { manus as seededManus } from "@/lib/mock-data/manus";
import { analyzeSentiment, calculateRiskLevel } from "@/lib/utils/ai";
import { computePriorityScore } from "@/lib/utils/scoring";
import { districtTaluks } from "@/lib/mock-data/manus";

export interface NewManuInput {
  citizenName: string;
  district: string;
  taluk: string;
  departmentCategory: Manu["departmentCategory"];
  title: string;
  descriptionText: string;
}

interface ManuContextValue {
  manus: Manu[];
  addManu: (input: NewManuInput) => void;
  updateStatus: (id: string, status: ManuStatus) => void;
}

const ManuContext = createContext<ManuContextValue | undefined>(undefined);

function computePendingDays(createdDate: string): number {
  const created = new Date(createdDate);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function ManuProvider({ children }: { children: ReactNode }) {
  const [manus, setManus] = useState<Manu[]>(() =>
    seededManus.map((m) => {
      // For Resolved, pendingDays = resolution time; don't overwrite
      const pendingDays =
        m.status === "Resolved"
          ? m.pendingDays
          : computePendingDays(m.createdDate);
      return {
        ...m,
        pendingDays,
        lastUpdatedDate: m.lastUpdatedDate ?? m.createdDate
      };
    })
  );

  const addManu = (input: NewManuInput) => {
    setManus((current) => {
      const now = new Date().toISOString();

      const sentiment = analyzeSentiment(input.descriptionText);
      const pendingDays = 0;
      const riskLevel = calculateRiskLevel(
        sentiment,
        pendingDays,
        input.departmentCategory
      );
      const priorityScore = computePriorityScore({
        sentiment,
        riskLevel,
        pendingDays
      });

      const existingIds = current.map((m) => Number(m.id)).filter((n) => !isNaN(n));
      const nextNumericId =
        existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

      const manu: Manu = {
        id: String(nextNumericId),
        citizenName: input.citizenName,
        district: input.district,
        taluk: input.taluk,
        departmentCategory: input.departmentCategory,
        title: input.title,
        descriptionText: input.descriptionText,
        sentiment,
        riskLevel,
        priorityScore,
        status: "Submitted",
        createdDate: now,
        pendingDays,
        lastUpdatedDate: now
      };

      return [...current, manu];
    });
  };

  const updateStatus = (id: string, status: ManuStatus) => {
    setManus((current) =>
      current.map((m) => {
        if (m.id !== id) return m;
        const lastUpdatedDate = new Date().toISOString();
        const pendingDays = computePendingDays(m.createdDate);

        const riskLevel = calculateRiskLevel(
          m.sentiment,
          pendingDays,
          m.departmentCategory
        );
        const priorityScore = computePriorityScore({
          sentiment: m.sentiment,
          riskLevel,
          pendingDays
        });

        return {
          ...m,
          status,
          lastUpdatedDate,
          pendingDays,
          riskLevel,
          priorityScore
        };
      })
    );
  };

  const value = useMemo<ManuContextValue>(
    () => ({
      manus,
      addManu,
      updateStatus
    }),
    [manus]
  );

  return <ManuContext.Provider value={value}>{children}</ManuContext.Provider>;
}

export function useManus(): ManuContextValue {
  const ctx = useContext(ManuContext);
  if (!ctx) {
    throw new Error("useManus must be used within ManuProvider");
  }
  return ctx;
}

