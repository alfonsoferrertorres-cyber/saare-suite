// saare-console/src/utils/telemetry.js — Utilidades y Procesamiento de Telemetría L7 S.A.A.R.E.

export const TELEMETRY_DECISIONS = {
  ALLOW: 'ALLOW',
  DENY: 'DENY',
  SANITIZED: 'SANITIZED',
  FLAGGED: 'FLAGGED'
};

export const TELEMETRY_CATEGORIES = {
  PRIVACIDAD: 'PRIVACIDAD',
  CIBERSEGURIDAD: 'CIBERSEGURIDAD',
  WORKFLOWS: 'WORKFLOWS',
  FINANCIERO: 'FINANCIERO',
  TRAZABILIDAD: 'TRAZABILIDAD'
};

/**
 * Parsea y normaliza una traza de telemetría proveniente de la API REST o canal SSE
 * @param {Object} rawTrace 
 * @returns {Object|null}
 */
export function parseTelemetryTrace(rawTrace) {
  if (!rawTrace || typeof rawTrace !== 'object') return null;

  const id = rawTrace.evidence_id || rawTrace.id || `EVID-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const isDeny = rawTrace.decision === 'DENY' || rawTrace.verdict === 'RECHAZADO' || rawTrace.verdict === 'REJECTED';
  
  let prompt = rawTrace.prompt || rawTrace.promptInput || rawTrace.rawPrompt || '';
  let response = rawTrace.responseOutput || rawTrace.llmResponse || '';

  try {
    if (typeof prompt === 'string' && prompt.includes('%')) prompt = decodeURIComponent(prompt);
    if (typeof response === 'string' && response.includes('%')) response = decodeURIComponent(response);
  } catch (e) {
    // Mantener cadena original si falla la decodificación URI
  }

  const timestamp = rawTrace.timestamp || rawTrace.created_at || new Date().toISOString();

  return {
    id,
    time: !isNaN(Date.parse(timestamp)) ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
    rawTimestamp: timestamp,
    cat: rawTrace.cat || rawTrace.category || (isDeny ? 'PII_DETECTED' : 'AUDITORIA_CONFORME'),
    sub: rawTrace.sub || rawTrace.norma || 'EU AI Act / LOPDGDD',
    prompt: String(prompt),
    responseOutput: String(response),
    verdict: isDeny ? 'RECHAZADO' : 'PERMITIDO',
    decision: isDeny ? TELEMETRY_DECISIONS.DENY : TELEMETRY_DECISIONS.ALLOW,
    anchored: rawTrace.anchored !== undefined ? Number(rawTrace.anchored) : 1,
    type: rawTrace.type || (isDeny ? TELEMETRY_CATEGORIES.PRIVACIDAD : TELEMETRY_CATEGORIES.WORKFLOWS),
    user: rawTrace.user || rawTrace.user_id || 'auditor@saare.es',
    tenant: rawTrace.tenant || rawTrace.tenant_id || 'ENTERPRISE',
    merkleRoot: rawTrace.merkle_root || rawTrace.merkleRoot || rawTrace.proofBundle?.payloadHash || null,
    node: rawTrace.node || 'SAARE_VAULT_NODE_01',
    latency: Number(rawTrace.latency) || 0,
    rawJson: rawTrace
  };
}

/**
 * Calcula agregados y KPIs de una lista de trazas de telemetría
 * @param {Array} traces 
 * @returns {Object}
 */
export function calculateTelemetryMetrics(traces = []) {
  if (!Array.isArray(traces) || traces.length === 0) {
    return {
      totalInspecciones: 0,
      totalDeny: 0,
      totalAllow: 0,
      tasaBloqueo: '0.0',
      avgLatencyMs: '0.0'
    };
  }

  const validTraces = traces.filter(Boolean);
  const total = validTraces.length;
  const denyCount = validTraces.filter(t => t.decision === 'DENY' || t.verdict === 'RECHAZADO').length;
  const allowCount = total - denyCount;
  const blockRate = total > 0 ? ((denyCount / total) * 100).toFixed(1) : '0.0';
  
  const totalLatency = validTraces.reduce((sum, t) => sum + (Number(t.latency) || 0), 0);
  const avgLatency = total > 0 ? (totalLatency / total).toFixed(1) : '0.0';

  return {
    totalInspecciones: total,
    totalDeny: denyCount,
    totalAllow: allowCount,
    tasaBloqueo: blockRate,
    avgLatencyMs: avgLatency
  };
}