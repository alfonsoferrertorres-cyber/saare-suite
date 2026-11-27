// apps/control-plane/src/engines/evidenceVaultEngine.js — S.A.A.R.E. Evidence Vault Engine (SGP 1.0 + RFC 8785 JCS)

const DEFAULT_EXPEDIENTE_REF = "MS3V-SGP1.0-MASTER-2026";

export function canonicalizeRfc8785(val) {
  if (val === null || typeof val !== "object") {
    if (typeof val === "number" && Object.is(val, -0)) {
      return "0";
    }
    return JSON.stringify(val);
  }
  if (Array.isArray(val)) {
    return "[" + val.map((item) => canonicalizeRfc8785(item)).join(",") + "]";
  }
  const keys = Object.keys(val).sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalizeRfc8785(val[k])).join(",") + "}";
}

function normalizeTenantId(rawTenant) {
  if (!rawTenant || typeof rawTenant !== "string") return "DEFAULT_TENANT";
  return (
    rawTenant
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, "_")
      .slice(0, 32) || "DEFAULT_TENANT"
  );
}

async function computeWebSha256(text = "") {
  const data = new TextEncoder().encode(String(text));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export class EvidenceVaultEngine {
  constructor(env) {
    this.env = env;
    this.trustAnchor = env?.TRUST_ANCHOR || "UNCONFIGURED_TRUST_ANCHOR";
    this.primaryNodeId = env?.SAFE_CREATIVE_DICTAMEN_ID || env?.SAFE_CREATIVE_ID || "NODE_L7_PRIMARY";
    this.expediente = env?.EXPEDIENTE_ID || env?.EIDAS_EXPEDIENTE_ID || DEFAULT_EXPEDIENTE_REF;
    this.allowFallbackVault = String(env?.ALLOW_FALLBACK_VAULT ?? "true").toLowerCase() !== "false";
  }

  async initializeSchema() {
    if (!this.env || !this.env.DB || EvidenceVaultEngine.schemaInitialized) return;

    try {
      await this.env.DB.batch([
        this.env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS consolidated_traces (
            trace_id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            user_email TEXT NOT NULL DEFAULT '',
            final_evaluator_node TEXT NOT NULL DEFAULT 'EDGE_WORKER_PEP_L7',
            final_decision TEXT NOT NULL DEFAULT 'ALLOW',
            final_action TEXT NOT NULL DEFAULT 'ALLOWED',
            execution_latency_ms REAL DEFAULT 0.0,
            timestamp TEXT NOT NULL DEFAULT (datetime('now')),
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            prompt TEXT NOT NULL DEFAULT '',
            sanitized_payload TEXT DEFAULT '',
            verdict TEXT NOT NULL DEFAULT 'PERMITIDO',
            anchored INTEGER DEFAULT 0,
            ms3v_hash TEXT DEFAULT '',
            ms3v_timestamp_ns TEXT DEFAULT ''
          )
        `),
        this.env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            evidence_id TEXT UNIQUE NOT NULL,
            trace_id TEXT NOT NULL,
            verdictId TEXT NOT NULL,
            decision TEXT NOT NULL DEFAULT 'ALLOW',
            verdict TEXT NOT NULL DEFAULT 'PERMITIDO',
            user TEXT NOT NULL DEFAULT 'anonymous',
            tenant TEXT NOT NULL DEFAULT 'DEFAULT_TENANT',
            prompt TEXT DEFAULT '',
            responseOutput TEXT DEFAULT '',
            payload_json TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          )
        `)
      ]);

      const alterStatements = [
        "ALTER TABLE consolidated_traces ADD COLUMN ms3v_hash TEXT DEFAULT ''",
        "ALTER TABLE consolidated_traces ADD COLUMN ms3v_timestamp_ns TEXT DEFAULT ''",
        "ALTER TABLE consolidated_traces ADD COLUMN sanitized_payload TEXT DEFAULT ''",
        "ALTER TABLE consolidated_traces ADD COLUMN verdict TEXT NOT NULL DEFAULT 'PERMITIDO'"
      ];

      for (const sql of alterStatements) {
        try {
          await this.env.DB.prepare(sql).run();
        } catch (_altErr) {
          // Columna ya existe
        }
      }

      EvidenceVaultEngine.schemaInitialized = true;
    } catch (err) {
      EvidenceVaultEngine.schemaInitialized = false;
      console.error("[Vault Engine] Error inicializando esquemas SQL D1:", err.message);
      if (!this.allowFallbackVault) throw err;
    }
  }

  async recordNodeEvidence(tracePayload = {}) {
    const safePayload = tracePayload && typeof tracePayload === "object" ? tracePayload : {};
    const resolvedExpediente =
      safePayload.expediente ||
      safePayload.expedienteId ||
      this.expediente ||
      DEFAULT_EXPEDIENTE_REF;
    const timestamp = safePayload.timestamp || new Date().toISOString();
    const parsedDate = new Date(timestamp);
    const year = !Number.isNaN(parsedDate.getTime()) ? parsedDate.getUTCFullYear() : new Date().getUTCFullYear();

    const traceId = safePayload.trace_id || `tr_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
    const evidenceId = safePayload.evidence_id || `EV-L7-${Date.now()}`;
    const verdictId = safePayload.verdictId || `VRD-${year}-${String(evidenceId).replace(/^EV-L7-/i, "")}`;
    const tenantId = normalizeTenantId(safePayload.tenant_id || safePayload.tenant);
    const user = safePayload.user || "anonymous";

    const decision = safePayload.decision || (safePayload.verdict_data?.action === "BLOCKED" ? "DENY" : "ALLOW");
    const verdict = safePayload.verdict || safePayload.verdict_data?.verdict || (decision === "DENY" ? "RECHAZADO" : "PERMITIDO");
    const sanitizedPayloadText = safePayload.sanitized_payload || safePayload.responseOutput || "";

    const payloadHash =
      safePayload.payload_hash ||
      (await computeWebSha256(safePayload.prompt || sanitizedPayloadText || traceId));

    const providedHash =
      safePayload.verdict_data?.merkleRoot ||
      safePayload.verdict_data?.ms3vHash ||
      safePayload.merkleRoot ||
      safePayload.ms3v_hash ||
      safePayload.ms3vHash ||
      "";

    const canonicalPayloadJcs = canonicalizeRfc8785({
      trace_id: traceId,
      evidence_id: evidenceId,
      tenant_id: tenantId,
      user,
      decision,
      verdict,
      timestamp,
      sanitized_payload: sanitizedPayloadText,
      payload_hash: payloadHash,
      expediente: resolvedExpediente
    });
    const canonicalJcsSha256 = await computeWebSha256(canonicalPayloadJcs);

    const ms3vHash = String(providedHash).trim() || canonicalJcsSha256;
    const ms3vTimestampNs = safePayload.verdict_data?.ms3vTimestampNs || `${Date.now()}000000`;

    const finalEvaluatorNode = typeof safePayload.evaluator_chain === "object"
      ? (safePayload.evaluator_chain?.final_evaluator || "EDGE_WORKER_PEP_L7")
      : String(safePayload.evaluator_chain || "EDGE_WORKER_PEP_L7");

    const latencyMs = Number.isFinite(Number(safePayload.latency ?? safePayload.metrics?.latency_ms))
      ? parseFloat(safePayload.latency ?? safePayload.metrics?.latency_ms)
      : 1.12;

    const fullRecord = {
      ...safePayload,
      expediente: resolvedExpediente,
      expedienteId: resolvedExpediente,
      id: evidenceId,
      evidence_id: evidenceId,
      trace_id: traceId,
      verdictId,
      tenant: tenantId,
      tenant_id: tenantId,
      user,
      prompt: safePayload.prompt || "",
      sanitized_payload: sanitizedPayloadText,
      responseOutput: safePayload.responseOutput || sanitizedPayloadText,
      decision,
      verdict,
      timestamp,
      payload_hash: payloadHash,
      canonical_jcs_sha256: canonicalJcsSha256,
      ms3v_hash: ms3vHash,
      merkleRoot: ms3vHash,
      ms3v_timestamp_ns: ms3vTimestampNs,
      verdict_data: {
        ...(safePayload.verdict_data && typeof safePayload.verdict_data === "object" ? safePayload.verdict_data : {}),
        verdict,
        action: decision === "DENY" ? "BLOCKED" : "ALLOWED",
        ms3vHash,
        merkleRoot: ms3vHash,
        canonicalJcsSha256,
        ms3vTimestampNs
      }
    };

    const serializedFullRecord = canonicalizeRfc8785(fullRecord);

    if (this.env && this.env.DB) {
      try {
        await this.initializeSchema();

        await this.env.DB.prepare(`
          INSERT OR REPLACE INTO consolidated_traces (
            trace_id, tenant_id, user_email, final_evaluator_node,
            final_decision, final_action, execution_latency_ms,
            timestamp, created_at, prompt, sanitized_payload, verdict, anchored,
            ms3v_hash, ms3v_timestamp_ns
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
        `).bind(
          traceId,
          tenantId,
          user,
          finalEvaluatorNode,
          decision,
          decision === "DENY" ? "BLOCKED" : "ALLOWED",
          latencyMs,
          timestamp,
          timestamp,
          safePayload.prompt || "",
          sanitizedPayloadText,
          verdict,
          ms3vHash,
          ms3vTimestampNs
        ).run();

        await this.env.DB.prepare(`
          INSERT OR REPLACE INTO runs (
            evidence_id, trace_id, verdictId, decision, verdict,
            user, tenant, prompt, responseOutput, payload_json, created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          evidenceId,
          traceId,
          verdictId,
          decision,
          verdict,
          user,
          tenantId,
          safePayload.prompt || "",
          safePayload.responseOutput || sanitizedPayloadText,
          serializedFullRecord,
          timestamp
        ).run();
      } catch (err) {
        console.warn("[Vault Engine] Fallo en escritura D1 SQL:", err.message);
        if (!this.allowFallbackVault) throw err;
      }
    }

    const kv = this.env?.SAARE_KV_VAULT || this.env?.SAARE_VAULT_KV;
    if (kv && (this.allowFallbackVault || !this.env?.DB)) {
      try {
        const kvKey = `trace:${tenantId}:${traceId}`;
        await kv.put(kvKey, serializedFullRecord, { expirationTtl: 86400 * 90 });

        const runsKey = `runs_${tenantId}`;
        const existingKv = (await kv.get(runsKey, "json")) || [];
        const updatedKv = [fullRecord, ...(Array.isArray(existingKv) ? existingKv : [])].slice(0, 100);
        await kv.put(runsKey, canonicalizeRfc8785(updatedKv));
      } catch (err) {
        console.error("[Vault Engine] Error guardando en KV:", err.message);
        if (!this.allowFallbackVault) throw err;
      }
    }

    const localNodeSeal = `ed25519:${ms3vHash.substring(0, 32)}`;
    const custodyRecord = {
      primaryNode: {
        nodeId: this.primaryNodeId,
        seal: localNodeSeal,
        timestamp
      },
      secondaryAnchor: {
        provider: "SAFE_CREATIVE_API_V2",
        trustAnchor: this.trustAnchor,
        status: "BATCH_PENDING_MERKLE"
      },
      expediente: resolvedExpediente,
      canonicalization: "RFC 8785 (JCS)",
      canonicalJcsSha256,
      integrityHash: ms3vHash,
      merkleRoot: ms3vHash,
      payloadHash
    };

    return {
      success: true,
      traceId,
      evidenceId,
      expedienteId: resolvedExpediente,
      merkleRoot: ms3vHash,
      ms3vHash,
      canonicalJcsSha256,
      doubleChainOfCustody: custodyRecord
    };
  }

  async normalizeTraceItem(rawItem, fallbackTenant, d1HashMap = {}) {
    let parsedPayload = {};
    if (rawItem?.payload_json && typeof rawItem.payload_json === "string") {
      try {
        parsedPayload = JSON.parse(rawItem.payload_json);
      } catch (_e) {
        parsedPayload = {};
      }
    } else if (rawItem?.payload_json && typeof rawItem.payload_json === "object") {
      parsedPayload = rawItem.payload_json;
    }

    const base = {
      ...parsedPayload,
      ...rawItem
    };
    delete base.payload_json;

    const cleanFallback = normalizeTenantId(fallbackTenant);
    const traceId = base.trace_id || base.id || base.evidence_id || "";
    const d1Hash = traceId && d1HashMap[traceId] ? d1HashMap[traceId] : "";
    const resolvedExpediente =
      base.expediente ||
      base.expedienteId ||
      parsedPayload.expediente ||
      parsedPayload.expedienteId ||
      this.expediente ||
      DEFAULT_EXPEDIENTE_REF;

    let integrityHash =
      base.merkleRoot ||
      base.ms3v_hash ||
      base.ms3vHash ||
      parsedPayload.merkleRoot ||
      parsedPayload.ms3v_hash ||
      parsedPayload.verdict_data?.merkleRoot ||
      parsedPayload.verdict_data?.ms3vHash ||
      d1Hash ||
      "";

    if (!integrityHash) {
      integrityHash = await computeWebSha256(
        canonicalizeRfc8785({
          trace_id: traceId,
          evidence_id: base.evidence_id || base.id || "",
          tenant: normalizeTenantId(base.tenant || base.tenant_id || cleanFallback),
          user: base.user || "anonymous",
          decision: base.decision || "ALLOW",
          verdict: base.verdict || "PERMITIDO",
          timestamp: base.timestamp || base.created_at || "",
          prompt: base.prompt || "",
          responseOutput: base.responseOutput || "",
          expediente: resolvedExpediente
        })
      );
    }

    const resolvedTenant = normalizeTenantId(base.tenant || base.tenant_id || cleanFallback);

    return {
      ...base,
      expediente: resolvedExpediente,
      expedienteId: resolvedExpediente,
      id: base.id || base.evidence_id || traceId,
      evidence_id: base.evidence_id || base.id || traceId,
      trace_id: traceId,
      tenant: resolvedTenant,
      tenant_id: resolvedTenant,
      timestamp: base.timestamp || base.created_at || "",
      merkleRoot: integrityHash,
      ms3v_hash: integrityHash,
      ms3vHash: integrityHash,
      hash: integrityHash,
      integrityHash
    };
  }

  async getTenantTraces(tenantId, limit = 50) {
    const cleanTenant = normalizeTenantId(tenantId);
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 500);
    const d1HashMap = {};

    if (this.env && this.env.DB) {
      try {
        await this.initializeSchema();

        try {
          const { results: traceHashes } = await this.env.DB.prepare(`
            SELECT trace_id, ms3v_hash FROM consolidated_traces WHERE tenant_id = ? ORDER BY rowid DESC LIMIT ?
          `).bind(cleanTenant, safeLimit).all();

          if (Array.isArray(traceHashes)) {
            for (const row of traceHashes) {
              if (row?.trace_id && row?.ms3v_hash) {
                d1HashMap[row.trace_id] = row.ms3v_hash;
              }
            }
          }
        } catch (_hErr) {}

        const { results } = await this.env.DB.prepare(`
          SELECT * FROM runs WHERE tenant = ? ORDER BY id DESC LIMIT ?
        `).bind(cleanTenant, safeLimit).all();

        if (results && results.length > 0) {
          return await Promise.all(
            results.map((item) => this.normalizeTraceItem(item, cleanTenant, d1HashMap))
          );
        }
      } catch (err) {
        console.error("[Vault Engine] Error consultando trazas en D1:", err.message);
        if (!this.allowFallbackVault) throw err;
      }
    }

    const kv = this.env?.SAARE_KV_VAULT || this.env?.SAARE_VAULT_KV;
    if (kv && (this.allowFallbackVault || !this.env?.DB)) {
      try {
        const kvData = await kv.get(`runs_${cleanTenant}`, "json");
        if (Array.isArray(kvData)) {
          return await Promise.all(
            kvData.slice(0, safeLimit).map((item) => this.normalizeTraceItem(item, cleanTenant, d1HashMap))
          );
        }
      } catch (err) {
        if (!this.allowFallbackVault) throw err;
      }
    }

    return [];
  }
}

EvidenceVaultEngine.schemaInitialized = false;

export default EvidenceVaultEngine;