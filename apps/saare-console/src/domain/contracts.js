// saare-console/src/domain/contracts.js

/**
 * Rutas canónicas de S.A.A.R.E. Console
 */
export const CONSOLE_ROUTES = Object.freeze({
  OVERVIEW: {
    id: 'overview',
    path: '/overview',
    label: 'Resumen general',
    shortLabel: 'Resumen',
    description: 'Estado del nodo, indicadores operativos y actividad reciente.'
  },
  RUNTIME: {
    id: 'runtime',
    path: '/runtime',
    label: 'Operación L7',
    shortLabel: 'Operación L7',
    description: 'Conectividad PEP, evaluador ex-ante, directivas y protección.'
  },
  EVIDENCE: {
    id: 'evidence',
    path: '/evidence',
    label: 'Evidencias y custodia',
    shortLabel: 'Evidencias',
    description: 'Bóveda D1, firmas Ed25519, lotes Merkle, TSA y trazabilidad.'
  },
  GOVERNANCE: {
    id: 'governance',
    path: '/governance',
    label: 'GRC y cumplimiento',
    shortLabel: 'GRC',
    description: 'FRIA Art. 27, SoA ISO/IEC 42001, plantillas y dossiers.'
  },
  ADMINISTRATION: {
    id: 'administration',
    path: '/administration',
    label: 'Administración y despliegue',
    shortLabel: 'Admin',
    description: 'Multi-tenant, roles, credenciales, agentes y manifiestos.'
  }
});

export const ROUTE_LIST = Object.freeze(Object.values(CONSOLE_ROUTES));

export function resolveRouteByPath(pathname = '') {
  const clean = String(pathname || '').trim().toLowerCase();
  const match = ROUTE_LIST.find((r) => clean === r.path || clean.startsWith(`${r.path}/`));
  return match || CONSOLE_ROUTES.OVERVIEW;
}

/**
 * Gramática común de estados en toda la consola
 */
export const EXECUTION_STATUS = Object.freeze({
  VERIFIED: 'VERIFIED',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  NOT_RUN: 'NOT_RUN'
});

/**
 * Ciclo de vida real de una evidencia criptográfica
 * Nunca mezcla contingencia local con TSA externo confirmado.
 */
export const EVIDENCE_LIFECYCLE = Object.freeze({
  CREATED: 'CREATED',
  HASHED: 'HASHED',
  SIGNED: 'SIGNED',
  BATCHED: 'BATCHED',
  TSA_PENDING: 'TSA_PENDING',
  TSA_VERIFIED: 'TSA_VERIFIED',
  SEALED_FALLBACK_LOCAL: 'SEALED_FALLBACK_LOCAL',
  FAILED: 'FAILED'
});

/**
 * Ciclo de vida documental GRC (plantilla != certificación externa)
 */
export const DOCUMENT_LIFECYCLE = Object.freeze({
  DRAFT: 'BORRADOR',
  REVIEWED: 'REVISADO',
  APPROVED: 'APROBADO'
});

/**
 * Veredictos de evaluación L7
 */
export const L7_VERDICTS = Object.freeze({
  ALLOW: 'ALLOW',
  DENY: 'DENY',
  SANITIZED: 'SANITIZED',
  REVIEW: 'REVIEW'
});

/**
 * Roles RBAC y alias compatibles con sesiones existentes
 */
export const ROLES = Object.freeze({
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  TENANT_ADMIN: 'TENANT_ADMIN',
  SECURITY_OPERATOR: 'SECURITY_OPERATOR',
  FORENSIC_AUDITOR: 'FORENSIC_AUDITOR',
  GRC_OFFICER: 'GRC_OFFICER',
  READ_ONLY: 'READ_ONLY'
});

const ROLE_ALIASES = Object.freeze({
  PLATFORM_ADMIN: ROLES.PLATFORM_ADMIN,
  SUPER_ADMIN: ROLES.PLATFORM_ADMIN,
  CISO_ADMIN: ROLES.PLATFORM_ADMIN,
  TENANT_ADMIN: ROLES.TENANT_ADMIN,
  ADMIN: ROLES.TENANT_ADMIN,
  SECURITY_OPERATOR: ROLES.SECURITY_OPERATOR,
  OPERATOR: ROLES.SECURITY_OPERATOR,
  FORENSIC_AUDITOR: ROLES.FORENSIC_AUDITOR,
  AUDITOR: ROLES.FORENSIC_AUDITOR,
  TECHNICAL_AUDITOR: ROLES.FORENSIC_AUDITOR,
  GRC_OFFICER: ROLES.GRC_OFFICER,
  COMPLIANCE: ROLES.GRC_OFFICER,
  READ_ONLY: ROLES.READ_ONLY,
  VIEWER: ROLES.READ_ONLY
});

