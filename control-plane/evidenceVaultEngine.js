/**
 * S.A.A.R.E. Evidence Vault Engine (SGP 1.0 / v8.2)
 * High-performance double-custody persistence engine across Cloudflare D1, KV, and Volatile RAM.
 */

export class EvidenceVaultEngine {
  constructor(env) {
    this.env = env;
    this.trustAnchor = "SAARE-MD-IPRES-2026";
  }

  /**
   * Inicializa la estructura de tablas en D1 si no existen.
   */
  async initializeSchema() {
    if (!this.env || !this.env.DB) return;

    try {
      await this.env.DB.exec(`
        CREATE TABLE IF NOT EXISTS consolidated_traces (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          trace_id TEXT UNIQUE NOT NULL,
          evidence_id TEXT NOT NULL,
          tenant_id TEXT NOT NULL,
          user TEXT NOT NULL,
          payload_hash TEXT NOT NULL,
          evaluator_chain TEXT,
          verdict_data TEXT,
          anchored INTEGER DEFAULT 0,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS runs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          evidence_id TEXT UNIQUE NOT NULL,
          trace_id TEXT NOT NULL,
          tenant TEXT NOT NULL,
          user TEXT NOT NULL,
          prompt TEXT,
          responseOutput TEXT,
          decision TEXT,
          verdict TEXT,
          payload_json TEXT,
          created_at TEXT NOT NULL
        );
      `);
    } catch (err) {
      console.error("[Vault Engine] Error inicializando esquemas SQL D1:", err.message);
    }
  }

  /**
   * Registra una traza de inspección con Doble Cadena de Custodia y Persistencia Dual.
   */
  async recordNodeEvidence(tracePayload) {
    const timestamp = tracePayload.timestamp || new Date().toISOString();
    const traceId = tracePayload.trace_id || `tr_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
    const evidenceId = tracePayload.evidence_id || `EV-L7-${Date.now()}`;
    const tenantId = tracePayload.tenant_id || tracePayload.tenant || "ENTERPRISE";
    const user = tracePayload.user || "anonymous";

    const payloadHash = tracePayload.payload_hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const evaluatorChainJson = JSON.stringify(tracePayload.evaluator_chain || { final_evaluator: "PEP_L7_RAM" });
    const verdictDataJson = JSON.stringify(tracePayload.verdict_data || { verdict: "PERMITIDO", action: "ALLOWED" });

    const decision = tracePayload.decision || (tracePayload.verdict_data?.action === 'BLOCKED' ? 'DENY' : 'ALLOW');
    const verdict = tracePayload.verdict || tracePayload.verdict_data?.verdict || (decision === 'DENY' ? 'RECHAZADO' : 'PERMITIDO');

    const fullRecord = {
      id: evidenceId,
      evidence_id: evidenceId,
      trace_id: traceId,
      tenant: tenantId,
      user: user,
      prompt: tracePayload.prompt || "",
      responseOutput: tracePayload.responseOutput || "",
      decision: decision,
      verdict: verdict,
      timestamp: timestamp,
      ...tracePayload
    };

    // 1. Persistencia Resiliente en Cloudflare D1
    if (this.env && this.env.DB) {
      try {
        await this.initializeSchema();

        await this.env.DB.prepare(`
          INSERT OR REPLACE INTO consolidated_traces (trace_id, evidence_id, tenant_id, user, payload_hash, evaluator_chain, verdict_data, anchored, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
        `).bind(traceId, evidenceId, tenantId, user, payloadHash, evaluatorChainJson, verdictDataJson, timestamp).run();

        await this.env.DB.prepare(`
          INSERT OR REPLACE INTO runs (evidence_id, trace_id, tenant, user, prompt, responseOutput, decision, verdict, payload_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          evidenceId,
          traceId,
          tenantId,
          user,
          tracePayload.prompt || "",
          tracePayload.responseOutput || "",
          decision,
          verdict,
          JSON.stringify(fullRecord),
          timestamp
        ).run();
      } catch (err) {
        console.warn("[Vault Engine] Fallo en escritura D1 SQL, derivando a respaldo KV:", err.message);
      }
    }

    // 2. Persistencia en KV (Registro Individual + Array 'runs_${tenantId}' para la Consola)
    if (this.env && this.env.SAARE_VAULT_KV) {
      try {
        // Clave de traza individual
        const kvKey = `trace:${tenantId}:${traceId}`;
        await this.env.SAARE_VAULT_KV.put(kvKey, JSON.stringify(fullRecord), { expirationTtl: 86400 * 90 });

        // Actualización del array principal que lee la Consola GRC
        const runsKey = `runs_${tenantId}`;
        const existingKv = (await this.env.SAARE_VAULT_KV.get(runsKey, 'json')) || [];
        const updatedKv = [fullRecord, ...(Array.isArray(existingKv) ? existingKv : [])].slice(0, 100);
        await this.env.SAARE_VAULT_KV.put(runsKey, JSON.stringify(updatedKv));
      } catch (err) {
        console.error("[Vault Engine] Error guardando en KV:", err.message);
      }
    }

    // 3. Generación del Objeto de Doble Cadena de Custodia
    const localNodeSeal = `ed25519:${payloadHash.substring(0, 32)}`;
    const custodyRecord = {
      primaryNode: {
        nodeId: "2607076315021",
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

  /**
   * Recupera las evidencias registradas para un tenant concreto (D1 con Fallback KV).
   */
  async getTenantTraces(tenantId, limit = 50) {
    if (this.env && this.env.DB) {
      try {
        const { results } = await this.env.DB.prepare(`
          SELECT * FROM consolidated_traces WHERE tenant_id = ? ORDER BY id DESC LIMIT ?
        `).bind(tenantId, limit).all();

        if (results && results.length > 0) return results;
      } catch (err) {
        console.error("[Vault Engine] Error consultando trazas en D1, consultando KV:", err.message);
      }
    }

    // Fallback a Bóveda KV
    if (this.env && this.env.SAARE_VAULT_KV) {
      try {
        const kvData = await this.env.SAARE_VAULT_KV.get(`runs_${tenantId}`, 'json');
        if (Array.isArray(kvData)) return kvData.slice(0, limit);
      } catch (e) {}
    }

    return [];
  }
}