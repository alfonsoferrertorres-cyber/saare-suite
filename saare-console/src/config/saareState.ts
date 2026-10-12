// src/config/saareState.ts — Estado Global S.A.A.R.E. v8.2 (SGP 1.0)

const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
);

export const SAARE_CONFIG = {
  API_HOST: isLocal ? 'http://127.0.0.1:3001' : 'https://api.saare.es',
  WORKER_URL: isLocal ? 'http://127.0.0.1:3001/api/v1' : 'https://api.saare.es/api/v1',
  DEFAULT_TENANT: 'ENTERPRISE',
  DEFAULT_ROLE: 'CISO_ADMIN',
  TELEMETRY_INTERVAL_MS: 3000,
  SAFE_CREATIVE_ID: '2607076315021',
  TRUST_ANCHOR: 'D1-EU-WESTERN-EUROPE', // Trust Anchor alineado con la región UE de Bóveda D1
  SPEC_VERSION: 'v8.2-SGP1.0',

  // Configuración extendida de la Bóveda Sovereign D1
  VAULT: {
    REGION: 'Western Europe',
    JURISDICTION: 'EU',
    COMPLIANCE_STANDARD: 'EU AI Act Art. 15 / ISO/IEC 27037:2012 / DORA'
  }
};

export type ViewMode = 'EXECUTIVE' | 'GRC_AUDIT' | 'CYBER_RESILIENCE';
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

export interface EvidenceRecord {
  id: string;
  time: string;
  rawTimestamp: string;
  cat: string;
  sub: string;
  prompt: string;
  responseOutput?: string;
  verdict: 'PERMITIDO' | 'RECHAZADO';
  decision: 'ALLOW' | 'DENY';
  anchored: number;
  type: string;
  user: string;
  tenant: string;
  merkleRoot?: string | null;
  node: string;
  latency?: number | null;
  proofBundle?: ProofBundle | null;
  rawJson?: Record<string, unknown>;
}