export function normalizeRole(rawRole = '') {
  const key = String(rawRole || '').trim().toUpperCase();
  return ROLE_ALIASES[key] || ROLES.READ_ONLY;
}

/**
 * Catálogo de acciones protegidas en la consola
 */
export const CONSOLE_ACTIONS = Object.freeze({
  VIEW_OVERVIEW: 'VIEW_OVERVIEW',
  EVALUATE_SIMULATION: 'EVALUATE_SIMULATION',
  EXECUTE_L7_INFERENCE: 'EXECUTE_L7_INFERENCE',
  TOGGLE_DIRECTIVE: 'TOGGLE_DIRECTIVE',
  TOGGLE_TENANT_RULES: 'TOGGLE_TENANT_RULES',
  TRIGGER_KILL_SWITCH: 'TRIGGER_KILL_SWITCH',
  SYNC_VAULT: 'SYNC_VAULT',
  VERIFY_SIGNATURE: 'VERIFY_SIGNATURE',
  VERIFY_MERKLE_INCLUSION: 'VERIFY_MERKLE_INCLUSION',
  SEAL_MERKLE_BATCH: 'SEAL_MERKLE_BATCH',
  EXPORT_CUSTODY: 'EXPORT_CUSTODY',
  EXPORT_LEC_ACTA: 'EXPORT_LEC_ACTA',
  RUN_FRIA_ASSESSMENT: 'RUN_FRIA_ASSESSMENT',
  EXPORT_GRC_PACKAGE: 'EXPORT_GRC_PACKAGE',
  EXPORT_GRANT_DOSSIER: 'EXPORT_GRANT_DOSSIER',
  EXPORT_OFFICIAL_REPORT: 'EXPORT_OFFICIAL_REPORT',
  MANAGE_TENANTS: 'MANAGE_TENANTS',
  MANAGE_CREDENTIALS: 'MANAGE_CREDENTIALS',
  DOWNLOAD_DEPLOYMENT_ASSETS: 'DOWNLOAD_DEPLOYMENT_ASSETS'
});

const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.PLATFORM_ADMIN]: new Set(Object.values(CONSOLE_ACTIONS)),
  [ROLES.TENANT_ADMIN]: new Set([
    CONSOLE_ACTIONS.VIEW_OVERVIEW,
    CONSOLE_ACTIONS.EVALUATE_SIMULATION,
    CONSOLE_ACTIONS.EXECUTE_L7_INFERENCE,
    CONSOLE_ACTIONS.TOGGLE_DIRECTIVE,
    CONSOLE_ACTIONS.TOGGLE_TENANT_RULES,
    CONSOLE_ACTIONS.TRIGGER_KILL_SWITCH,
    CONSOLE_ACTIONS.SYNC_VAULT,
    CONSOLE_ACTIONS.VERIFY_SIGNATURE,
    CONSOLE_ACTIONS.VERIFY_MERKLE_INCLUSION,
    CONSOLE_ACTIONS.SEAL_MERKLE_BATCH,
    CONSOLE_ACTIONS.EXPORT_CUSTODY,
    CONSOLE_ACTIONS.EXPORT_LEC_ACTA,
    CONSOLE_ACTIONS.RUN_FRIA_ASSESSMENT,
    CONSOLE_ACTIONS.EXPORT_GRC_PACKAGE,
    CONSOLE_ACTIONS.EXPORT_GRANT_DOSSIER,
    CONSOLE_ACTIONS.EXPORT_OFFICIAL_REPORT,
    CONSOLE_ACTIONS.MANAGE_CREDENTIALS,
    CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS
  ]),
  [ROLES.SECURITY_OPERATOR]: new Set([
    CONSOLE_ACTIONS.VIEW_OVERVIEW,
    CONSOLE_ACTIONS.EVALUATE_SIMULATION,
    CONSOLE_ACTIONS.EXECUTE_L7_INFERENCE,
    CONSOLE_ACTIONS.TOGGLE_DIRECTIVE,
    CONSOLE_ACTIONS.TOGGLE_TENANT_RULES,
    CONSOLE_ACTIONS.TRIGGER_KILL_SWITCH,
    CONSOLE_ACTIONS.SYNC_VAULT,
    CONSOLE_ACTIONS.VERIFY_SIGNATURE,
    CONSOLE_ACTIONS.VERIFY_MERKLE_INCLUSION,
    CONSOLE_ACTIONS.DOWNLOAD_DEPLOYMENT_ASSETS
  ]),
  [ROLES.FORENSIC_AUDITOR]: new Set([
    CONSOLE_ACTIONS.VIEW_OVERVIEW,
    CONSOLE_ACTIONS.EVALUATE_SIMULATION,
    CONSOLE_ACTIONS.SYNC_VAULT,
    CONSOLE_ACTIONS.VERIFY_SIGNATURE,
    CONSOLE_ACTIONS.VERIFY_MERKLE_INCLUSION,
    CONSOLE_ACTIONS.SEAL_MERKLE_BATCH,
    CONSOLE_ACTIONS.EXPORT_CUSTODY,
    CONSOLE_ACTIONS.EXPORT_LEC_ACTA,
    CONSOLE_ACTIONS.EXPORT_OFFICIAL_REPORT
  ]),
  [ROLES.GRC_OFFICER]: new Set([
    CONSOLE_ACTIONS.VIEW_OVERVIEW,
    CONSOLE_ACTIONS.RUN_FRIA_ASSESSMENT,
    CONSOLE_ACTIONS.EXPORT_GRC_PACKAGE,
    CONSOLE_ACTIONS.EXPORT_GRANT_DOSSIER,
    CONSOLE_ACTIONS.EXPORT_OFFICIAL_REPORT
  ]),
  [ROLES.READ_ONLY]: new Set([CONSOLE_ACTIONS.VIEW_OVERVIEW])
});

