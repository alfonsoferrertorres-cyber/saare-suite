// apps/control-plane/src/packages/entitlements.js

export const PLAN_IDS = {
  SANDBOX_FREE: "SANDBOX_FREE",
  STARTER_199: "STARTER_199",
  COMPLIANCE_249: "COMPLIANCE_249",
  PROFESSIONAL_649: "PROFESSIONAL_649",
  ENTERPRISE_1500: "ENTERPRISE_1500",
  ENTERPRISE_1990: "ENTERPRISE_1990"
};

export const PLAN_CATALOG = {
  [PLAN_IDS.SANDBOX_FREE]: {
    planId: PLAN_IDS.SANDBOX_FREE,
    name: "Sandbox Gratuito (Perpetuo)",
    monthlyVerdicts: 1000,
    maxSeats: 2,
    isPerpetual: true,
    expiresInDays: null,
    features: {
      siemExport: false,
      customRules: true,
      merkleAnchoring: true,
      gpoDeployment: true,
      cpaasFailover: false
    }
  },
  [PLAN_IDS.STARTER_199]: {
    planId: PLAN_IDS.STARTER_199,
    name: "Starter Governance",
    monthlyVerdicts: 10000,
    maxSeats: 5,
    isPerpetual: false,
    expiresInDays: 35,
    features: {
      siemExport: false,
      customRules: true,
      merkleAnchoring: true,
      gpoDeployment: true,
      cpaasFailover: false
    }
  },
  [PLAN_IDS.COMPLIANCE_249]: {
    planId: PLAN_IDS.COMPLIANCE_249,
    name: "Compliance Ex-Ante",
    monthlyVerdicts: 15000,
    maxSeats: 10,
    isPerpetual: false,
    expiresInDays: 35,
    features: {
      siemExport: false,
      customRules: true,
      merkleAnchoring: true,
      gpoDeployment: true,
      cpaasFailover: true
    }
  },
  [PLAN_IDS.PROFESSIONAL_649]: {
    planId: PLAN_IDS.PROFESSIONAL_649,
    name: "Professional L7",
    monthlyVerdicts: 50000,
    maxSeats: 25,
    isPerpetual: false,
    expiresInDays: 35,
    features: {
      siemExport: true,
      customRules: true,
      merkleAnchoring: true,
      gpoDeployment: true,
      cpaasFailover: true
    }
  },
  [PLAN_IDS.ENTERPRISE_1500]: {
    planId: PLAN_IDS.ENTERPRISE_1500,
    name: "Enterprise Sovereign",
    monthlyVerdicts: 250000,
    maxSeats: 100,
    isPerpetual: false,
    expiresInDays: 35,
    features: {
      siemExport: true,
      customRules: true,
      merkleAnchoring: true,
      gpoDeployment: true,
      cpaasFailover: true
    }
  },
  [PLAN_IDS.ENTERPRISE_1990]: {
    planId: PLAN_IDS.ENTERPRISE_1990,
    name: "Enterprise Unlimited",
    monthlyVerdicts: 1000000,
    maxSeats: 500,
    isPerpetual: false,
    expiresInDays: 35,
    features: {
      siemExport: true,
      customRules: true,
      merkleAnchoring: true,
      gpoDeployment: true,
      cpaasFailover: true
    }
  }
};

export function sanitizePlanId(rawPlan) {
  if (!rawPlan || typeof rawPlan !== "string") return PLAN_IDS.SANDBOX_FREE;
  const upper = rawPlan.trim().toUpperCase();

  if (Object.prototype.hasOwnProperty.call(PLAN_CATALOG, upper)) {
    return upper;
  }

  if (upper.includes("SANDBOX") || upper.includes("FREE")) {
    return PLAN_IDS.SANDBOX_FREE;
  }
  if (upper.includes("1990") || upper.includes("UNLIMITED")) {
    return PLAN_IDS.ENTERPRISE_1990;
  }
  if (upper.includes("1500") || upper.includes("SOVEREIGN") || upper.includes("ENTERPRISE")) {
    return PLAN_IDS.ENTERPRISE_1500;
  }
  if (upper.includes("649") || upper.includes("PRO")) {
    return PLAN_IDS.PROFESSIONAL_649;
  }
  if (upper.includes("249") || upper.includes("COMPLIANCE")) {
    return PLAN_IDS.COMPLIANCE_249;
  }
  if (upper.includes("199") || upper.includes("STARTER")) {
    return PLAN_IDS.STARTER_199;
  }

  return PLAN_IDS.SANDBOX_FREE;
}

export function getPlanEntitlements(planId) {
  const cleanId = sanitizePlanId(planId);
  const base = PLAN_CATALOG[cleanId] || PLAN_CATALOG[PLAN_IDS.SANDBOX_FREE];
  return {
    ...base,
    features: { ...base.features }
  };
}

export function checkQuota(planId, currentUsage = 0, customQuota = null) {
  const entitlements = getPlanEntitlements(planId);
  const parsedCustom = Number(customQuota);
  const limit =
    Number.isFinite(parsedCustom) && parsedCustom > 0
      ? Math.floor(parsedCustom)
      : entitlements.monthlyVerdicts;
  const used = Math.max(0, Math.floor(Number(currentUsage) || 0));

  return {
    allowed: used < limit,
    planId: entitlements.planId,
    used,
    limit,
    remaining: Math.max(0, limit - used)
  };
}

export function canAssignSeat(planId, currentSeats = 0, customMaxSeats = null) {
  const entitlements = getPlanEntitlements(planId);
  const parsedCustom = Number(customMaxSeats);
  const maxSeats =
    Number.isFinite(parsedCustom) && parsedCustom > 0
      ? Math.floor(parsedCustom)
      : entitlements.maxSeats;
  const usedSeats = Math.max(0, Math.floor(Number(currentSeats) || 0));

  return {
    allowed: usedSeats < maxSeats,
    planId: entitlements.planId,
    usedSeats,
    maxSeats,
    remainingSeats: Math.max(0, maxSeats - usedSeats)
  };
}

export function isFeatureAllowed(planId, featureKey) {
  if (!featureKey || typeof featureKey !== "string") return false;
  const entitlements = getPlanEntitlements(planId);
  return Boolean(entitlements.features?.[featureKey]);
}

export default {
  PLAN_IDS,
  PLAN_CATALOG,
  sanitizePlanId,
  getPlanEntitlements,
  checkQuota,
  canAssignSeat,
  isFeatureAllowed
};