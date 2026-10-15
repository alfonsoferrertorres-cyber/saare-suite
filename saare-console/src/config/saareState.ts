// src/config/saareState.ts — Estado Global S.A.A.R.E. v8.4 (SGP 1.0)

const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1'
);

export const SAARE_CONFIG = {
  API_HOST: isLocal ? 'http://127.0.0.1:3001' : 'https://control-plane.alfonsoferrertorres.workers.dev',
  WORKER_URL: isLocal ? 'http://127.0.0.1:3001/api/v1' : 'https://control-plane.alfonsoferrertorres.workers.dev/api/v1',
  DEFAULT_TENANT: 'ENTERPRISE',
  DEFAULT_ROLE: 'CISO_ADMIN',
  TELEMETRY_INTERVAL_MS: 3000,
  SAFE_CREATIVE_ID: '2607076315021',
  TRUST_ANCHOR: 'D1-EU-WESTERN-EUROPE',
  SPEC_VERSION: 'v8.4-SGP1.0',

  // Configuración predeterminada del Modo Sandbox 0 €
  SANDBOX_MODE: {
    ENABLED: true,
    PRICE_EUR: 0,
    EXPIRES_AT: null, // Acceso permanente ilimitado
    UNLIMITED: true,
    TIER: 'SANDBOX'
  },

  // Configuración extendida de la Bóveda Sovereign D1
  VAULT: {
    REGION: 'Western Europe',
    JURISDICTION: 'EU',
    COMPLIANCE_STANDARD: 'EU AI Act Art. 15 / ISO/IEC 27037:2012 / DORA / ISO 42001'
  }
};

export type ViewMode = 'EXECUTIVE' | 'GRC_AUDIT' | 'CYBER_RESILIENCE';
export type ClaimLevel = 'DECLARED' | 'IMPLEMENTED' | 'TESTED' | 'VERIFIED' | 'CERTIFIED';
export type LicenseTier = 'SANDBOX' | 'COMPLIANCE' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface LicenseState {
  tier: LicenseTier;
  priceEur: number;
  expiresAt: string | null;
  unlimited: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  daysRemaining: string;
  features: string[];
}

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
  tier: LicenseTier;
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

// Estado global inicial predeterminado para la Consola GRC
export const DEFAULT_LICENSE_STATE: LicenseState = {
  tier: 'SANDBOX',
  priceEur: 0,
  expiresAt: null,
  unlimited: true,
  status: 'ACTIVE',
  daysRemaining: '∞ (Permanente)',
  features: [
    'L7_INTERCEPTION',
    'AUDIT_VAULT',
    'ISO42001_COMPLIANCE',
    'ZERO_DISK_RAM'
  ]
};