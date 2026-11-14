// apps/control-plane/src/packages/entitlements.js

export const PLAN_IDS = {
  SANDBOX_FREE: "SANDBOX_FREE",
  STARTER_199: "STARTER_199",
  COMPLIANCE_249: "COMPLIANCE_249",
  PROFESSIONAL_649: "PROFESSIONAL_649",
  ENTERPRISE_1500: "ENTERPRISE_1500",
  ENTERPRISE_1990: "ENTERPRISE_1990"
};

const PLAN_CATALOG = {
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
  if (PLAN_CATALOG[upper]) return upper;
  if (upper.includes("SANDBOX") || upper.includes("FREE")) return PLAN_IDS.SANDBOX_FREE;
  if (upper.includes("STARTER") || upper.includes("199")) return PLAN_IDS.STARTER_199;
  if (upper.includes("COMPLIANCE") || upper.includes("249")) return PLAN_IDS.COMPLIANCE_249;
  if (upper.includes("PRO") || upper.includes("649")) return PLAN_IDS.PROFESSIONAL_649;
  if (upper.includes("1990")) return PLAN_IDS.ENTERPRISE_1990;
  if (upper.includes("ENTERPRISE") || upper.includes("1500")) return PLAN_IDS.ENTERPRISE_1500;
  return PLAN_IDS.PROFESSIONAL_649;
}

export function getPlanEntitlements(planId) {
  const cleanId = sanitizePlanId(planId);
  return PLAN_CATALOG[cleanId] || PLAN_CATALOG[PLAN_IDS.SANDBOX_FREE];
}

export function checkQuota(planId, currentUsage = 0) {
  const entitlements = getPlanEntitlements(planId);
  const limit = entitlements.monthlyVerdicts;
  const used = Number(currentUsage) || 0;
  return {
    allowed: used < limit,
    planId: entitlements.planId,
    used,
    limit,
    remaining: Math.max(0, limit - used)
  };
}

export function isFeatureAllowed(planId, featureKey) {
  const entitlements = getPlanEntitlements(planId);
  return Boolean(entitlements.features?.[featureKey]);
}