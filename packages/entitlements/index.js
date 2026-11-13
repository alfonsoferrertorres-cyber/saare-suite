/**
 * S.A.A.R.E. Entitlements Engine (SGP 1.0)
 * Single Source of Truth for Plan Tiers, Quotas, and Feature Entitlements.
 * Shared across saare-suite, saare-console, and control-plane worker.
 */

export const PLAN_IDS = {
  SANDBOX_FREE: 'SANDBOX_FREE',
  DISCOVER_FREE: 'DISCOVER_FREE',
  TRIAL_COMPLIANCE_7D: 'TRIAL_COMPLIANCE_7D',
  TRIAL_PRO_7D: 'TRIAL_PRO_7D',
  COMPLIANCE_249: 'COMPLIANCE_249',
  STARTER_199: 'COMPLIANCE_249',
  PROFESSIONAL_649: 'PROFESSIONAL_649',
  ENTERPRISE_1500: 'ENTERPRISE_1500',
  ENTERPRISE_1990: 'ENTERPRISE_1500',
  PRIVATE_CUSTOM: 'PRIVATE_CUSTOM',
};

export const TIERS = {
  SANDBOX: PLAN_IDS.SANDBOX_FREE,
  DISCOVER: PLAN_IDS.DISCOVER_FREE,
  COMPLIANCE: PLAN_IDS.COMPLIANCE_249,
  PROFESSIONAL: PLAN_IDS.PROFESSIONAL_649,
  ENTERPRISE: PLAN_IDS.ENTERPRISE_1500,
  PRIVATE: PLAN_IDS.PRIVATE_CUSTOM,
};

const FULL_CONSOLE_FEATURES = {
  control_layer_l7: true,
  sovereign_deployment: true,
  custom_keys_cmk: true,
  priority_sla: true,
  iso42001_reports: true,
  resilience_lab: true,
  api_access: true,
  export_dossier: true,
  siemExport: true,
  customRules: true,
  gpoDeploy: true,
  cpaasFailover: true,
};

export const ENTITLEMENT_DEFAULTS = {
  [PLAN_IDS.SANDBOX_FREE]: {
    id: PLAN_IDS.SANDBOX_FREE,
    name: 'Sandbox Evaluador (2 Asientos)',
    tier: 'sandbox',
    price_monthly: 0,
    max_ai_systems: 10,
    max_users: 2,
    maxSeats: 2,
    max_evidence_monthly: 1000,
    monthlyVerdicts: 1000,
    retention_days: 30,
    trial_days: 14,
    features: { ...FULL_CONSOLE_FEATURES },
  },
  [PLAN_IDS.DISCOVER_FREE]: {
    id: PLAN_IDS.DISCOVER_FREE,
    name: 'Discover',
    tier: 'free',
    price_monthly: 0,
    max_ai_systems: 5,
    max_users: 2,
    maxSeats: 2,
    max_evidence_monthly: 10000,
    monthlyVerdicts: 10000,
    retention_days: 90,
    features: { ...FULL_CONSOLE_FEATURES },
  },
  [PLAN_IDS.TRIAL_COMPLIANCE_7D]: {
    id: PLAN_IDS.TRIAL_COMPLIANCE_7D,
    name: 'Compliance Trial (7D)',
    tier: 'trial',
    price_monthly: 0,
    max_ai_systems: 10,
    max_users: 15,
    maxSeats: 15,
    max_evidence_monthly: 50000,
    monthlyVerdicts: 50000,
    retention_days: 365,
    features: { ...FULL_CONSOLE_FEATURES },
  },
  [PLAN_IDS.TRIAL_PRO_7D]: {
    id: PLAN_IDS.TRIAL_PRO_7D,
    name: 'Professional Trial (7D)',
    tier: 'trial',
    price_monthly: 0,
    max_ai_systems: 50,
    max_users: 50,
    maxSeats: 50,
    max_evidence_monthly: 100000,
    monthlyVerdicts: 100000,
    retention_days: 365,
    features: { ...FULL_CONSOLE_FEATURES },
  },
  [PLAN_IDS.COMPLIANCE_249]: {
    id: PLAN_IDS.COMPLIANCE_249,
    name: 'Compliance',
    tier: 'standard',
    price_monthly: 249,
    max_ai_systems: 10,
    max_users: 25,
    maxSeats: 25,
    max_evidence_monthly: 50000,
    monthlyVerdicts: 50000,
    retention_days: 365,
    features: { ...FULL_CONSOLE_FEATURES },
  },
  [PLAN_IDS.PROFESSIONAL_649]: {
    id: PLAN_IDS.PROFESSIONAL_649,
    name: 'Professional',
    tier: 'professional',
    price_monthly: 649,
    max_ai_systems: 50,
    max_users: 100,
    maxSeats: 100,
    max_evidence_monthly: 250000,
    monthlyVerdicts: 250000,
    retention_days: 730,
    features: { ...FULL_CONSOLE_FEATURES },
  },
  [PLAN_IDS.ENTERPRISE_1500]: {
    id: PLAN_IDS.ENTERPRISE_1500,
    name: 'Enterprise',
    tier: 'enterprise',
    price_monthly: 1500,
    max_ai_systems: 999,
    max_users: 999,
    maxSeats: 999,
    max_evidence_monthly: 1000000,
    monthlyVerdicts: 1000000,
    retention_days: 3650,
    features: { ...FULL_CONSOLE_FEATURES },
  },
  [PLAN_IDS.PRIVATE_CUSTOM]: {
    id: PLAN_IDS.PRIVATE_CUSTOM,
    name: 'Private Sovereign',
    tier: 'private',
    price_monthly: null,
    max_ai_systems: 9999,
    max_users: 9999,
    maxSeats: 9999,
    max_evidence_monthly: 9999999,
    monthlyVerdicts: 9999999,
    retention_days: 36500,
    features: { ...FULL_CONSOLE_FEATURES },
  },
};