export function canPerformAction(rawRole, action) {
  const role = normalizeRole(rawRole);
  const allowed = ROLE_PERMISSIONS[role];
  return allowed ? allowed.has(action) : false;
}

/**
 * Helpers internos de normalización
 */
function pickFirstString(...values) {
  for (const val of values) {
    if (typeof val === 'string' && val.trim()) {
      return val.trim();
    }
  }
  return '';
}

function normalizeVerdictCode(rawVerdict = '', blocked = false, sanitized = false) {
  const v = String(rawVerdict || '').trim().toUpperCase();
  if (blocked || v.includes('DENY') || v.includes('BLOCK') || v.includes('RECHAZ')) {
    return L7_VERDICTS.DENY;
  }
  if (sanitized || v.includes('SANITIZ') || v.includes('DETOX') || v.includes('REDACT')) {
    return L7_VERDICTS.SANITIZED;
  }
  if (v.includes('REVIEW') || v.includes('REVISION')) {
    return L7_VERDICTS.REVIEW;
  }
  return L7_VERDICTS.ALLOW;
}

/**
 * Contrato normalizado para estado del nodo / runtime
 */
export function normalizeNodeStatus(raw = {}, fallbackTenant = '') {
  const statusRaw = String(raw.status || '').trim().toUpperCase();
  const isHealthy =
    statusRaw === 'HEALTHY' ||
    statusRaw === 'OPERATIVO' ||
    statusRaw === 'OK' ||
    raw.ok === true;

  return {
    nodeId: pickFirstString(raw.nodeId, raw.node, raw.service, 'SAARE-EDGE-PEP'),
    tenantId: pickFirstString(raw.tenantId, raw.tenant, fallbackTenant),
    mode: pickFirstString(raw.mode, 'FAIL-CLOSED'),
    status: isHealthy ? 'OPERATIVO' : statusRaw || 'NO_DISPONIBLE',
    healthy: isHealthy,
    latencyP99Ms: Number(raw.latencyP99Ms ?? raw.latencyMs ?? 0) || 0,
    activePolicies: Number(raw.activePolicies ?? raw.activeScenarios ?? 0) || 0,
    trustAnchor: pickFirstString(raw.trustAnchor),
    vaultSource: pickFirstString(raw.vaultSource),
    checkedAt: new Date().toISOString()
  };
}

/**
 * Contrato normalizado para cada registro/traza de la bóveda D1
 */
