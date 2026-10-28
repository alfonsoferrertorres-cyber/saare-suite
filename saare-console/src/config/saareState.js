// saare-console/src/config/saareState.js — Configuración Global S.A.A.R.E. (SGP 1.0 / V12.1 Producción Virginizado)

export const SAARE_CONFIG = {
  SPEC_VERSION: "v10.0 / SGP 1.0",
  BUILD_VERSION: "12.1-PRODUCTION",
  DEFAULT_TENANT: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SAARE_DEFAULT_TENANT) || "ORGANISMO_DEMO_01",
  DEFAULT_USER: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SAARE_DEFAULT_USER) || "",
  DEFAULT_ROLE: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SAARE_DEFAULT_ROLE) || "CISO_ADMIN",
  TRUST_ANCHOR: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SAARE_TRUST_ANCHOR) || "https://vault.saare.es",
  SAFE_CREATIVE_ID: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SAARE_SAFE_CREATIVE_ID) || "RPI-2607076315021",
  EXPEDIENTE_MASTER: "MS3V-RECON-VALID-2026-MASTER",
  MERKLE_ROOT_VERSION: "MS3V-SGP-1.0",
  LEGAL_FRAMEWORK: "Art. 326 LEC / Ley 1/2019 / EU AI Act Art. 27",

  // PARÁMETROS DEL MÓDULO 5 (NOTARIO DIGITAL EX-ANTE D1)
  MODULE_5: {
    BOOTSTRAP_COMMAND: "Iniciar_cumplimiento_exante_saare --route-vault=D1",
    WITNESS_TAG: "[MS3V-COMPLIANCE-L7-OK]",
    ROUTE_VAULT: "D1",
    LATENCY_THRESHOLD_MS: 1.12,
    FORMAL_TOLERANCE: 0.01 // Delta Estructural < 0.01%
  },

  // CABECERAS PERSISTENTES L7
  ACTIVE_HEADERS: [
    "X-SAARE-L7-DASHBOARD-ACTIVE",
    "X-SAARE-L7-ONPREM-AGNOSTIC-SECURE",
    "X-SAARE-L7-ZERO-DISK-PASS",
    "X-SAARE-L7-FAIL-STOP-ENFORCED"
  ]
};

export default SAARE_CONFIG;