export function sanitizePlanId(planId) {
  if (!planId) return PLAN_IDS.ENTERPRISE_1500;

  const upper = String(planId).toUpperCase().trim();
  if (ENTITLEMENT_DEFAULTS[upper]) return upper;

  if (upper.includes('SANDBOX') || upper.includes('SBX')) return PLAN_IDS.SANDBOX_FREE;
  if (upper.includes('ENTERPRISE')) return PLAN_IDS.ENTERPRISE_1500;
  if (upper.includes('PRO')) return PLAN_IDS.PROFESSIONAL_649;
  if (upper.includes('COMPLIANCE') || upper.includes('STARTER')) return PLAN_IDS.COMPLIANCE_249;
  if (upper.includes('DISCOVER') || upper.includes('FREE')) return PLAN_IDS.DISCOVER_FREE;

  return PLAN_IDS.ENTERPRISE_1500;
}

export function getPlanEntitlements(planId) {
  const sanitized = sanitizePlanId(planId);
  return ENTITLEMENT_DEFAULTS[sanitized] || ENTITLEMENT_DEFAULTS[PLAN_IDS.ENTERPRISE_1500];
}

export const getEntitlements = getPlanEntitlements;

export function isFeatureAllowed(planId, featureKey) {
  const entitlements = getPlanEntitlements(planId);
  return Boolean(entitlements?.features?.[featureKey] ?? true);
}

export function checkQuota(planId, quotaTypeOrUsage, currentUsage = 0) {
  const entitlements = getPlanEntitlements(planId);

  // Soporta tanto checkQuota(planId, currentUsage) como checkQuota(planId, 'max_users', currentUsage)
  const isDirectUsage = typeof quotaTypeOrUsage === 'number';
  const quotaKey = isDirectUsage ? 'max_evidence_monthly' : (quotaTypeOrUsage || 'max_evidence_monthly');
  const usage = isDirectUsage ? quotaTypeOrUsage : currentUsage;

  const limit = entitlements[quotaKey] ?? 1000000;
  const allowed = usage < limit;

  return {
    allowed,
    limit,
    current: usage,
    remaining: Math.max(0, limit - usage),
  };
}

export function isWithinQuota(planId, quotaTypeOrUsage, currentUsage = 0) {
  return checkQuota(planId, quotaTypeOrUsage, currentUsage).allowed;
}