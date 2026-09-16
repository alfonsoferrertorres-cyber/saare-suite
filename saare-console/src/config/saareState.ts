// src/config/saareState.ts — Estado Global S.A.A.R.E. v8.1 (SGP 1.0)
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
  TRUST_ANCHOR: "SAARE-MD-IPRES-2026",
  SPEC_VERSION: "v8.1 SRP"
};

// Modos de Vista Comercial y Perfiles de Consola
export type ViewMode = 'EXECUTIVE' | 'GRC_AUDIT' | 'CYBER_RESILIENCE';

// Taxonomía Probatoria Canónica S.A.A.R.E.
export type ClaimLevel = 'DECLARED' | 'IMPLEMENTED' | 'TESTED' | 'VERIFIED' | 'CERTIFIED';

export interface ProofBundle {
  verdictId: string;
  payloadHash: string;
  ed25519Signature: string;
  merkleRoot: string;
  rfc3161Timestamp: string;
  claimLevel: ClaimLevel;
  auditStandard?: string;
}

export interface TenantContext {
  tenantId: string;
  userEmail: string;
  token: string;
  role: string;
}