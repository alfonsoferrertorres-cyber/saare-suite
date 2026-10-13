// saare-console/src/types/saare.ts

export type VerdictDecision = 'ALLOW' | 'DENY';
export type VerdictLabel = 'PERMITIDO' | 'RECHAZADO';
export type UserRole = 
  | 'OPERATIONAL_AGENT_USER' 
  | 'BOARD_EXECUTIVE_LEVEL_1' 
  | 'DPO_GRC_LEVEL_2' 
  | 'CISO_SECOPS_LEVEL_3' 
  | 'CISO_ADMIN';

export interface ProofBundleData {
  verdictId: string;
  payloadHash: string;
  ed25519Signature: string;
  merkleRoot: string;
  rfc3161Timestamp: string;
  isQualifiedTSA: boolean;
  policyVersion: string;
  controlVersion: string;
  runtimeVersion: string;
  systemId: string;
  claimLevel: 'VERIFIED' | 'TESTED';
  auditStandard: string;
}

export interface GrantMetadata {
  grantCategory: string;
  eligibleItem: string;
  dnshImpact: string;
  auditStandard: string;
  complianceCode: string;
}

export interface ExecutionMetrics {
  latency_ms: number;
  memory_mode: 'mlock_ephemeral' | 'ram_volatile';
}

export interface EvidenceRecord {
  id: string;
  evidence_id: string;
  trace_id: string;
  verdictId: string;
  decision: VerdictDecision;
  verdict: VerdictLabel;
  user: string;
  tenant: string;
  prompt: string;
  timestamp: string;
  doubleChainOfCustody?: boolean;
  grantMetadata: GrantMetadata;
  proofBundle: ProofBundleData;
}

export interface JudgeApiResponse {
  status: 'SUCCESS' | 'ERROR';
  verdict: VerdictLabel;
  decision: VerdictDecision;
  sanitizedPayload: string;
  evidence_id: string;
  trace_id: string;
  metrics: ExecutionMetrics;
  doubleChainOfCustody?: boolean;
  grantMetadata: GrantMetadata;
  proofBundle: ProofBundleData;
}

export interface VaultRunsApiResponse {
  success: boolean;
  evidences: EvidenceRecord[];
  runs: EvidenceRecord[];
  vaultSource: 'D1_HYBRID' | 'KV_STORE' | 'RAM';
}