export function normalizeTraceRecord(raw = {}, fallbackTenant = '') {
  const evidenceId = pickFirstString(
    raw.evidenceId,
    raw.evidence_id,
    raw.traceId,
    raw.trace_id,
    raw.id
  );
  const hash = pickFirstString(
    raw.hash,
    raw.chainHash,
    raw.chain_hash,
    raw.ms3vIntegrityHash,
    raw.ms3v_hash,
    raw.sha256
  );
  const batchId = pickFirstString(raw.batchId, raw.batch_id, raw.merkleBatchId);
  const tsaRaw = String(raw.tsaStatus || raw.tsa_status || '').trim().toUpperCase();

  let lifecycle = EVIDENCE_LIFECYCLE.CREATED;
  if (tsaRaw === 'TSA_VERIFIED' || tsaRaw === 'QUALIFIED_CONFIRMED') {
    lifecycle = EVIDENCE_LIFECYCLE.TSA_VERIFIED;
  } else if (tsaRaw === 'SEALED_FALLBACK_LOCAL' || tsaRaw.includes('FALLBACK')) {
    lifecycle = EVIDENCE_LIFECYCLE.SEALED_FALLBACK_LOCAL;
  } else if (batchId) {
    lifecycle = EVIDENCE_LIFECYCLE.BATCHED;
  } else if (raw.signature || raw.ed25519Signature) {
    lifecycle = EVIDENCE_LIFECYCLE.SIGNED;
  } else if (hash) {
    lifecycle = EVIDENCE_LIFECYCLE.HASHED;
  }

  const signatureStatus =
    raw.signatureVerified === true || raw.merkleVerified === true
      ? EXECUTION_STATUS.VERIFIED
      : raw.signatureVerified === false
      ? EXECUTION_STATUS.FAILED
      : EXECUTION_STATUS.NOT_RUN;

  return {
    id: evidenceId || `tr_${Math.random().toString(36).slice(2, 10)}`,
    evidenceId,
    traceId: pickFirstString(raw.traceId, raw.trace_id, evidenceId),
    tenantId: pickFirstString(raw.tenantId, raw.tenant_id, raw.tenant, fallbackTenant),
    user: pickFirstString(raw.user, raw.actor, raw.user_email),
    timestamp: pickFirstString(raw.timestamp, raw.created_at, raw.createdAt),
    promptPreview: pickFirstString(raw.prompt, raw.instruction, raw.promptPreview, '—'),
    verdict: normalizeVerdictCode(
      raw.verdict || raw.decision,
      Boolean(raw.blocked),
      Boolean(raw.sanitizedInRam || raw.sanitized)
    ),
    rawVerdict: pickFirstString(raw.verdict, raw.decision, 'ALLOW'),
    policyVersion: pickFirstString(raw.policyVersion, raw.policy_version, raw.scenarioId, 'SGP-1.0'),
    hash,
    signatureStatus,
    batchId,
    tsaStatus: tsaRaw || (batchId ? 'TSA_PENDING' : 'NOT_RUN'),
    lifecycle,
    latencyMs: Number(raw.latencyMs ?? raw.latency_ms ?? 0) || 0,
    provider: pickFirstString(raw.provider, raw.modelProvider),
    reason: pickFirstString(raw.reason, raw.blockReason, raw.message)
  };
}

/**
 * Contrato normalizado para evaluación ex-ante / inferencia L7
 */
export function normalizeVerdictResponse(raw = {}, options = {}) {
  const isSimulation = Boolean(options.simulation);
  const enforcement = raw.enforcement && typeof raw.enforcement === 'object' ? raw.enforcement : {};
  const inference = raw.inference && typeof raw.inference === 'object' ? raw.inference : {};
  const sanitizedInRam = Boolean(enforcement.sanitizedInRam ?? raw.sanitizedInRam);

  const verdict = normalizeVerdictCode(
    enforcement.verdict || raw.decision || raw.verdict,
    raw.decision === 'DENY' || raw.success === false,
    sanitizedInRam
  );

  const traceId = pickFirstString(
    raw.trace_id,
    raw.traceId,
    raw.evidence_id,
    enforcement.traceId
  );

  const hash = pickFirstString(
    enforcement.ms3vIntegrityHash,
    raw.hash,
    raw.chainHash,
    raw.evidence_hash
  );

  const hasError = Boolean(raw.error) && verdict === L7_VERDICTS.DENY && !traceId;

  return {
    ok: !hasError && verdict !== L7_VERDICTS.DENY,
    simulation: isSimulation,
    executionStatus: hasError ? EXECUTION_STATUS.FAILED : EXECUTION_STATUS.VERIFIED,
    verdict,
    rawDecision: pickFirstString(raw.decision, enforcement.verdict, verdict),
    traceId,
    evidenceId: pickFirstString(raw.evidence_id, raw.evidenceId, traceId),
    tenantId: pickFirstString(raw.tenant, raw.tenant_id, options.tenantId),
    hash,
    latencyMs: Number(enforcement.latencyMs ?? raw.latencyMs ?? raw.latency_ms ?? 0) || 0,
    piiDetected: Boolean(enforcement.piiDetected ?? raw.piiDetected ?? raw.threat_detected),
    sanitizedInRam,
    provider: pickFirstString(inference.provider, raw.provider, isSimulation ? 'SIMULATOR_RAM' : ''),
    responseContent: pickFirstString(inference.responseContent, raw.responseContent, raw.output),
    rulesApplied: Array.isArray(raw.rulesApplied)
      ? raw.rulesApplied
      : Array.isArray(enforcement.rulesApplied)
      ? enforcement.rulesApplied
      : [],
    error: pickFirstString(raw.error, hasError ? raw.message : ''),
    message: pickFirstString(raw.message, raw.error)
  };
}

