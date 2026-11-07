// saare-console/src/utils/telemetry.js — Utilidades y Procesamiento de Telemetría L7 S.A.A.R.E. (SGP 1.0)

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
 * Parsea y normaliza una traza de telemetría proveniente de la API REST o canal SSE en vivo
 * @param {Object} rawTrace 
 * @returns {Object|null}
 */
export function parseTelemetryTrace(rawTrace) {
  if (!rawTrace || typeof rawTrace !== 'object') return null;

  const id = rawTrace.evidence_id || rawTrace.id || `EVID-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  const rawDecision = String(rawTrace.decision || rawTrace.verdict || '').toUpperCase();
  const isDeny = rawDecision === 'DENY' || rawDecision === 'RECHAZADO' || rawDecision === 'REJECTED';
  const isSanitized = rawDecision === 'SANITIZED' || rawTrace.sanitizedInRam || rawTrace.enforcement?.sanitizedInRam;

  let prompt = rawTrace.prompt || rawTrace.promptInput || rawTrace.rawPrompt || '';
  let response = rawTrace.responseOutput || rawTrace.llmResponse || rawTrace.sanitizedPrompt || '';

  try {
    if (typeof prompt === 'string' && prompt.includes('%')) prompt = decodeURIComponent(prompt);
    if (typeof response === 'string' && response.includes('%')) response = decodeURIComponent(response);
  } catch (e) {
    // Conservar cadenas originales si falla la decodificación URI
  }

  const timestamp = rawTrace.timestamp || rawTrace.created_at || new Date().toISOString();

  let finalDecision = TELEMETRY_DECISIONS.ALLOW;
  let finalVerdict = 'PERMITIDO';

  if (isDeny) {
    finalDecision = TELEMETRY_DECISIONS.DENY;
    finalVerdict = 'RECHAZADO';
  } else if (isSanitized) {
    finalDecision = TELEMETRY_DECISIONS.SANITIZED;
    finalVerdict = 'SANITIZADO';
  }

  return {
    id,
    time: !isNaN(Date.parse(timestamp)) ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
    rawTimestamp: timestamp,
    cat: rawTrace.cat || rawTrace.category || (isDeny ? 'PII_DETECTED' : 'AUDITORIA_CONFORME'),
    sub: rawTrace.sub || rawTrace.norma || 'EU AI Act / LOPDGDD',
    prompt: String(prompt),
    responseOutput: String(response),
    verdict: finalVerdict,
    decision: finalDecision,
    anchored: rawTrace.anchored !== undefined ? Number(rawTrace.anchored) : 1,
    type: rawTrace.type || (isDeny ? TELEMETRY_CATEGORIES.PRIVACIDAD : TELEMETRY_CATEGORIES.WORKFLOWS),
    user: rawTrace.user || rawTrace.user_id || rawTrace.operator || 'alfonsoferrertorres@gmail.com',
    tenant: rawTrace.tenant || rawTrace.tenant_id || 'ORGANISMO_DEMO_01',
    merkleRoot: rawTrace.merkle_root || rawTrace.merkleRoot || rawTrace.proofBundle?.payloadHash || null,
    node: rawTrace.node || 'SAARE_VAULT_NODE_01',
    latency: typeof rawTrace.latency === 'number' ? rawTrace.latency : parseFloat(rawTrace.latency || '0.84'),
    rawJson: rawTrace
  };
}

/**
 * Calcula agregados y KPIs de una lista de trazas de telemetría para los contadores del Dashboard
 * @param {Array} traces 
 * @returns {Object}
 */
export function calculateTelemetryMetrics(traces = []) {
  if (!Array.isArray(traces) || traces.length === 0) {
    return {
      totalInspecciones: 0,
      totalDeny: 0,
      totalAllow: 0,
      totalSanitized: 0,
      tasaBloqueo: '0.0',
      avgLatencyMs: '0.00'
    };
  }

  const validTraces = traces.filter(Boolean);
  const total = validTraces.length;
  const denyCount = validTraces.filter(t => t.decision === TELEMETRY_DECISIONS.DENY || t.verdict === 'RECHAZADO').length;
  const sanitizedCount = validTraces.filter(t => t.decision === TELEMETRY_DECISIONS.SANITIZED || t.verdict === 'SANITIZADO').length;
  const allowCount = total - denyCount;
  const blockRate = total > 0 ? ((denyCount / total) * 100).toFixed(1) : '0.0';
  
  const totalLatency = validTraces.reduce((sum, t) => sum + (Number(t.latency) || 0), 0);
  const avgLatency = total > 0 ? (totalLatency / total).toFixed(2) : '0.00';

  return {
    totalInspecciones: total,
    totalDeny: denyCount,
    totalAllow: allowCount,
    totalSanitized: sanitizedCount,
    tasaBloqueo: blockRate,
    avgLatencyMs: avgLatency
  };
}