// saare-console/src/config/saareState.js — Configuración Global Multitenant S.A.A.R.E.

const getEnvVar = (keys, fallback = '') => {
  const keyList = Array.isArray(keys) ? keys : [keys];
  try {
    for (const key of keyList) {
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined && import.meta.env[key] !== '') {
        return import.meta.env[key];
      }
      if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined && process.env[key] !== '') {
        return process.env[key];
      }
    }
  } catch {
    // Fallback silencioso en entornos restringidos
  }
  return fallback;
};

export const SAARE_CONFIG = Object.freeze({
  SPEC_VERSION: getEnvVar(['VITE_SPEC_VERSION'], 'v12.1'),
  SGP_VERSION: getEnvVar(['VITE_SGP_VERSION'], 'SGP 1.0'),
  BUILD_VERSION: getEnvVar(['VITE_BUILD_VERSION'], 'PRODUCTION'),
  COMPANY_NAME: getEnvVar(['VITE_COMPANY_NAME'], 'S.A.A.R.E. Technologies S.L.'),

  API_BASE_URL: getEnvVar(['VITE_SAARE_API_BASE_URL', 'VITE_API_BASE_URL'], 'https://api.saare.es/api/v1'),
  CONTROL_PLANE_URL: getEnvVar(['VITE_SAARE_CONTROL_PLANE_URL', 'VITE_CONTROL_PLANE_URL'], 'https://api.saare.es'),

  DEFAULT_TENANT: getEnvVar(['VITE_SAARE_DEFAULT_TENANT', 'VITE_DEFAULT_TENANT'], ''),
  DEFAULT_USER: getEnvVar(['VITE_SAARE_DEFAULT_USER', 'VITE_DEFAULT_USER'], ''),
  DEFAULT_ROLE: getEnvVar(['VITE_SAARE_DEFAULT_ROLE', 'VITE_DEFAULT_ROLE'], 'CISO_ADMIN'),
  TRUST_ANCHOR: getEnvVar(['VITE_SAARE_TRUST_ANCHOR', 'VITE_TRUST_ANCHOR'], ''),
  SAFE_CREATIVE_ID: getEnvVar(['VITE_SAARE_SAFE_CREATIVE_ID', 'VITE_SAFE_CREATIVE_ID'], ''),

  EXPEDIENTE_MASTER: getEnvVar(['VITE_EXPEDIENTE_MASTER'], ''),
  MERKLE_ROOT_VERSION: getEnvVar(['VITE_MERKLE_ROOT_VERSION'], 'SGP-1.0'),
  LEGAL_FRAMEWORK: getEnvVar(['VITE_LEGAL_FRAMEWORK'], 'EU AI Act / RGPD / ISO 27037'),

  MODULE_5: Object.freeze({
    BOOTSTRAP_COMMAND: getEnvVar(['VITE_BOOTSTRAP_COMMAND'], 'Iniciar_cumplimiento_exante_saare --route-vault=D1'),
    WITNESS_TAG: getEnvVar(['VITE_WITNESS_TAG'], '[MS3V-COMPLIANCE-L7-OK]'),
    ROUTE_VAULT: getEnvVar(['VITE_ROUTE_VAULT'], 'D1'),
    LATENCY_THRESHOLD_MS: Number(getEnvVar(['VITE_LATENCY_THRESHOLD_MS'], '1.12')) || 1.12,
    FORMAL_TOLERANCE: Number(getEnvVar(['VITE_FORMAL_TOLERANCE'], '0.01')) || 0.01
  }),

  ACTIVE_HEADERS: Object.freeze([
    'X-SAARE-L7-DASHBOARD-ACTIVE',
    'X-SAARE-L7-ONPREM-AGNOSTIC-SECURE',
    'X-SAARE-L7-ZERO-DISK-PASS',
    'X-SAARE-L7-FAIL-STOP-ENFORCED'
  ])
});

export default SAARE_CONFIG;