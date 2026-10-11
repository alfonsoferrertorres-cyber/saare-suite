/**
 * S.A.A.R.E. Entitlements Engine (SGP 1.0)
 * Single Source of Truth for Plan Tiers, Quotas, and Feature Entitlements.
 * Shared across saare-suite, saare-console, and control-plane worker.
 */

export const PLAN_IDS = {
  DISCOVER_FREE: 'DISCOVER_FREE',
  TRIAL_COMPLIANCE_7D: 'TRIAL_COMPLIANCE_7D',
  TRIAL_PRO_7D: 'TRIAL_PRO_7D',
  COMPLIANCE_249: 'COMPLIANCE_249',
  PROFESSIONAL_649: 'PROFESSIONAL_649',
  ENTERPRISE_1500: 'ENTERPRISE_1500',
  PRIVATE_CUSTOM: 'PRIVATE_CUSTOM',
};

export const TIERS = {
  DISCOVER: PLAN_IDS.DISCOVER_FREE,
  COMPLIANCE: PLAN_IDS.COMPLIANCE_249,
  PROFESSIONAL: PLAN_IDS.PROFESSIONAL_649,
  ENTERPRISE: PLAN_IDS.ENTERPRISE_1500,
  PRIVATE: PLAN_IDS.PRIVATE_CUSTOM
};

export const ENTITLEMENT_DEFAULTS = {
  [PLAN_IDS.DISCOVER_FREE]: {
    id: PLAN_IDS.DISCOVER_FREE,
    name: 'Discover',
    tier: 'free',
    price_monthly: 0,
    max_ai_systems: 5,
    max_users: 10,
    max_evidence_monthly: 10000,
    retention_days: 90,
    features: {
      control_layer_l7: true,
      sovereign_deployment: true,
      custom_keys_cmk: true,
      priority_sla: true,
      iso42001_reports: true,
      resilience_lab: true,
      api_access: true,
      export_dossier: true,
    }
  },
  [PLAN_IDS.TRIAL_COMPLIANCE_7D]: {
    id: PLAN_IDS.TRIAL_COMPLIANCE_7D,
    name: 'Compliance Trial (7D)',
    tier: 'trial',
    price_monthly: 0,
    max_ai_systems: 10,
    max_users: 15,
    max_evidence_monthly: 50000,
    retention_days: 365,
    features: {
      control_layer_l7: true,
      sovereign_deployment: true,
      custom_keys_cmk: true,
      priority_sla: true,
      iso42001_reports: true,
      resilience_lab: true,
      api_access: true,
      export_dossier: true,
    }
  },
  [PLAN_IDS.TRIAL_PRO_7D]: {
    id: PLAN_IDS.TRIAL_PRO_7D,
    name: 'Professional Trial (7D)',
    tier: 'trial',
    price_monthly: 0,
    max_ai_systems: 50,
    max_users: 50,
    max_evidence_monthly: 100000,
    retention_days: 365,
    features: {
      control_layer_l7: true,
      sovereign_deployment: true,
      custom_keys_cmk: true,
      priority_sla: true,
      iso42001_reports: true,
      resilience_lab: true,
      api_access: true,
      export_dossier: true,
    }
  },
  [PLAN_IDS.COMPLIANCE_249]: {
    id: PLAN_IDS.COMPLIANCE_249,
    name: 'Compliance',
    tier: 'standard',
    price_monthly: 249,
    max_ai_systems: 10,
    max_users: 25,
    max_evidence_monthly: 50000,
    retention_days: 365,
    features: {
      control_layer_l7: true,
      sovereign_deployment: true,
      custom_keys_cmk: true,
      priority_sla: true,
      iso42001_reports: true,
      resilience_lab: true,
      api_access: true,
      export_dossier: true,
    }
  },
  [PLAN_IDS.PROFESSIONAL_649]: {
    id: PLAN_IDS.PROFESSIONAL_649,
    name: 'Professional',
    tier: 'professional',
    price_monthly: 649,
    max_ai_systems: 50,
    max_users: 100,
    max_evidence_monthly: 250000,
    retention_days: 730,
    features: {
      control_layer_l7: true,
      sovereign_deployment: true,
      custom_keys_cmk: true,
      priority_sla: true,
      iso42001_reports: true,
      resilience_lab: true,
      api_access: true,
      export_dossier: true,
    }
  },
  [PLAN_IDS.ENTERPRISE_1500]: {
    id: PLAN_IDS.ENTERPRISE_1500,
    name: 'Enterprise',
    tier: 'enterprise',
    price_monthly: 1500,
    max_ai_systems: 999,
    max_users: 999,
    max_evidence_monthly: 1000000,
    retention_days: 3650,
    features: {
      control_layer_l7: true,
      sovereign_deployment: true,
      custom_keys_cmk: true,
      priority_sla: true,
      iso42001_reports: true,
      resilience_lab: true,
      api_access: true,
      export_dossier: true,
    }
  },
  [PLAN_IDS.PRIVATE_CUSTOM]: {
    id: PLAN_IDS.PRIVATE_CUSTOM,
    name: 'Private Sovereign',
    tier: 'private',
    price_monthly: null,
    max_ai_systems: 9999,
    max_users: 9999,
    max_evidence_monthly: 9999999,
    retention_days: 36500,
    features: {
      control_layer_l7: true,
      sovereign_deployment: true,
      custom_keys_cmk: true,
      priority_sla: true,
      iso42001_reports: true,
      resilience_lab: true,
      api_access: true,
      export_dossier: true,
    }
  }
};

export function sanitizePlanId(planId) {
  if (!planId) return PLAN_IDS.ENTERPRISE_1500;
  
  const upper = String(planId).toUpperCase().trim();
  if (ENTITLEMENT_DEFAULTS[upper]) return upper;

  if (upper.includes('ENTERPRISE')) return PLAN_IDS.ENTERPRISE_1500;
  if (upper.includes('PRO')) return PLAN_IDS.PROFESSIONAL_649;
  if (upper.includes('COMPLIANCE')) return PLAN_IDS.COMPLIANCE_249;
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

export function checkQuota(planId, quotaType, currentUsage = 0) {
  const entitlements = getPlanEntitlements(planId);
  const limit = entitlements[quotaType] ?? 1000000;
  const allowed = currentUsage < limit;
  
  return {
    allowed,
    limit,
    current: currentUsage,
    remaining: Math.max(0, limit - currentUsage)
  };
}

export function isWithinQuota(planId, quotaType, currentUsage = 0) {
  return checkQuota(planId, quotaType, currentUsage).allowed;
}