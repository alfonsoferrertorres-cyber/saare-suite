/**
 * S.A.A.R.E. API v1 Core Contracts
 */

export interface TenantConfig {
  tenantId: string;
  organizationName: string;
  environment: 'development' | 'staging' | 'production';
  deviceId: string;
  controlPlaneUrl: string;
  activeScenarioId: string;
}

export interface ScenarioDefinition {
  id: string;
  codeName: string; // e.g. "cumplimiento-es"
  title: string;
  badge: string;
  description: string;
  category: 'CORPORATIVO' | 'BANCA' | 'SALUD';
  cryptoSignature: string;
  policiesCount: number;
}

export interface RunPayload {
  runId: string;
  tenantId: string;
  scenarioId: string;
  timestamp: string;
  promptInput: string;
}

export interface RunVerdict {
  runId: string;
  status: 'ACEPTADO' | 'RECHAZADO' | 'ENMASCARADO';
  explanation: string;
  executionTimeMs: number;
  memoryProof: {
    ramBufferAddress: string;
    sha256Digest: string;
    signatureEd25519: string;
  };
}

export interface EvidenceRecord {
  evidenceId: string;
  runId: string;
  timestamp: string;
  promptSummary: string;
  verdict: 'ACEPTADO' | 'RECHAZADO' | 'ENMASCARADO';
  scenarioApplied: string;
  cryptoSeal: string;
  complianceTags: string[];
}