/**
 * Contrato normalizado para sellado de lotes Merkle + RFC 3161
 */
export function normalizeBatchSealResponse(raw = {}, fallbackTenant = '') {
  const batchId = pickFirstString(raw.batchId, raw.batch_id);
  const merkleRoot = pickFirstString(raw.merkleRoot, raw.merkle_root, raw.root);
  const tsaStatusRaw = String(raw.tsaStatus || raw.tsa_status || raw.tsaMode || '')
    .trim()
    .toUpperCase();

  let lifecycle = EVIDENCE_LIFECYCLE.FAILED;
  let status = EXECUTION_STATUS.FAILED;

  if (batchId && merkleRoot) {
    if (tsaStatusRaw === 'TSA_VERIFIED' || tsaStatusRaw === 'QUALIFIED_CONFIRMED') {
      lifecycle = EVIDENCE_LIFECYCLE.TSA_VERIFIED;
      status = EXECUTION_STATUS.VERIFIED;
    } else if (tsaStatusRaw.includes('FALLBACK') || tsaStatusRaw === 'SEALED_FALLBACK_LOCAL') {
      lifecycle = EVIDENCE_LIFECYCLE.SEALED_FALLBACK_LOCAL;
      status = EXECUTION_STATUS.PENDING;
    } else {
      lifecycle = EVIDENCE_LIFECYCLE.TSA_PENDING;
      status = EXECUTION_STATUS.PENDING;
    }
  }

  const ok = Boolean(batchId && merkleRoot);

  return {
    ok,
    status,
    lifecycle,
    batchId,
    tenantId: pickFirstString(raw.tenantId, raw.tenant, fallbackTenant),
    merkleRoot,
    leavesCount: Number(raw.leavesCount ?? raw.count ?? raw.totalLeaves ?? 0) || 0,
    tsaStatus: tsaStatusRaw || (batchId ? 'TSA_PENDING' : 'FAILED'),
    tsaTokenRef: pickFirstString(raw.tsaTokenRef, raw.tsaReference, raw.rfc3161Token),
    custodyQuorum: pickFirstString(raw.custodyQuorum, raw.custodyMode, '2-DE-3'),
    sealedAt: pickFirstString(raw.sealedAt, raw.timestamp, new Date().toISOString()),
    error: ok ? '' : pickFirstString(raw.error, raw.message, 'No se pudo completar el sellado del lote.'),
    raw
  };
}

/**
 * Contrato normalizado para verificación de firma Ed25519 / inclusión Merkle
 * Nunca declara VERIFIED sin confirmación explícita del backend.
 */
export function normalizeSignatureVerifyResponse(raw = {}, targetHash = '') {
  const confirmed =
    raw.verified === true ||
    raw.valid === true ||
    String(raw.status || '').toUpperCase() === 'VERIFIED';

  return {
    operation: pickFirstString(raw.operation, 'VERIFY_ED25519'),
    status: confirmed ? EXECUTION_STATUS.VERIFIED : EXECUTION_STATUS.FAILED,
    verified: confirmed,
    traceId: pickFirstString(raw.trace_id, raw.traceId),
    keyId: pickFirstString(raw.key_id, raw.keyId),
    payloadDigest: pickFirstString(raw.payload_digest, raw.leafHash, targetHash),
    merkleRoot: pickFirstString(raw.merkleRoot, raw.merkle_root),
    verificationMethod: pickFirstString(raw.verification_method, 'ED25519'),
    verifiedAt: confirmed ? pickFirstString(raw.verified_at, new Date().toISOString()) : '',
    error: confirmed
      ? ''
      : pickFirstString(raw.error, raw.message, 'Verificación no confirmada por el servidor.')
  };
}