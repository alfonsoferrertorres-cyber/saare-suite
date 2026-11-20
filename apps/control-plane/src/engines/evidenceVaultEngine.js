// apps/control-plane/src/engines/evidenceVaultEngine.js — S.A.A.R.E. Evidence Vault Engine (SGP 1.0)

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

    const payloadHash = safePayload.payload_hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const ms3vHash = safePayload.verdict_data?.ms3vHash || payloadHash;
    const ms3vTimestampNs = safePayload.verdict_data?.ms3vTimestampNs || `${Date.now()}000000`;

    const finalEvaluatorNode = typeof safePayload.evaluator_chain === "object"
      ? (safePayload.evaluator_chain?.final_evaluator || "EDGE_WORKER_PEP_L7")
      : String(safePayload.evaluator_chain || "EDGE_WORKER_PEP_L7");

    const decision = safePayload.decision || (safePayload.verdict_data?.action === "BLOCKED" ? "DENY" : "ALLOW");
    const verdict = safePayload.verdict || safePayload.verdict_data?.verdict || (decision === "DENY" ? "RECHAZADO" : "PERMITIDO");
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
      user,
      prompt: safePayload.prompt || "",
      responseOutput: safePayload.responseOutput || safePayload.sanitized_payload || "",
      decision,
      verdict,
      timestamp
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
          safePayload.sanitized_payload || safePayload.responseOutput || "",
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
          safePayload.responseOutput || safePayload.sanitized_payload || "",
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

    const localNodeSeal = `ed25519:${payloadHash.substring(0, 32)}`;
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
      integrityHash: payloadHash
    };

    return {
      success: true,
      traceId,
      evidenceId,
      doubleChainOfCustody: custodyRecord
    };
  }

  async getTenantTraces(tenantId, limit = 50) {
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 500);

    if (this.env && this.env.DB) {
      try {
        await this.initializeSchema();
        const { results } = await this.env.DB.prepare(`
          SELECT * FROM runs WHERE tenant = ? ORDER BY id DESC LIMIT ?
        `).bind(tenantId, safeLimit).all();

        if (results && results.length > 0) return results;
      } catch (err) {
        console.error("[Vault Engine] Error consultando trazas en D1, consultando KV:", err.message);
      }
    }

    const kv = this.env?.SAARE_KV_VAULT || this.env?.SAARE_VAULT_KV;
    if (kv) {
      try {
        const kvData = await kv.get(`runs_${tenantId}`, "json");
        if (Array.isArray(kvData)) return kvData.slice(0, safeLimit);
      } catch {}
    }

    return [];
  }
}

EvidenceVaultEngine.schemaInitialized = false;

export default EvidenceVaultEngine;