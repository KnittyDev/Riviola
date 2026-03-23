export type PlanType = "essence" | "signature" | "prestige";

export interface PlanLimits {
  maxBuildings: number;
  hasRequestTracking: boolean;
  hasBulkPayments: boolean;
  hasWhiteLabel: boolean;
  hasCustomization: boolean;
  hasPrioritySupport: boolean;
  hasAutomatedDues: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  essence: {
    maxBuildings: 2,
    hasRequestTracking: false,
    hasBulkPayments: false,
    hasWhiteLabel: false,
    hasCustomization: false,
    hasPrioritySupport: false,
    hasAutomatedDues: false,
  },
  signature: {
    maxBuildings: 10,
    hasRequestTracking: true,
    hasBulkPayments: false,
    hasWhiteLabel: false,
    hasCustomization: false,
    hasPrioritySupport: false,
    hasAutomatedDues: true,
  },
  prestige: {
    maxBuildings: Infinity,
    hasRequestTracking: true,
    hasBulkPayments: true,
    hasWhiteLabel: true,
    hasCustomization: true,
    hasPrioritySupport: true,
    hasAutomatedDues: true,
  },
};

export function getPlanFromPlanName(planName: string | null | undefined): PlanType {
  const name = planName?.toLowerCase() || "";
  if (name.includes("prestige")) return "prestige";
  if (name.includes("signature")) return "signature";
  return "essence";
}
