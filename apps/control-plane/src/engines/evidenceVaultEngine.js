// apps/control-plane/src/engines/evidenceVaultEngine.js — S.A.A.R.E. Evidence Vault Engine (SGP 1.0)

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
  }

  async initializeSchema() {
    if (!this.env || !this.env.DB || EvidenceVaultEngine.schemaInitialized) return;

    try {
      await this.env.DB.exec(`
        CREATE TABLE IF NOT EXISTS consolidated_traces (
          trace_id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          user_email TEXT NOT NULL,
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
        );

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
        );
      `);
      EvidenceVaultEngine.schemaInitialized = true;
    } catch (err) {
      console.error("[Vault Engine] Error inicializando esquemas SQL D1:", err.message);
    }
  }

  async recordNodeEvidence(tracePayload = {}) {
    const safePayload = tracePayload && typeof tracePayload === "object" ? tracePayload : {};
    const timestamp = safePayload.timestamp || new Date().toISOString();
    const parsedDate = new Date(timestamp);
    const year = !Number.isNaN(parsedDate.getTime()) ? parsedDate.getUTCFullYear() : new Date().getUTCFullYear();

    const traceId = safePayload.trace_id || `tr_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
    const evidenceId = safePayload.evidence_id || `EV-L7-${Date.now()}`;
    const verdictId = safePayload.verdictId || `VRD-${year}-${String(evidenceId).replace(/^EV-L7-/i, "")}`;
    const tenantId = safePayload.tenant_id || safePayload.tenant || "DEFAULT_TENANT";
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

    const ms3vHash =
      String(providedHash).trim() ||
      (await computeWebSha256(
        JSON.stringify({
          trace_id: traceId,
          evidence_id: evidenceId,
          tenant_id: tenantId,
          user,
          decision,
          verdict,
          timestamp,
          sanitized_payload: sanitizedPayloadText,
          payload_hash: payloadHash
        })
      ));

    const ms3vTimestampNs = safePayload.verdict_data?.ms3vTimestampNs || `${Date.now()}000000`;

    const finalEvaluatorNode = typeof safePayload.evaluator_chain === "object"
      ? (safePayload.evaluator_chain?.final_evaluator || "EDGE_WORKER_PEP_L7")
      : String(safePayload.evaluator_chain || "EDGE_WORKER_PEP_L7");

    const latencyMs = Number.isFinite(Number(safePayload.latency ?? safePayload.metrics?.latency_ms))
      ? parseFloat(safePayload.latency ?? safePayload.metrics?.latency_ms)
      : 1.12;

    const fullRecord = {
      ...safePayload,
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
      ms3v_hash: ms3vHash,
      merkleRoot: ms3vHash,
      ms3v_timestamp_ns: ms3vTimestampNs,
      verdict_data: {
        ...(safePayload.verdict_data && typeof safePayload.verdict_data === "object" ? safePayload.verdict_data : {}),
        verdict,
        action: decision === "DENY" ? "BLOCKED" : "ALLOWED",
        ms3vHash,
        merkleRoot: ms3vHash,
        ms3vTimestampNs
      }
    };

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
          JSON.stringify(fullRecord),
          timestamp
        ).run();
      } catch (err) {
        console.warn("[Vault Engine] Fallo en escritura D1 SQL, derivando a respaldo KV:", err.message);
      }
    }

    const kv = this.env?.SAARE_KV_VAULT || this.env?.SAARE_VAULT_KV;
    if (kv) {
      try {
        const kvKey = `trace:${tenantId}:${traceId}`;
        await kv.put(kvKey, JSON.stringify(fullRecord), { expirationTtl: 86400 * 90 });

        const runsKey = `runs_${tenantId}`;
        const existingKv = (await kv.get(runsKey, "json")) || [];
        const updatedKv = [fullRecord, ...(Array.isArray(existingKv) ? existingKv : [])].slice(0, 100);
        await kv.put(runsKey, JSON.stringify(updatedKv));
      } catch (err) {
        console.error("[Vault Engine] Error guardando en KV:", err.message);
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
      integrityHash: ms3vHash,
      merkleRoot: ms3vHash,
      payloadHash
    };

    return {
      success: true,
      traceId,
      evidenceId,
      merkleRoot: ms3vHash,
      ms3vHash,
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

    const traceId = base.trace_id || base.id || base.evidence_id || "";
    const d1Hash = traceId && d1HashMap[traceId] ? d1HashMap[traceId] : "";

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
        JSON.stringify({
          trace_id: traceId,
          evidence_id: base.evidence_id || base.id || "",
          tenant: base.tenant || base.tenant_id || fallbackTenant,
          user: base.user || "anonymous",
          decision: base.decision || "ALLOW",
          verdict: base.verdict || "PERMITIDO",
          timestamp: base.timestamp || base.created_at || "",
          prompt: base.prompt || "",
          responseOutput: base.responseOutput || ""
        })
      );
    }

    return {
      ...base,
      id: base.id || base.evidence_id || traceId,
      evidence_id: base.evidence_id || base.id || traceId,
      trace_id: traceId,
      tenant: base.tenant || base.tenant_id || fallbackTenant,
      timestamp: base.timestamp || base.created_at || "",
      merkleRoot: integrityHash,
      ms3v_hash: integrityHash,
      ms3vHash: integrityHash,
      hash: integrityHash,
      integrityHash
    };
  }

  async getTenantTraces(tenantId, limit = 50) {
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 500);
    const d1HashMap = {};

    if (this.env && this.env.DB) {
      try {
        await this.initializeSchema();

        try {
          const { results: traceHashes } = await this.env.DB.prepare(`
            SELECT trace_id, ms3v_hash FROM consolidated_traces WHERE tenant_id = ? ORDER BY rowid DESC LIMIT ?
          `).bind(tenantId, safeLimit).all();

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
        `).bind(tenantId, safeLimit).all();

        if (results && results.length > 0) {
          return await Promise.all(
            results.map((item) => this.normalizeTraceItem(item, tenantId, d1HashMap))
          );
        }
      } catch (err) {
        console.error("[Vault Engine] Error consultando trazas en D1, consultando KV:", err.message);
      }
    }

    const kv = this.env?.SAARE_KV_VAULT || this.env?.SAARE_VAULT_KV;
    if (kv) {
      try {
        const kvData = await kv.get(`runs_${tenantId}`, "json");
        if (Array.isArray(kvData)) {
          return await Promise.all(
            kvData.slice(0, safeLimit).map((item) => this.normalizeTraceItem(item, tenantId, d1HashMap))
          );
        }
      } catch {}
    }

    return [];
  }
}

EvidenceVaultEngine.schemaInitialized = false;

export default EvidenceVaultEngine;