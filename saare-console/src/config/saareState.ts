// src/config/saareState.ts — Estado Global de la Consola GRC S.A.A.R.E.
const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
);

export const SAARE_CONFIG = {
  WORKER_URL: isLocal ? "http://127.0.0.1:8787/api/v1" : "https://api.saare.es/api/v1",
  DEFAULT_TENANT: "ENTERPRISE",
  DEFAULT_ROLE: "CISO_ADMIN",
  TELEMETRY_INTERVAL_MS: 3000,
  SAFE_CREATIVE_ID: "2607076315021",
  TRUST_ANCHOR: "SAARE-MD-IPRES-2026"
};

export interface TenantContext {
  tenantId: string;
  userEmail: string;
  token: string;
  role: string;
}