"use client";

import { useCertificateStatus } from "@/features/certificates/hooks/use-certificates";
import { useLatestPlacement } from "./use-placement";

export interface PlacementAdvancementGateInfo {
  isLocked: boolean;
  hasInitialPlacement: boolean;
  allModulesCompleted: boolean;
  hasCertificate: boolean;
  totalModules: number;
  completedModules: number;
  progressPercent: number;
  remainingModules: number;
  currentCefr: string;
  isLoading: boolean;
}

export function usePlacementAdvancementGate(
  userId?: string,
  currentCefr?: string
): PlacementAdvancementGateInfo {
  const baseCefr = (currentCefr || "A1").slice(0, 2).toUpperCase();
  const { data: certStatusList, isLoading: isCertLoading } = useCertificateStatus(userId, baseCefr);
  const { data: latestPlacement, isLoading: isPlacementLoading } = useLatestPlacement(userId || "");

  const activeCertStatus = certStatusList?.find((c) => c.cefr === baseCefr);
  const totalModules = activeCertStatus?.totalModules ?? 0;
  const completedModules = activeCertStatus?.completedModules ?? 0;
  const progressPercent =
    totalModules > 0 ? Math.min(100, Math.round((completedModules / totalModules) * 100)) : 0;
  const hasCertificate = !!activeCertStatus?.certificate || activeCertStatus?.status === "unlocked";
  const allModulesCompleted = totalModules > 0 && completedModules >= totalModules;
  const hasInitialPlacement = !!latestPlacement;

  // Placement advancement test is locked if student already has taken their initial placement test
  // but hasn't completed all modules in their current CEFR level OR hasn't claimed their certificate yet.
  const isLocked = hasInitialPlacement && (!allModulesCompleted || !hasCertificate);

  return {
    isLocked,
    hasInitialPlacement,
    allModulesCompleted,
    hasCertificate,
    totalModules,
    completedModules,
    progressPercent,
    remainingModules: Math.max(0, totalModules - completedModules),
    currentCefr: baseCefr,
    isLoading: isCertLoading || isPlacementLoading,
  };
}

