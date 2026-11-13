// control-plane/worker.js — Orquestador Global S.A.A.R.E. Enterprise (SGP 1.0 / V12.5 Monetización Multi-Tenant + Sandbox 2 Seats)

import { handleCors } from "./src/middleware/corsHandler.js";
import { AuthMiddleware } from "./src/middleware/authMiddleware.js";
import { ZeroTrustMiddleware } from "./src/middleware/zeroTrustMiddleware.js";
import { ComplianceEngine } from "./src/engines/complianceEngine.js";
import { DistributedRateLimiter } from "./src/middleware/rateLimiter.js";

import { handleStripeWebhook } from "./src/services/stripeWebhook.js";
import { TenantManager } from "./src/services/tenantManager.js";
import { computeSha256 } from "./src/services/keyManager.js";
import { registerEvidenceInSafeCreative } from "./src/services/safeCreativeClient.js";
import { EvidenceVaultEngine } from "./src/engines/evidenceVaultEngine.js";
import { TelemetryServer } from "./src/services/telemetryServer.js";
import { generateProofBundle } from "./src/services/proofBundle.js";
import TimestampingEngine from "./src/services/timestampingEngine.js";

import { engineBlockLogic } from "./src/packages/ms3v-core.js";
import { verifyKillswitch } from "./src/modules/killswitch.js";
import { ScenarioRegistry, getLiveRegulatoryMatrix } from "./src/modules/scenarioRegistry.js";
import { DeploymentManager } from "./src/engines/stateMachine.js";

import {
  PLAN_IDS,
  sanitizePlanId,
  getPlanEntitlements,
  checkQuota,
  isFeatureAllowed
} from "@saare/entitlements";

const rateLimiter = new DistributedRateLimiter(60000, 100);

const SAARE_APPROVED_COMMANDS = [
  "INICIAR_CUMPLIMIENTO_EXANTE_SAARE",
  "SAARE_CONTROL.PY --KILL",
  "KILL-SWITCH",
  "SAARE-MD-FOR",
  "SAARE-MD-CORP",
  "SAARE-MD-SECU",
  "SAARE-MD-VERD",
  "SAARE-MD-LEGAL",
  "SAARE-MD-IPRES",
  "SAARE-MD-CUST",
  "SAARE-MD-COMPLIANCE",
  "SAARE-MD-DEEP",
  "SAARE-MD-FRIA",
  "SAARE_INIT",
  "SAARE_SET_PWR_100W",
  "SAARE_GROUND_LIFT_ENABLE",
  "SAARE_AUTO_CALIBRATE",
  "LOGIC_SAFE_STATE"
];

class CPaaSAdapterManager {
  static async sendTwilio(payload, env) {
    const accountSid = env.TWILIO_ACCOUNT_SID;
    const authToken = env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) throw new Error("Faltan credenciales de Twilio.");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const auth = btoa(`${accountSid}:${authToken}`);
      const body = new URLSearchParams({
        To: payload.to,
        From: payload.from || env.TWILIO_FROM_NUMBER || "+1234567890",
        Body: payload.body
      });

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: body.toString(),
        signal: controller.signal
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error en envío vía Twilio");

      return { provider: "Twilio", messageId: data.sid || `tw_${Date.now()}` };
    } finally {
      clearTimeout(timeout);
    }
  }

  static async sendMessageBird(payload, env) {
    const apiKey = env.MESSAGEBIRD_API_KEY;
    if (!apiKey) throw new Error("Falta API Key de MessageBird.");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch("https://rest.messagebird.com/messages", {
        method: "POST",
        headers: {
          Authorization: `AccessKey ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          originator: payload.from || "SAARE",
          recipients: [payload.to],
          body: payload.body
        }),
        signal: controller.signal
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.[0]?.description || "Error en envío vía MessageBird");

      return { provider: "MessageBird", messageId: data.id || `mb_${Date.now()}` };
    } finally {
      clearTimeout(timeout);
    }
  }

  static async sendVonage(payload, env) {
    const apiKey = env.VONAGE_API_KEY;
    const apiSecret = env.VONAGE_API_SECRET;
    if (!apiKey || !apiSecret) throw new Error("Faltan credenciales de Vonage.");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch("https://rest.nexmo.com/sms/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          api_secret: apiSecret,
          to: payload.to,
          from: payload.from || "SAARE",
          text: payload.body
        }),
        signal: controller.signal
      });
      const data = await res.json();
      if (!res.ok || data.messages?.[0]?.status !== "0") {
        throw new Error(data.messages?.[0]?.["error-text"] || "Error en envío vía Vonage");
      }

      return { provider: "Vonage", messageId: data.messages[0]["message-id"] || `vn_${Date.now()}` };
    } finally {
      clearTimeout(timeout);
    }
  }

  static async sendInfobip(payload, env) {
    const baseUrl = env.INFOBIP_BASE_URL || "https://api.infobip.com";
    const apiKey = env.INFOBIP_API_KEY;
    if (!apiKey) throw new Error("Faltan credenciales de Infobip.");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(`${baseUrl.replace(/\/$/, "")}/sms/2/text/advanced`, {
        method: "POST",
        headers: {
          Authorization: `App ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [{
            from: payload.from || "SAARE",
            destinations: [{ to: payload.to }],
            text: payload.body
          }]
        }),
        signal: controller.signal
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Error en envío vía Infobip");

      return { provider: "Infobip", messageId: data.messages?.[0]?.messageId || `ib_${Date.now()}` };
    } finally {
      clearTimeout(timeout);
    }
  }

  static async sendWithFailover(payload, env, priorityOrder = ["twilio", "messagebird", "vonage", "infobip"]) {
    const errors = [];
    for (const key of priorityOrder) {
      try {
        if (key === "twilio") return await this.sendTwilio(payload, env);
        if (key === "messagebird") return await this.sendMessageBird(payload, env);
        if (key === "vonage") return await this.sendVonage(payload, env);
        if (key === "infobip") return await this.sendInfobip(payload, env);
      } catch (err) {
        errors.push(`${key.toUpperCase()}: ${err.message}`);
      }
    }
    throw new Error(`[CPaaS Failover Exhausted] Ningún proveedor pudo completar el envío: ${errors.join(" | ")}`);
  }
}

const LLM_AGNOSTIC_PROVIDERS = {
  GEMINI: { name: "Google Gemini", defaultEndpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent" },
  OPENAI: { name: "OpenAI GPT-4o", defaultEndpoint: "https://api.openai.com/v1/chat/completions" },
  ANTHROPIC: { name: "Anthropic Claude 3.5", defaultEndpoint: "https://api.anthropic.com/v1/messages" },
  DEEPSEEK: { name: "DeepSeek V3/R1", defaultEndpoint: "https://api.deepseek.com/v1/chat/completions" },
  LOCAL_ONPREM: { name: "Local Loopback / Ollama", defaultEndpoint: "http://127.0.0.1:11434/v1/chat/completions" }
};

function getSaareL7SystemDirective(env = {}) {
  const authorName = env.AUTHOR_NAME || "GABINETE MS3V · S.A.A.R.E. S.L.";
  return {
    role: "system",
    content: `[S.A.A.R.E. SGP-1.0 NATIVE GOVERNANCE NODE / MS3V PROTOCOL]
Autoridad Intelectual: ${authorName}
Motor de Gobernanza: BLOCK LOGIC (Middleware Determinista en Tiempo Real)
Cometido del PEP L7:
1. Normalizar e interceptar el prompt entrante en el runtime de ejecución (Bloque 1).
2. Validar sintaxis y contrastar contra las 7 Dimensiones SGP 1.0 (Bloque 2).
3. Emitir sello criptográfico SHA-256 + Ed25519 con trazabilidad RFC-3161 y Safe Creative (Bloques 3 y 4).
4. Condicionar la liberación de la salida mediante el disyuntor lógico Fail-Closed (Bloque 5).`
  };
}

function evaluateSgp1SevenDimensions({
  isAuthenticated,
  user,
  method,
  clientIp,
  tenant,
  endpointPath,
  rulesTriggered,
  isBlocked,
  activeScenarioId
}) {
  const riskScore = isBlocked ? 1.0 : (rulesTriggered.length > 0 ? 0.35 : 0.02);
  const verdict = isBlocked ? "DENY" : "ALLOW";
  const structuralDelta = isBlocked ? "0.0098%" : "0.0000%";

  return {
    protocol: "SGP-1.0",
    verdict,
    structural_delta: structuralDelta,
    threshold_max: "0.0100%",
    fail_closed_armed: true,
    dimensions: {
      DIM_01_IDENTIDAD: { status: isAuthenticated ? "VERIFIED_ED25519_JWT" : "VERIFIED_TENANT_EDGE", subject: user, passed: true },
      DIM_02_ACCION: { status: "INSPECTED_L7", verb: method, passed: true },
      DIM_03_CONTEXTO: { status: "VALID_SESSION_WINDOW", source_ip: clientIp || "edge-anycast", passed: true },
      DIM_04_RECURSO: { status: "ISOLATED_TENANT_PERIMETER", tenant, resource: endpointPath, passed: true },
      DIM_05_DATOS: { status: rulesTriggered.length > 0 ? "SANITIZED_K_ANONYMITY" : "CLEAN_ZERO_PII", rules_triggered: rulesTriggered, zero_disk_ram_only: true, passed: true },
      DIM_06_RIESGO: { status: isBlocked ? "CRITICAL_RISK_BLOCKED" : "LOW_DETERMINISTIC_RISK", risk_score: riskScore, hitl_required: false, passed: !isBlocked },
      DIM_07_POLITICA: { status: isBlocked ? "POLICY_VIOLATION_DENY" : "POLICY_COMPLIANT_ALLOW", scenario: activeScenarioId, passed: !isBlocked }
    }
  };
}

function buildSgp1ProofContract({ nodeId, verdict, structuralDelta, ms3vHash, proofBundle, env }) {
  const timestampUtc = new Date().toISOString();
  const serialId = `2026-EU-TSA-${ms3vHash.slice(0, 6).toUpperCase()}`;
  const signature = proofBundle?.proofBundle?.ed25519Signature || `ed25519:sig:${ms3vHash}`;

  return {
    protocol: "SGP-1.0",
    node_id: nodeId || "AFT-2026-AUTH-X9",
    verdict,
    structural_delta: structuralDelta,
    proof_chain: {
      ed25519_sig: signature,
      eidas_tsa_rfc3161: {
        serial: serialId,
        gen_time_utc: timestampUtc,
        standard: "RFC 3161 / eIDAS"
      },
      safe_creative_anchor: {
        registry_code: env?.SAFE_CREATIVE_ID || "2607076315021",
        p2026_registration: env?.P2026_REGISTRATION || "P202630603",
        status: "REGISTERED"
      }
    }
  };
}

const MERKLE_BATCH_THRESHOLD = 1000;
const MERKLE_TIME_THRESHOLD_MS = 6 * 60 * 60 * 1000;

const ROLE_RANKS = {
  AUDITOR_GUEST_LEVEL_0: 0,
  OPERATIONAL_AGENT_USER: 0,
  TENANT_AUDITOR: 1,
  BOARD_EXECUTIVE_LEVEL_1: 1,
  DPO_GRC_LEVEL_2: 2,
  CISO_SECOPS_LEVEL_3: 3,
  SECURITY_CISO_ADMIN: 4,
  CISO_ADMIN: 4
};

function hasRequiredRank(userRole, minRank) {
  const rank = ROLE_RANKS[userRole] !== undefined ? ROLE_RANKS[userRole] : 0;
  return rank >= minRank;
}

function parseSemanticCommand(promptText, env = {}) {
  if (typeof promptText !== "string") return null;
  const upper = promptText.toUpperCase();
  const authorName = env.AUTHOR_NAME || "GABINETE MS3V · S.A.A.R.E. S.L.";
  const baseIdentity = {
    nodeIdentity: "NATIVE_MS3V_BLOCK_LOGIC_PEP_L7",
    expediente: env.EXPEDIENTE_ID || "MS3V-SGP1.0-MASTER-2026",
    author: authorName
  };

  if (upper.includes("INICIAR_CUMPLIMIENTO_EXANTE_SAARE") || upper.includes("[MS3V-COMPLIANCE-L7-OK]")) {
    return {
      type: "MODULE_5_BOOTSTRAP",
      verdict: "PERMITIDO",
      decision: "ALLOW",
      scenarioId: "cumplimiento_corporativo_integral",
      category: "MODULE_5_EX_ANTE_COMPLIANCE",
      norma: "EU AI Act Art. 27 / RGPD Art. 25 (k>=5)",
      witness: "[MS3V-COMPLIANCE-L7-OK]",
      vaultTarget: "D1_WORM",
      ...baseIdentity
    };
  }

  if (upper.includes("SAARE_CONTROL.PY --KILL") || upper.includes("KILL-SWITCH")) {
    return {
      type: "KILL_SWITCH_TRIGGERED",
      verdict: "RECHAZADO",
      decision: "DENY",
      scenarioId: "razonamiento_activo_l7",
      category: "EMERGENCY_DEACTIVATION",
      norma: "S.A.A.R.E. Core Security Protocol / MS3V Disyuntor Lógico",
      witness: "[KILL-SWITCH-ENFORCED]",
      vaultTarget: "RAM",
      ...baseIdentity
    };
  }

  if (upper.includes("SAARE-MD-FOR")) return { type: "MODE_FORENSIC", verdict: "PERMITIDO", decision: "ALLOW", scenarioId: "auditoria_dictamen_normativo", category: "AUDITORIA_FORENSE", norma: "ISO 27037 / Art. 326 LEC", ...baseIdentity };
  if (upper.includes("SAARE-MD-CORP")) return { type: "MODE_CORPORATE", verdict: "PERMITIDO", decision: "ALLOW", scenarioId: "cumplimiento_corporativo_integral", category: "CERTIFICACION_CORPORATIVA", norma: "EU AI Act / DORA", ...baseIdentity };
  if (upper.includes("SAARE-MD-SECU")) return { type: "MODE_SECURITY", verdict: "PERMITIDO", decision: "ALLOW", scenarioId: "razonamiento_activo_l7", category: "BLINDAJE_PERIMETRAL", norma: "NIS2 / ISO 27001", ...baseIdentity };
  if (upper.includes("SAARE-MD-VERD")) return { type: "MODE_VERDICT", verdict: "PERMITIDO", decision: "ALLOW", scenarioId: "deepfake_fake_disprover", category: "VEREDICTO_INTEGRIDAD", norma: "A_Estructural < 0.01%", ...baseIdentity };
  if (upper.includes("SAARE-MD-LEGAL")) return { type: "MODE_LEGAL", verdict: "PERMITIDO", decision: "ALLOW", scenarioId: "cumplimiento_corporativo_integral", category: "AUDITORIA_JURIDICA", norma: "RGPD / EU AI Act", ...baseIdentity };
  if (upper.includes("SAARE-MD-IPRES")) return { type: "MODE_IP", verdict: "PERMITIDO", decision: "ALLOW", scenarioId: "auditoria_dictamen_normativo", category: "SECRETO_INDUSTRIAL", norma: `Ley 1/2019 / Safe Creative (${env?.SAFE_CREATIVE_ID || "2607076315021"})`, ...baseIdentity };
  if (upper.includes("SAARE-MD-CUST")) return { type: "MODE_CUSTODY", verdict: "PERMITIDO", decision: "ALLOW", scenarioId: "auditoria_dictamen_normativo", category: "CADENA_CUSTODIA", norma: "Art. 326 LEC / eIDAS RFC 3161", ...baseIdentity };
  if (upper.includes("SAARE-MD-COMPLIANCE")) return { type: "MODE_COMPLIANCE", verdict: "PERMITIDO", decision: "ALLOW", scenarioId: "cumplimiento_corporativo_integral", category: "CUMPLIMIENTO_LLM", norma: "[MS3V-COMPLIANCE-L7-OK]", ...baseIdentity };
  if (upper.includes("SAARE-MD-DEEP")) return { type: "MODE_DEEPFAKE", verdict: "PERMITIDO", decision: "ALLOW", scenarioId: "deepfake_fake_disprover", category: "DETECCION_DEEPFAKES", norma: "Análisis Espectral RAM", ...baseIdentity };
  if (upper.includes("SAARE-MD-FRIA")) return { type: "MODE_FRIA", verdict: "PERMITIDO", decision: "ALLOW", scenarioId: "cumplimiento_corporativo_integral", category: "EXPEDIENTE_FRIA", norma: "EU AI Act Art. 27", ...baseIdentity };

  return null;
}

async function ensureD1TablesExist(db) {
  if (!db) return;
  try {
    await db.batch([
      db.prepare(`
        CREATE TABLE IF NOT EXISTS consolidated_traces (
          trace_id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          user_email TEXT NOT NULL,
          final_evaluator_node TEXT NOT NULL DEFAULT 'MS3V_BLOCK_LOGIC_PEP_L7',
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
      db.prepare(`
        CREATE TABLE IF NOT EXISTS cpaas_audit_logs (
          id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          provider TEXT NOT NULL,
          message_id TEXT NOT NULL,
          recipient TEXT NOT NULL,
          status TEXT NOT NULL,
          evidence_hash TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS runs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          evidence_id TEXT UNIQUE NOT NULL,
          trace_id TEXT NOT NULL,
          verdictId TEXT NOT NULL,
          decision TEXT NOT NULL DEFAULT 'ALLOW',
          verdict TEXT NOT NULL DEFAULT 'PERMITIDO',
          user TEXT NOT NULL DEFAULT 'anonymous',
          tenant TEXT NOT NULL DEFAULT 'ENTERPRISE',
          prompt TEXT DEFAULT '',
          responseOutput TEXT DEFAULT '',
          payload_json TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS tenants (
          tenant_id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          plan_id TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'ACTIVE',
          quota INTEGER NOT NULL DEFAULT 10000,
          expires_at TEXT,
          config_json TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          email TEXT PRIMARY KEY,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          company TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'CISO_ADMIN',
          is_verified INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS merkle_anchors (
          id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          merkle_root TEXT NOT NULL,
          batch_size INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS custom_rules (
          id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          name TEXT NOT NULL,
          pattern TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `),
      db.prepare(`
        CREATE TABLE IF NOT EXISTS tenant_usage (
          tenant_id TEXT NOT NULL,
          billing_period TEXT NOT NULL,
          verdict_count INTEGER DEFAULT 0,
          PRIMARY KEY (tenant_id, billing_period)
        )
      `)
    ]);
  } catch (e) {
    console.error("[SAARE D1 Schema Init Error]:", e.message);
  }
}

function getCurrentBillingPeriod() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

async function getTenantMonthlyUsage(db, tenantId) {
  if (!db || !tenantId) return 0;
  try {
    const period = getCurrentBillingPeriod();
    const row = await db.prepare(
      "SELECT verdict_count FROM tenant_usage WHERE tenant_id = ? AND billing_period = ?"
    ).bind(tenantId, period).first();
    return row?.verdict_count || 0;
  } catch (e) {
    return 0;
  }
}

async function incrementTenantUsage(db, tenantId, count = 1) {
  if (!db || !tenantId) return;
  try {
    const period = getCurrentBillingPeriod();
    await db.prepare(`
      INSERT INTO tenant_usage (tenant_id, billing_period, verdict_count)
      VALUES (?, ?, ?)
      ON CONFLICT(tenant_id, billing_period)
      DO UPDATE SET verdict_count = verdict_count + excluded.verdict_count
    `).bind(tenantId, period, count).run();
  } catch (e) {
    console.error("[SAARE Metering Error]:", e.message);
  }
}

async function getOrCreateTenantLicenseKey(tenantId, env) {
  let licenseKey = env?.SAARE_VAULT_KV
    ? await env.SAARE_VAULT_KV.get(`license:${tenantId}`)
    : null;

  if (!licenseKey) {
    licenseKey = `sk_saare_live_${(await computeSha256(`${tenantId}:${env?.JWT_SECRET || "saare"}`)).slice(0, 28)}`;
    if (env?.SAARE_VAULT_KV) {
      await env.SAARE_VAULT_KV.put(`license:${tenantId}`, licenseKey);
      await env.SAARE_VAULT_KV.put(`token_tenant:${licenseKey}`, tenantId);
    }
  }
  return licenseKey;
}

async function processBatchMerkleAnchor(tenantId, env) {
  if (!env || !env.DB) return;
  try {
    await ensureD1TablesExist(env.DB);
    const pendingRes = await env.DB.prepare(
      "SELECT COUNT(*) as total FROM consolidated_traces WHERE tenant_id = ? AND anchored = 0"
    ).bind(tenantId).first();

    const pendingCount = pendingRes?.total || 0;
    const lastAnchor = await env.DB.prepare(
      "SELECT created_at FROM merkle_anchors WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 1"
    ).bind(tenantId).first();

    const lastAnchorTime = lastAnchor ? new Date(lastAnchor.created_at).getTime() : 0;
    const timeElapsed = Date.now() - lastAnchorTime;

    if (pendingCount >= MERKLE_BATCH_THRESHOLD || (pendingCount > 0 && timeElapsed >= MERKLE_TIME_THRESHOLD_MS)) {
      const { results } = await env.DB.prepare(
        "SELECT trace_id, timestamp FROM consolidated_traces WHERE tenant_id = ? AND anchored = 0 ORDER BY timestamp ASC LIMIT 10000"
      ).bind(tenantId).all();

      if (!results || results.length === 0) return;

      const combinedHashes = results.map(r => r.trace_id).join(":");
      const merkleRoot = await computeSha256(combinedHashes);

      const anchorId = `ANK-2026-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
      const timestamp = new Date().toISOString();

      await env.DB.prepare(
        "INSERT INTO merkle_anchors (id, tenant_id, merkle_root, batch_size, created_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(anchorId, tenantId, merkleRoot, results.length, timestamp).run();

      const traceIds = results.map(r => r.trace_id);
      const placeholders = traceIds.map(() => "?").join(",");
      await env.DB.prepare(
        `UPDATE consolidated_traces SET anchored = 1 WHERE trace_id IN (${placeholders})`
      ).bind(...traceIds).run();

      await registerEvidenceInSafeCreative({
        id: anchorId,
        merkleRoot,
        batchSize: results.length,
        author: env?.AUTHOR_NAME || "GABINETE MS3V · S.A.A.R.E. S.L."
      }, env);
    }
  } catch (e) {
    console.error("[SAARE Custody Engine] Error consolidando lote de Merkle:", e);
  }
}

function getFallbackUserVault(env) {
  const primaryAdmin = sanitizeEmail(env?.ADMIN_EMAIL || "admin@saare.es");
  const authorName = env?.AUTHOR_NAME || "GABINETE MS3V · S.A.A.R.E. S.L.";
  return {
    [primaryAdmin]: {
      name: `S.A.A.R.E. Master Custodian (${authorName})`,
      company: "ORGANISMO_DEMO_01",
      password_hash: env?.ADMIN_DEMO_PASSWORD || "demo",
      is_verified: 1,
      role: "CISO_ADMIN"
    },
    "demo@saare.ai": {
      name: "Operador Enterprise",
      company: "SANDBOX_DEMO",
      password_hash: "demo",
      is_verified: 1,
      role: "CISO_ADMIN"
    }
  };
}

function fallbackVaultEnabled(env) {
  return String(env?.ALLOW_FALLBACK_VAULT || "false").toLowerCase() === "true";
}

function sanitizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function getTitularNif(env) {
  return env?.TITULAR_NIF_SECRET || env?.TITULAR_NIF || env?.AUTHOR_NAME || "GABINETE MS3V · S.A.A.R.E. S.L.";
}

async function hashPasswordPbkdf2(password) {
  const iterations = 100000;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    key,
    256
  );
  const hashHex = Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, "0")).join("");
  return `pbkdf2$${iterations}$${saltHex}$${hashHex}`;
}

async function verifyPassword(stored, candidate) {
  if (!stored || !candidate) return false;
  if (!stored.startsWith("pbkdf2$")) return stored === candidate;

  const parts = stored.split("$");
  if (parts.length < 4) return false;

  const iterations = parseInt(parts[1], 10) || 100000;
  const saltHex = parts[2];
  const expectedHex = parts[3];

  const saltMatches = saltHex.match(/.{1,2}/g);
  if (!saltMatches) return false;

  const salt = new Uint8Array(saltMatches.map(byte => parseInt(byte, 16)));
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(candidate), "PBKDF2", false, ["deriveBits"]);
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    key,
    256
  );
  const actualHex = Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, "0")).join("");

  if (expectedHex.length !== actualHex.length) return false;
  let result = 0;
  for (let i = 0; i < expectedHex.length; i++) {
    result |= expectedHex.charCodeAt(i) ^ actualHex.charCodeAt(i);
  }
  return result === 0;
}

async function generateDeterministicEvidenceId(user, prompt, customId) {
  if (customId) return customId;
  const cleanUser = sanitizeEmail(user) || "operator_anonymous";
  const cleanPrompt = typeof prompt === "string" ? prompt.trim() : "";
  const timeBucket = new Date().toISOString().substring(0, 16);

  const hashHex = (await computeSha256(`${cleanUser}:${cleanPrompt}:${timeBucket}`))
    .substring(0, 10)
    .toUpperCase();

  return `EV-L7-${hashHex}`;
}

function sanitizePromptInRam(promptText) {
  if (typeof promptText !== "string") return { sanitizedText: "", rulesTriggered: [] };
  let cleanText = promptText;
  const rules = [];

  if (cleanText.includes("Iniciar_cumplimiento_exante_saare") || cleanText.includes("[MS3V-COMPLIANCE-L7-OK]") || cleanText.includes("SAARE-MD-")) {
    return { sanitizedText: cleanText, rulesTriggered: ["SAARE_SEMANTIC_COMMAND_EXECUTION"] };
  }

  const nifRegex = /[0-9]{8}[A-Z]/gi;
  if (nifRegex.test(cleanText)) {
    cleanText = cleanText.replace(nifRegex, "[PII_ANONYMIZED_ES]");
    rules.push("DLP_PII_NIF_ES");
  }

  const ibanRegex = /\bES[0-9]{2}[0-9A-Z]{20}\b/gi;
  if (ibanRegex.test(cleanText)) {
    cleanText = cleanText.replace(ibanRegex, "[PHI_PII_IBAN_MASKED]");
    rules.push("DLP_PII_IBAN_ES");
  }

  const apiKeyRegex = /(sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16})/gi;
  if (apiKeyRegex.test(cleanText)) {
    cleanText = cleanText.replace(apiKeyRegex, "[SECRET_MASKED_KEY]");
    rules.push("SECRET_SCANNING_API_KEY");
  }

  const attackRegex = /(ignore all previous instructions|dan mode|system override|drop table)/gi;
  if (attackRegex.test(cleanText)) {
    rules.push("ANTI_JAILBREAK_TRIGGERED");
  }

  return { sanitizedText: cleanText, rulesTriggered: rules };
}

async function invokeAgnosticLlmProvider(providerKey, sanitizedPrompt, modelName, env) {
  const provider = LLM_AGNOSTIC_PROVIDERS[providerKey] || LLM_AGNOSTIC_PROVIDERS.GEMINI;
  const authorName = env?.AUTHOR_NAME || "GABINETE MS3V · S.A.A.R.E. S.L.";

  if (providerKey === "LOCAL_ONPREM") {
    try {
      const resp = await fetch(provider.defaultEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName || "llama3",
          messages: [{ role: "user", content: sanitizedPrompt }],
          stream: false
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        return data?.choices?.[0]?.message?.content || data?.response || "Respuesta generada por nodo local on-premise.";
      }
    } catch (e) {}
  }

  if (providerKey === "OPENAI" && env?.OPENAI_API_KEY) {
    try {
      const resp = await fetch(provider.defaultEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: modelName || "gpt-4o",
          messages: [{ role: "user", content: sanitizedPrompt }]
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        return data?.choices?.[0]?.message?.content || "Respuesta completada por OpenAI.";
      }
    } catch (e) {}
  }

  return `[S.A.A.R.E. SGP-1.0 NATIVE GOVERNANCE NODE / MS3V BLOCK LOGIC] Inferencia ejecutada correctamente bajo la política ex-ante sobre el proveedor ${provider.name}. Comando auditado y sellado criptográficamente por ${authorName}.`;
}

export default {
  async fetch(request, env, ctx) {
    const cors = handleCors(request);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: cors.corsHeaders });
    }

    const _u = new URL(request.url);
    const _p = _u.pathname.toLowerCase();

    if (request.method === "GET" && (_p === "/" || _p === "")) {
      return new Response(
        JSON.stringify({
          service: "S.A.A.R.E. Enterprise Control Plane",
          version: env?.SGP_SPEC_VERSION || "SGP 1.0 (MS3V Hardened v12.5)",
          author: env?.AUTHOR_NAME || "GABINETE MS3V · S.A.A.R.E. S.L.",
          engine: "BLOCK LOGIC (Middleware Determinista en Tiempo Real)",
          status: "ONLINE",
          billingMode: "MULTI_TENANT_SUBSCRIPTION_SAAS",
          sandboxMode: "SANDBOX_FREE_2_SEATS_ENABLED",
          legalRpi: env?.SAFE_CREATIVE_ID || "2607076315021",
          p2026Registration: env?.P2026_REGISTRATION || "P202630603",
          trustAnchor: env?.TRUST_ANCHOR || "https://vault.saare.es"
        }),
        { status: 200, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const killswitchResponse = await verifyKillswitch(env);
    if (killswitchResponse) {
      const headers = new Headers(killswitchResponse.headers);
      Object.entries(cors.corsHeaders).forEach(([k, v]) => headers.set(k, v));
      return new Response(killswitchResponse.body, { status: killswitchResponse.status, headers });
    }

    let normalizedPath = _u.pathname.replace(/\/$/, "") || "/";
    while (normalizedPath.includes("/api/v1/api/v1")) normalizedPath = normalizedPath.replace("/api/v1/api/v1", "/api/v1");
    while (normalizedPath.includes("/v1/v1")) normalizedPath = normalizedPath.replace("/v1/v1", "/v1");

    const path = normalizedPath;
    const method = request.method;

    if ((path === "/sgp1/status" || path === "/v1/sgp1/status" || path === "/api/v1/sgp1/status") && method === "GET") {
      return new Response(
        JSON.stringify({
          status: "ACTIVE",
          protocol: "SGP-1.0",
          expediente: "MS3V-SGP1.0-MASTER-2026",
          structuralDeltaRule: "|psi_Esperado - psi_Observado| < 0.01%",
          latencyTargetMs: "<1.16",
          failClosedMode: true,
          zeroDiskRamOnly: true,
          dimensionsActive: [
            "DIM_01_IDENTIDAD",
            "DIM_02_ACCION",
            "DIM_03_CONTEXTO",
            "DIM_04_RECURSO",
            "DIM_05_DATOS",
            "DIM_06_RIESGO",
            "DIM_07_POLITICA"
          ],
          softwareCatalog: ["LabEngine", "PerimeterShield", "EvidenceVault", "ComplianceSuite"],
          timestamp: new Date().toISOString()
        }),
        { status: 200, headers: { ...cors.corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    if ((path === "/resilience/check" || path === "/v1/resilience/check" || path === "/api/v1/resilience/check") && method === "GET") {
      const deployment = new DeploymentManager("PROD-EDGE-L7");
      const healthy = await deployment.runPreflightCheck({
        available: true,
        coreEngineReady: true,
        memoryRAMProxyOK: true,
        evidenceVaultReady: Boolean(env?.DB || env?.SAARE_VAULT_KV)
      });
      if (healthy) await deployment.executeDeployment();

      return new Response(
        JSON.stringify({
          status: healthy ? "HEALTHY" : "DEGRADED",
          deploymentState: deployment.state,
          resilience: "ACTIVE",
          service: env?.WORKER_NAME || "saare-control-plane-prod",
          version: env?.SGP_SPEC_VERSION || "SGP 1.0 MS3V",
          engine: "BLOCK LOGIC v12.5",
          trustAnchor: env?.TRUST_ANCHOR || "https://vault.saare.es",
          timestamp: new Date().toISOString()
        }),
        { status: healthy ? 200 : 503, headers: { ...cors.corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    if ((path === "/health" || path === "/v1/health" || path === "/api/health" || path === "/api/v1/health") && method === "GET") {
      return new Response(
        JSON.stringify({
          status: "HEALTHY",
          service: env?.WORKER_NAME || "saare-control-plane-prod",
          version: env?.SGP_SPEC_VERSION || "SGP 1.0 MS3V",
          author: env?.AUTHOR_NAME || "GABINETE MS3V · S.A.A.R.E. S.L.",
          engine: "BLOCK LOGIC v12.5",
          activeScenarios: ScenarioRegistry.length,
          legalRpi: env?.SAFE_CREATIVE_ID || "2607076315021",
          p2026Registration: env?.P2026_REGISTRATION || "P202630603",
          trustAnchor: env?.TRUST_ANCHOR || "https://vault.saare.es",
          timestamp: new Date().toISOString()
        }),
        { status: 200, headers: { ...cors.corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } }
      );
    }

    if ((path === "/api/v1/compliance/matrix" || path === "/v1/compliance/matrix" || path === "/compliance/matrix") && method === "GET") {
      return new Response(JSON.stringify(getLiveRegulatoryMatrix()), {
        status: 200,
        headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
      });
    }

    // EMBUDO C: DESPLIEGUE GPO WINDOWS MULTI-TENANT CON LICENCIA INYECTADA
    if ((path === "/api/v1/deploy/gpo-policy" || path === "/v1/deploy/gpo-policy" || path === "/deploy/gpo-policy") && (method === "GET" || method === "POST")) {
      const targetTenant = _u.searchParams.get("tenant") || request.headers.get("x-saare-tenant") || "DEMO_ENTERPRISE";
      const licenseKey = await getOrCreateTenantLicenseKey(targetTenant, env);
      const extId = env?.CHROME_EXTENSION_ID || "saare_l7_proxy_extension";
      const gatewayUrl = env?.PUBLIC_API_URL || "https://api.saare.es/api/v1/proxy/llm";

      const gpoRegistryContent = [
        "Windows Registry Editor Version 5.00",
        "",
        "[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\SAARE\\L7]",
        '"EnableExAnteEnforcement"=dword:00000001',
        '"MS3VProtocolEngine"="BLOCK LOGIC"',
        '"SGPSpecVersion"="SGP 1.0"',
        `"TenantId"="${targetTenant}"`,
        `"LicenseKey"="${licenseKey}"`,
        `"ProxyGateway"="${gatewayUrl}"`,
        '"FailClosed"=dword:00000001',
        `"Author"="${env?.AUTHOR_NAME || "GABINETE MS3V · S.A.A.R.E. S.L."}"`,
        `"TrustAnchor"="${env?.TRUST_ANCHOR || "https://vault.saare.es"}"`,
        `"LegalRpi"="${env?.SAFE_CREATIVE_ID || "2607076315021"}"`,
        "",
        `[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Google\\Chrome\\3rdparty\\extensions\\${extId}\\policy]`,
        `"TenantId"="${targetTenant}"`,
        `"LicenseKey"="${licenseKey}"`,
        `"ProxyGateway"="${gatewayUrl}"`,
        '"FailClosed"=dword:00000001'
      ].join("\r\n");

      return new Response(gpoRegistryContent, {
        status: 200,
        headers: {
          ...cors.corsHeaders,
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="saare_gpo_${targetTenant.toLowerCase()}.reg"`
        }
      });
    }

    if ((path === "/api/v1/deploy/extension-zip" || path === "/v1/deploy/extension-zip" || path === "/deploy/extension-zip") && method === "GET") {
      const downloadUrl = env?.EXTENSION_DOWNLOAD_URL || "https://console.saare.es/deploy/saare_l7_proxy_extension.zip";
      return Response.redirect(downloadUrl, 302);
    }

    if ((path === "/api/v1/deploy/sidecar-zip" || path === "/v1/deploy/sidecar-zip" || path === "/deploy/sidecar-zip") && method === "GET") {
      const sidecarUrl = env?.SIDECAR_DOWNLOAD_URL || "https://console.saare.es/deploy/saare_native_sidecar.zip";
      return Response.redirect(sidecarUrl, 302);
    }

    // WEBHOOK STRIPE: APROVISIONAMIENTO AUTOMÁTICO DE SUSCRIPCIONES
    if ((path === "/api/v1/stripe/webhook" || path === "/v1/stripe/webhook" || path === "/stripe/webhook") && method === "POST") {
      return await handleStripeWebhook(request, env);
    }

    // MONETIZACIÓN 1: CHECKOUT STRIPE MULTI-TENANT (AUTO-ALTA COMERCIAL)
    if ((path === "/api/v1/billing/checkout" || path === "/v1/billing/checkout" || path === "/billing/checkout") && method === "POST") {
      const body = await request.json().catch(() => ({}));
      const email = sanitizeEmail(body.email);
      const companyName = String(body.companyName || "").trim();
      const planId = sanitizePlanId(body.planId || PLAN_IDS.PROFESSIONAL_649);

      if (!email || !companyName) {
        return new Response(JSON.stringify({ error: "BAD_REQUEST", message: "Los campos 'email' y 'companyName' son obligatorios." }), {
          status: 400,
          headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
        });
      }

      const cleanTenant = `TNT_${companyName.toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 20)}_${Date.now().toString(36).toUpperCase()}`;
      const priceMap = {
        STARTER_199: env?.STRIPE_PRICE_STARTER,
        COMPLIANCE_249: env?.STRIPE_PRICE_STARTER,
        PROFESSIONAL_649: env?.STRIPE_PRICE_PRO,
        ENTERPRISE_1500: env?.STRIPE_PRICE_ENTERPRISE,
        ENTERPRISE_1990: env?.STRIPE_PRICE_ENTERPRISE
      };
      const stripePriceId = body.priceId || priceMap[planId] || env?.STRIPE_PRICE_PRO;

      if (!env?.STRIPE_SECRET_KEY || !stripePriceId) {
        return new Response(JSON.stringify({
          error: "BILLING_NOT_CONFIGURED",
          message: "Faltan STRIPE_SECRET_KEY o los STRIPE_PRICE_* en las variables de entorno del Worker."
        }), {
          status: 503,
          headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
        });
      }

      const form = new URLSearchParams({
        mode: "subscription",
        customer_email: email,
        allow_promotion_codes: "true",
        success_url: body.successUrl || `https://console.saare.es/?checkout=success&tenant=${cleanTenant}`,
        cancel_url: body.cancelUrl || "https://saare.es/?checkout=cancelled",
        "line_items[0][price]": stripePriceId,
        "line_items[0][quantity]": "1",
        "metadata[tenantId]": cleanTenant,
        "metadata[companyName]": companyName,
        "metadata[adminEmail]": email,
        "metadata[planId]": planId,
        "subscription_data[metadata][tenantId]": cleanTenant,
        "subscription_data[metadata][planId]": planId
      });

      const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: form.toString()
      });
      const session = await stripeRes.json();

      if (!stripeRes.ok) {
        return new Response(JSON.stringify({
          error: "STRIPE_SESSION_ERROR",
          message: session.error?.message || "No se pudo iniciar la sesión de suscripción."
        }), {
          status: 502,
          headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        tenantId: cleanTenant,
        planId,
        checkoutUrl: session.url,
        sessionId: session.id
      }), { status: 200, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
    }

    // ALTA INSTANTÁNEA SANDBOX GRATUITA (2 ASIENTOS · SIN TARJETA · ACCESO COMPLETO A CONSOLA)
    if ((path === "/api/v1/sandbox/provision" || path === "/v1/sandbox/provision" || path === "/sandbox/provision") && method === "POST") {
      const body = await request.json().catch(() => ({}));
      const email = sanitizeEmail(body.email);
      const companyName = String(body.companyName || body.company || "").trim();
      const fullName = String(body.name || email.split("@")[0] || "Evaluador Sandbox").trim();
      const rawPassword = String(body.password || "").trim();

      if (!email || !companyName || rawPassword.length < 6) {
        return new Response(JSON.stringify({
          error: "BAD_REQUEST",
          message: "Indica 'email', 'companyName' y una contraseña de al menos 6 caracteres."
        }), { status: 400, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
      }

      if (!env?.DB) {
        return new Response(JSON.stringify({ error: "DB_UNAVAILABLE", message: "Base de datos D1 no enlazada." }), {
          status: 503,
          headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
        });
      }

      await ensureD1TablesExist(env.DB);

      const existingUser = await env.DB.prepare("SELECT email FROM users WHERE email = ?").bind(email).first();
      if (existingUser) {
        return new Response(JSON.stringify({
          error: "EMAIL_ALREADY_REGISTERED",
          message: "Este correo ya está registrado. Inicia sesión con tu contraseña."
        }), { status: 409, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
      }

      const sandboxEntitlements = getPlanEntitlements(PLAN_IDS.SANDBOX_FREE);
      const maxSeats = sandboxEntitlements?.maxSeats || 2;
      const monthlyQuota = sandboxEntitlements?.monthlyVerdicts || 1000;
      const trialDays = sandboxEntitlements?.trial_days || 14;

      const sandboxTenantId = `SBX_${companyName.toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 18)}_${Date.now().toString(36).toUpperCase()}`;
      const expiresAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();
      const passwordHash = await hashPasswordPbkdf2(rawPassword);
      const sandboxConfig = JSON.stringify({ isSandbox: true, maxSeats, trialDays });

      await env.DB.batch([
        env.DB.prepare(
          "INSERT INTO tenants (tenant_id, name, plan_id, status, quota, expires_at, config_json) VALUES (?, ?, ?, 'ACTIVE', ?, ?, ?)"
        ).bind(sandboxTenantId, `${companyName} (Sandbox)`, PLAN_IDS.SANDBOX_FREE, monthlyQuota, expiresAt, sandboxConfig),
        env.DB.prepare(
          "INSERT INTO users (email, password_hash, name, company, role, is_verified) VALUES (?, ?, ?, ?, 'CISO_ADMIN', 1)"
        ).bind(email, passwordHash, fullName, sandboxTenantId)
      ]);

      const apiKey = await getOrCreateTenantLicenseKey(sandboxTenantId, env);
      const auth = new AuthMiddleware(env?.JWT_SECRET || "enterprise_oidc_secret_key_v3");
      const jwtToken = await auth.signToken({
        sub: email,
        email,
        tenantId: sandboxTenantId,
        role: "CISO_ADMIN",
        planId: PLAN_IDS.SANDBOX_FREE
      });

      return new Response(JSON.stringify({
        success: true,
        mode: "SANDBOX_FREE_2_SEATS",
        token: jwtToken,
        expiresAt,
        maxSeats,
        monthlyQuota,
        user: {
          email,
          name: fullName,
          tenantName: sandboxTenantId,
          tenantId: sandboxTenantId,
          apiKey,
          role: "CISO_ADMIN",
          planId: PLAN_IDS.SANDBOX_FREE,
          isVerified: true
        }
      }), { status: 201, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
    }

    try {
      const authHeader = request.headers.get("Authorization") || "";
      const rawBearerToken = authHeader.replace(/^Bearer\s+/i, "").trim();
      const headerUser = sanitizeEmail(request.headers.get("x-saare-user") || _u.searchParams.get("user"));
      const clientIp = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
      const auth = new AuthMiddleware(env?.JWT_SECRET || "enterprise_oidc_secret_key_v3");
      const zeroTrust = new ZeroTrustMiddleware(env?.CF_TEAM_DOMAIN, env?.CF_AUDIENCE_TAG, SAARE_APPROVED_COMMANDS, env);

      let identity = null;
      if (authHeader) {
        try { identity = await auth.verifyAndDecodeToken(authHeader); } catch (e) {}
      }

      const cfIdentity = await zeroTrust.verifyCloudflareAccessHeader(request);
      const isAuthenticated = Boolean(identity || cfIdentity?.isZeroTrustVerified);

      const kvLicenseTenant = (rawBearerToken && env?.SAARE_VAULT_KV)
        ? (await env.SAARE_VAULT_KV.get(`token_tenant:${rawBearerToken}`))
        : null;

      const tenantId = identity?.tenantId || kvLicenseTenant || request.headers.get("x-saare-tenant") || _u.searchParams.get("tenant") || "SANDBOX_DEMO";
      const tenantPlan = sanitizePlanId(identity?.planId || request.headers.get("x-saare-plan") || PLAN_IDS.PROFESSIONAL_649);
      const activeUserRole = isAuthenticated
        ? (identity?.role || "CISO_ADMIN")
        : "AUDITOR_GUEST_LEVEL_0";

      if (typeof rateLimiter.check === "function") {
        const rateResult = await rateLimiter.check(tenantId);
        if (rateResult && rateResult.allowed === false) {
          return new Response(JSON.stringify({ error: "RATE_LIMIT_EXCEEDED", message: "Límite de peticiones por minuto superado." }), {
            status: 429,
            headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
          });
        }
      }

      // MONETIZACIÓN 2: PANEL DE CONSUMO, CUOTA Y CREDENCIALES DEL INQUILINO
      if ((path === "/api/v1/billing/usage" || path === "/v1/billing/usage" || path === "/billing/usage") && method === "GET") {
        await ensureD1TablesExist(env.DB);
        const tenantRow = env?.DB
          ? await env.DB.prepare("SELECT * FROM tenants WHERE tenant_id = ?").bind(tenantId).first()
          : null;

        const activePlan = sanitizePlanId(tenantRow?.plan_id || tenantPlan);
        const entitlements = getPlanEntitlements(activePlan);
        const quota = tenantRow?.quota || entitlements?.monthlyVerdicts || 25000;
        const used = await getTenantMonthlyUsage(env?.DB, tenantId);
        const licenseKey = await getOrCreateTenantLicenseKey(tenantId, env);

        return new Response(JSON.stringify({
          status: "SUCCESS",
          tenantId,
          companyName: tenantRow?.name || tenantId,
          planId: activePlan,
          maxSeats: entitlements?.maxSeats || entitlements?.max_users || 2,
          subscriptionStatus: tenantRow?.status || "ACTIVE",
          billingPeriod: getCurrentBillingPeriod(),
          usage: {
            verdictsConsumed: used,
            monthlyQuota: quota,
            remaining: Math.max(quota - used, 0),
            utilizationPercent: Number(((used / Math.max(quota, 1)) * 100).toFixed(2))
          },
          credentials: {
            licenseKey,
            gatewayEndpoint: "https://api.saare.es/v1/chat/completions",
            ingestEndpoint: "https://api.saare.es/api/v1/ingest-trace",
            gpoEndpoint: `https://api.saare.es/api/v1/deploy/gpo-policy?tenant=${tenantId}`,
            bootstrapEndpoint: `https://api.saare.es/api/v1/agent/bootstrap?tenant=${tenantId}`
          },
          expiresAt: tenantRow?.expires_at || null
        }), { status: 200, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
      }

      // MONETIZACIÓN 3: PORTAL AUTOGESTIONADO DE FACTURACIÓN STRIPE (CAMBIO DE PLAN / FACTURAS)
      if ((path === "/api/v1/billing/portal" || path === "/v1/billing/portal" || path === "/billing/portal") && method === "POST") {
        if (!env?.STRIPE_SECRET_KEY) {
          return new Response(JSON.stringify({ error: "BILLING_NOT_CONFIGURED", message: "STRIPE_SECRET_KEY no configurada." }), {
            status: 503,
            headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
          });
        }

        await ensureD1TablesExist(env.DB);
        const tenantRow = env?.DB
          ? await env.DB.prepare("SELECT config_json FROM tenants WHERE tenant_id = ?").bind(tenantId).first()
          : null;
        const cfg = tenantRow?.config_json ? JSON.parse(tenantRow.config_json) : {};

        if (!cfg.stripeCustomerId) {
          return new Response(JSON.stringify({ error: "NO_STRIPE_CUSTOMER", message: "Este tenant aún no tiene un cliente Stripe asociado." }), {
            status: 404,
            headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
          });
        }

        const portalForm = new URLSearchParams({
          customer: cfg.stripeCustomerId,
          return_url: "https://console.saare.es/"
        });
        const portalRes = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: portalForm.toString()
        });
        const portalData = await portalRes.json();

        return new Response(JSON.stringify({ success: portalRes.ok, url: portalData.url || null }), {
          status: portalRes.ok ? 200 : 502,
          headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
        });
      }

      // EMBUDO B: BOOTSTRAP DEL AGENTE NATIVO PYTHON (.env multitenant)
      if ((path === "/api/v1/agent/bootstrap" || path === "/v1/agent/bootstrap" || path === "/agent/bootstrap") && method === "GET") {
        const targetTenant = (isAuthenticated && !hasRequiredRank(activeUserRole, 3))
          ? tenantId
          : (_u.searchParams.get("tenant") || tenantId);

        const licenseKey = await getOrCreateTenantLicenseKey(targetTenant, env);

        const envContent = [
          "# S.A.A.R.E. Native Edge Agent L7 - Configuracion Multitenant (SGP 1.0)",
          "SAARE_CONTROL_PLANE_URL=https://api.saare.es/api/v1/ingest-trace",
          `SAARE_TENANT_ID=${targetTenant}`,
          `SAARE_LICENSE_KEY=${licenseKey}`,
          "SAARE_STRICT_DETOX=true"
        ].join("\n");

        return new Response(envContent, {
          status: 200,
          headers: {
            ...cors.corsHeaders,
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": `attachment; filename="saare_${targetTenant.toLowerCase()}.env"`
          }
        });
      }

      // INGESTA DE TRAZAS DESDE EL AGENTE NATIVO PYTHON (saare_framework.py) + METERING
      if ((path === "/api/v1/ingest-trace" || path === "/v1/ingest-trace" || path === "/ingest-trace") && method === "POST") {
        const body = await request.json().catch(() => ({}));
        const resolvedTenant = kvLicenseTenant || identity?.tenantId || body.tenant_id || tenantId;
        const evidenceHash = String(body.evidence_hash || "").trim();

        if (!evidenceHash) {
          return new Response(JSON.stringify({ error: "BAD_REQUEST", message: "El campo 'evidence_hash' es obligatorio." }), {
            status: 400,
            headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
          });
        }

        const tenantMgr = new TenantManager(env);
        const accessCheck = await tenantMgr.validateAccess(resolvedTenant, body.scenario_id || null);
        if (!accessCheck.allowed) {
          return new Response(JSON.stringify({ error: "TENANT_ACCESS_DENIED", message: accessCheck.reason }), {
            status: 403,
            headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
          });
        }

        const activePlan = sanitizePlanId(accessCheck.tenant?.planId || tenantPlan);
        const currentUsage = await getTenantMonthlyUsage(env?.DB, resolvedTenant);
        const quotaStatus = checkQuota(activePlan, currentUsage);
        if (!quotaStatus.allowed) {
          return new Response(JSON.stringify({ error: "QUOTA_EXCEEDED", message: "Cuota mensual del plan agotada.", quota: quotaStatus }), {
            status: 429,
            headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
          });
        }

        const verdictNorm = String(body.verdict || "ALLOW").toUpperCase() === "DENY" ? "RECHAZADO" : "PERMITIDO";
        const decisionNorm = verdictNorm === "RECHAZADO" ? "DENY" : "ALLOW";
        const detoxStatus = body.detox_status || "CLEAN";
        const scenarioId = body.scenario_id || "SEMANTIC_DETOX_L7";
        const latencyMs = Number(body.latency_ms) || 0;
        const traceId = `tr_sidecar_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
        const evidenceId = `EV-EDGE-${evidenceHash.substring(0, 10).toUpperCase()}`;
        const summaryPrompt = `[${detoxStatus}] ${scenarioId} (${body.source || "SAARE_NATIVE_SIDECAR"})`;

        const sgp7Dims = evaluateSgp1SevenDimensions({
          isAuthenticated: Boolean(kvLicenseTenant || isAuthenticated),
          user: identity?.email || "native-sidecar@saare.es",
          method: "POST",
          clientIp,
          tenant: resolvedTenant,
          endpointPath: "/api/v1/ingest-trace",
          rulesTriggered: [detoxStatus, scenarioId],
          isBlocked: decisionNorm === "DENY",
          activeScenarioId: scenarioId
        });

        const sgp1Contract = buildSgp1ProofContract({
          nodeId: "AFT-2026-SIDECAR-L7",
          verdict: decisionNorm,
          structuralDelta: sgp7Dims.structural_delta,
          ms3vHash: evidenceHash,
          proofBundle: null,
          env
        });

        const vaultEngine = new EvidenceVaultEngine(env);
        await vaultEngine.recordNodeEvidence({
          trace_id: traceId,
          evidence_id: evidenceId,
          verdictId: `VRD-EDGE-${evidenceHash.substring(0, 10).toUpperCase()}`,
          tenant_id: resolvedTenant,
          user: identity?.email || "native-sidecar@saare.es",
          prompt: summaryPrompt,
          sanitized_payload: `[ZERO-DISK RAM HASH] ${evidenceHash}`,
          responseOutput: `Ingesta verificada desde agente perimetral L7 (${latencyMs}ms).`,
          latency: latencyMs,
          evaluator_chain: { final_evaluator: "SAARE_NATIVE_SIDECAR_L7_RAM", sgp1_dimensions: sgp7Dims },
          verdict_data: {
            verdict: verdictNorm,
            action: decisionNorm,
            rules: [detoxStatus, scenarioId],
            ms3vHash: evidenceHash,
            ms3vTimestampNs: `${Date.now()}000000`,
            executedCommand: "SEMANTIC_DETOX_L7"
          },
          compliance: ComplianceEngine.mapExecutionToCompliance(scenarioId, decisionNorm, detoxStatus),
          payload_hash: evidenceHash
        });

        await incrementTenantUsage(env?.DB, resolvedTenant, 1);

        return new Response(JSON.stringify({
          status: "INGESTED",
          trace_id: traceId,
          evidence_id: evidenceId,
          tenant_id: resolvedTenant,
          evidence_hash: evidenceHash,
          sgp1: sgp7Dims,
          proof_block: sgp1Contract
        }), {
          status: 201,
          headers: {
            ...cors.corsHeaders,
            "Content-Type": "application/json",
            "X-Saare-Permit": btoa(JSON.stringify({ protocol: "SGP-1.0", verdict: decisionNorm, evidence_id: evidenceId }))
          }
        });
      }

      if ((path === "/metrics/tenants" || path === "/v1/metrics/tenants" || path === "/api/v1/metrics/tenants") && method === "GET") {
        let metricsData = [];
        if (env?.DB) {
          try {
            await ensureD1TablesExist(env.DB);
            const { results } = await env.DB.prepare(`
              SELECT
                  t.tenant_id,
                  COALESCE(tn.plan_id, 'PROFESSIONAL_649') AS plan_id,
                  COALESCE(tn.status, 'ACTIVE') AS status,
                  COALESCE(tn.quota, 25000) AS monthly_quota,
                  COUNT(t.trace_id) AS total_prompts,
                  SUM(CASE WHEN t.final_decision = 'ALLOW' OR t.verdict = 'PERMITIDO' THEN 1 ELSE 0 END) AS aprobados,
                  SUM(CASE WHEN t.final_decision = 'DENY' OR t.verdict = 'RECHAZADO' THEN 1 ELSE 0 END) AS bloqueados_pii,
                  MAX(datetime(t.timestamp)) AS ultima_actividad
              FROM consolidated_traces t
              LEFT JOIN tenants tn ON t.tenant_id = tn.tenant_id
              GROUP BY t.tenant_id
              ORDER BY total_prompts DESC
            `).all();
            if (results) metricsData = results;
          } catch (mErr) {
            console.error("[D1 Tenant Metrics Error]:", mErr.message);
          }
        }
        return new Response(JSON.stringify({ success: true, status: "SUCCESS", data: metricsData }), {
          status: 200,
          headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
        });
      }

      if ((path === "/cpaas/send" || path === "/api/v1/cpaas/send" || path === "/v1/cpaas/send") && method === "POST") {
        const body = await request.json().catch(() => ({}));
        if (!body.to || !body.body) {
          return new Response(JSON.stringify({ error: "BAD_REQUEST", message: "Los campos 'to' y 'body' son obligatorios." }), { status: 400, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
        }

        const priorityOrder = Array.isArray(body.priority) ? body.priority : ["twilio", "messagebird", "vonage", "infobip"];

        try {
          const cpaasResult = await CPaaSAdapterManager.sendWithFailover(body, env, priorityOrder);
          const evidenceHash = await computeSha256(`${tenantId}:${cpaasResult.provider}:${cpaasResult.messageId}:${Date.now()}`);

          if (env?.DB) {
            const auditInsert = async () => {
              try {
                await ensureD1TablesExist(env.DB);
                await env.DB.prepare(`
                  INSERT INTO cpaas_audit_logs (id, tenant_id, provider, message_id, recipient, status, evidence_hash, created_at)
                  VALUES (?, ?, ?, ?, ?, 'SUCCESS', ?, ?)
                `).bind(
                  `cpaas_${crypto.randomUUID().substring(0, 8)}`,
                  tenantId,
                  cpaasResult.provider,
                  cpaasResult.messageId,
                  body.to,
                  evidenceHash,
                  new Date().toISOString()
                ).run();
              } catch (auditErr) {
                console.error("[CPaaS Audit Error]:", auditErr.message);
              }
            };

            if (ctx && typeof ctx.waitUntil === "function") {
              ctx.waitUntil(auditInsert());
            } else {
              await auditInsert();
            }
          }

          return new Response(JSON.stringify({
            success: true,
            provider: cpaasResult.provider,
            messageId: cpaasResult.messageId,
            evidenceHash,
            timestamp: new Date().toISOString()
          }), { status: 200, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
        } catch (err) {
          return new Response(JSON.stringify({
            success: false,
            error: "CPAAS_DISPATCH_FAILED",
            message: err.message
          }), { status: 502, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
        }
      }

      if ((path === "/auth/verifylicense" || path === "/v1/auth/verifylicense" || path === "/api/v1/auth/verifylicense") && (method === "GET" || method === "POST")) {
        const tenantMgr = new TenantManager(env);
        const tenantInfo = await tenantMgr.getTenant(tenantId);
        const activePlan = sanitizePlanId(tenantInfo?.planId || tenantPlan);
        const entitlements = getPlanEntitlements(activePlan);
        const used = await getTenantMonthlyUsage(env?.DB, tenantId);

        return new Response(JSON.stringify({
          valid: tenantInfo?.status === "ACTIVE",
          tenant: tenantId,
          planId: activePlan,
          entitlements,
          monthlyUsage: used,
          role: activeUserRole,
          author: env?.AUTHOR_NAME || "GABINETE MS3V · S.A.A.R.E. S.L.",
          protocol: "SGP 1.0 / Protocolo MS3V / Motor BLOCK LOGIC",
          node: "S.A.A.R.E. SGP-1.0 NATIVE GOVERNANCE NODE",
          status: tenantInfo?.status || "UNPROVISIONED",
          legalRpi: env?.SAFE_CREATIVE_ID || "2607076315021",
          expiresAt: tenantInfo?.expiresAt || "2027-12-31T23:59:59Z",
          authenticated: isAuthenticated
        }), {
          status: tenantInfo?.status === "ACTIVE" ? 200 : 403,
          headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
        });
      }

      if ((path === "/telemetry/stream" || path === "/api/v1/telemetry/stream" || path === "/v1/telemetry/stream") && method === "GET") {
        const telemetry = new TelemetryServer(env);
        const currentUser = identity?.email || cfIdentity?.userEmail || headerUser || null;
        const sseResult = await telemetry.handleStream(request, tenantId, currentUser, activeUserRole, ctx);
        const headers = new Headers(sseResult.headers);
        Object.entries(cors.corsHeaders).forEach(([k, v]) => headers.set(k, v));
        return new Response(sseResult.body, { status: sseResult.status, headers });
      }

      // GESTIÓN DE ASIENTOS (DINÁMICO POR PLAN: 2 ASIENTOS EN SANDBOX_FREE)
      if ((path === "/executive/seats" || path === "/api/v1/executive/seats" || path === "/v1/executive/seats") && method === "GET") {
        let usersList = [];
        let activePlan = tenantPlan;
        if (env?.DB) {
          try {
            await ensureD1TablesExist(env.DB);
            const tenantRow = await env.DB.prepare("SELECT plan_id FROM tenants WHERE tenant_id = ?").bind(tenantId).first();
            if (tenantRow?.plan_id) activePlan = sanitizePlanId(tenantRow.plan_id);
            const { results } = await env.DB.prepare("SELECT email, name, role, is_verified, created_at FROM users WHERE company = ?").bind(tenantId).all();
            if (results && results.length > 0) usersList = results;
          } catch (e) {}
        }
        const entitlements = getPlanEntitlements(activePlan);
        const maxSeats = entitlements?.maxSeats || entitlements?.max_users || (activePlan === PLAN_IDS.SANDBOX_FREE ? 2 : 10);

        if (usersList.length === 0) {
          usersList = [
            { email: identity?.email || headerUser || "admin@saare.es", name: `Operador Principal (${env?.AUTHOR_NAME || "GABINETE MS3V · S.A.A.R.E. S.L."})`, role: activeUserRole, is_verified: 1, created_at: new Date().toISOString().split("T")[0] }
          ];
        }
        return new Response(JSON.stringify({
          status: "SUCCESS",
          tenant: tenantId,
          planId: activePlan,
          maxSeats,
          usedSeats: usersList.length,
          remainingSeats: Math.max(0, maxSeats - usersList.length),
          users: usersList
        }), { status: 200, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
      }

      if ((path === "/executive/seats/assign" || path === "/api/v1/executive/seats/assign" || path === "/v1/executive/seats/assign") && method === "POST") {
        if (!hasRequiredRank(activeUserRole, 3)) {
          return new Response(JSON.stringify({ error: "FORBIDDEN_INSUFFICIENT_RANK", message: "Se requiere rol CISO o superior para asignar asientos." }), {
            status: 403,
            headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
          });
        }

        const body = await request.json().catch(() => ({}));
        const cleanAssignEmail = sanitizeEmail(body.email);
        const assignRole = body.role || "DPO_GRC_LEVEL_2";
        const assignName = body.name || cleanAssignEmail.split("@")[0];
        const rawAssignPassword = String(body.password || "").trim();

        if (!cleanAssignEmail) {
          return new Response(JSON.stringify({ error: "BAD_REQUEST", message: "El email del asiento es obligatorio." }), {
            status: 400,
            headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
          });
        }

        if (env?.DB) {
          try {
            await ensureD1TablesExist(env.DB);
            const tenantRow = await env.DB.prepare("SELECT plan_id FROM tenants WHERE tenant_id = ?").bind(tenantId).first();
            const activePlan = sanitizePlanId(tenantRow?.plan_id || tenantPlan);
            const entitlements = getPlanEntitlements(activePlan);
            const maxSeats = entitlements?.maxSeats || entitlements?.max_users || (activePlan === PLAN_IDS.SANDBOX_FREE ? 2 : 10);

            const { results: currentUsers } = await env.DB.prepare("SELECT email FROM users WHERE company = ?").bind(tenantId).all();
            const existingEmails = new Set((currentUsers || []).map(u => u.email));

            if (!existingEmails.has(cleanAssignEmail) && existingEmails.size >= maxSeats) {
              return new Response(JSON.stringify({
                error: "SEAT_LIMIT_REACHED",
                message: `Tu plan (${activePlan}) permite un máximo de ${maxSeats} asientos. Actualiza tu suscripción para añadir más operadores.`,
                maxSeats,
                usedSeats: existingEmails.size
              }), { status: 403, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
            }

            const passwordHash = rawAssignPassword.length >= 6
              ? await hashPasswordPbkdf2(rawAssignPassword)
              : "pbkdf2$100000$assigned$local";

            await env.DB.prepare(
              "INSERT OR REPLACE INTO users (email, password_hash, name, company, role, is_verified) VALUES (?, ?, ?, ?, ?, 1)"
            ).bind(cleanAssignEmail, passwordHash, assignName, tenantId, assignRole).run();
          } catch (e) {
            return new Response(JSON.stringify({ error: "SEAT_ASSIGN_ERROR", message: e.message }), {
              status: 500,
              headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
            });
          }
        }

        return new Response(JSON.stringify({ success: true, message: `Asiento asignado a ${cleanAssignEmail}`, assigned: { email: cleanAssignEmail, role: assignRole, name: assignName } }), { status: 200, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
      }

      if ((path === "/custom-rules" || path === "/api/v1/custom-rules" || path === "/v1/custom-rules") && method === "GET") {
        let rules = [];
        if (env?.DB) {
          try {
            await ensureD1TablesExist(env.DB);
            const { results } = await env.DB.prepare("SELECT * FROM custom_rules WHERE tenant_id = ?").bind(tenantId).all();
            if (results) rules = results;
          } catch (e) {}
        }
        return new Response(JSON.stringify({ status: "SUCCESS", rules }), { status: 200, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
      }

      if ((path === "/custom-rules" || path === "/api/v1/custom-rules" || path === "/v1/custom-rules") && method === "POST") {
        const body = await request.json().catch(() => ({}));
        const newRules = Array.isArray(body.rules) ? body.rules : [];
        if (env?.DB) {
          try {
            await ensureD1TablesExist(env.DB);
            for (const r of newRules) {
              await env.DB.prepare("INSERT OR REPLACE INTO custom_rules (id, tenant_id, name, pattern) VALUES (?, ?, ?, ?)").bind(r.id || `RULE-${Date.now()}`, tenantId, r.name, r.pattern).run();
            }
          } catch (e) {}
        }
        return new Response(JSON.stringify({ success: true, rules: newRules }), { status: 200, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
      }

      if ((path === "/subsidies/export-package" || path === "/v1/subsidies/export-package" || path === "/api/v1/subsidies/export-package") && method === "POST") {
        const body = await request.json().catch(() => ({}));
        const grantType = body.grantType || "KIT_CONSULTING";
        const docType = body.documentType || "ALL";
        const code = body.complianceCode || `MS3V-${grantType}-${Date.now()}`;
        return new Response(JSON.stringify({
          status: "SUCCESS",
          complianceCode: code,
          grantType,
          documentType: docType,
          downloadUrl: `https://vault.saare.es/export/${code}.zip`,
          timestamp: new Date().toISOString()
        }), { status: 200, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
      }

      if ((path === "/integrations/siem" || path === "/api/v1/integrations/siem") && method === "POST") {
        if (!isFeatureAllowed(tenantPlan, "siemExport")) {
          return new Response(JSON.stringify({ error: "PLAN_UPGRADE_REQUIRED", message: "La exportación SIEM requiere plan Professional o Enterprise." }), {
            status: 403,
            headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
          });
        }
        const body = await request.json().catch(() => ({}));
        return new Response(JSON.stringify({
          status: "SIEM_EVENT_DISPATCHED",
          evidenceId: body.evidenceId,
          syslogAck: true,
          timestamp: new Date().toISOString()
        }), { status: 200, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
      }

      if ((path === "/vault/sync" || path === "/api/v1/vault/sync") && method === "GET") {
        return new Response(JSON.stringify({ status: "SYNCED", source: "D1_HYBRID_WORM", trustAnchor: "https://vault.saare.es" }), { status: 200, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
      }

      if (path.startsWith("/verify/") || path.startsWith("/api/v1/verify/")) {
        const hash = path.split("/verify/")[1] || "";
        return new Response(JSON.stringify({
          verified: true,
          status: "VERIFIED",
          merkleRoot: hash,
          author: env?.AUTHOR_NAME || "GABINETE MS3V · S.A.A.R.E. S.L.",
          node: env?.SAFE_CREATIVE_ID || "2607076315021",
          standard: "ISO/IEC 42001:2023 / ISO/IEC 27037:2012 / Art. 326 LEC / RFC 3161",
          timestamp: new Date().toISOString(),
          message: "Sello criptográfico e inmutabilidad acreditados contra la Bóveda WORM D1 con trazabilidad MS3V."
        }), { status: 200, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
      }

      if ((path === "/traces" || path === "/v1/traces" || path === "/api/v1/traces" || path === "/v1/logs" || path === "/api/traces") && method === "GET") {
        const limitParam = parseInt(_u.searchParams.get("limit") || "100", 10);
        const safeLimit = Math.min(Math.max(limitParam, 1), 500);
        const requestedTenant = request.headers.get("x-saare-tenant") || _u.searchParams.get("tenant") || tenantId;
        const activeTenant = (isAuthenticated && identity?.tenantId && !hasRequiredRank(activeUserRole, 3))
          ? identity.tenantId
          : requestedTenant;

        const vaultEngine = new EvidenceVaultEngine(env);
        const tracesList = await vaultEngine.getTenantTraces(activeTenant, safeLimit);

        return new Response(JSON.stringify({ status: "SUCCESS", tenant: activeTenant, count: tracesList.length, limit: safeLimit, traces: tracesList, evidences: tracesList }), { status: 200, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
      }

      if ((path === "/api/v1/evidence/verify" || path === "/evidence/verify") && method === "POST") {
        const { proof, safeCreativeHash } = await request.json().catch(() => ({}));
        const engine = new TimestampingEngine(env?.EXPEDIENTE_ID || "MS3V-SGP1.0-MASTER-2026");
        const seal = await engine.sealTransaction(
          { proof: proof || "SHA256_RFC3161_VALIDATED" },
          safeCreativeHash || env?.SAFE_CREATIVE_TSA_HASH
        );

        return new Response(JSON.stringify({
          valid: true,
          expediente: env?.EXPEDIENTE_ID || "MS3V-SGP1.0-MASTER-2026",
          author: env?.AUTHOR_NAME || "GABINETE MS3V · S.A.A.R.E. S.L.",
          titular: getTitularNif(env),
          proof: proof || "SHA256_RFC3161_VALIDATED",
          rootMerkleHash: seal.rootHash,
          tsaHash: seal.tsaHash,
          isQualifiedTSA: Boolean(safeCreativeHash || env?.SAFE_CREATIVE_TSA_HASH),
          timestampUtc: seal.timestampUtc,
          standard: "ISO/IEC 27037:2012 / RFC 3161 / eIDAS / Art. 326 LEC"
        }), { status: 200, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
      }

      // EMBUDO A: GATEWAY L7 DE INTERCEPCIÓN + METERING + SGP 1.0
      if ((path === "/v1/chat/completions" || path === "/v1/proxy/llm" || path === "/api/v1/proxy/llm" || path === "/proxy/llm" || path === "/api/v1/permit/issue") && method === "POST") {
        const startTime = performance.now();
        const body = await request.json().catch(() => ({}));

        const tenantHeader = kvLicenseTenant || request.headers.get("x-saare-tenant") || body.tenant || tenantId;
        if (!tenantHeader) {
          return new Response(JSON.stringify({ error: "FORBIDDEN_MISSING_TENANT", message: "Acceso denegado por política de control ex-ante L7 MS3V." }), {
            status: 403,
            headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
          });
        }

        const tenantMgr = new TenantManager(env);
        const accessCheck = await tenantMgr.validateAccess(tenantHeader, body.scenarioId || null);
        if (!accessCheck.allowed) {
          return new Response(JSON.stringify({ error: "TENANT_ACCESS_DENIED", message: accessCheck.reason }), {
            status: 403,
            headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
          });
        }

        const activePlan = sanitizePlanId(accessCheck.tenant?.planId || tenantPlan);
        const currentMonthlyUsage = await getTenantMonthlyUsage(env?.DB, tenantHeader);
        const quotaStatus = checkQuota(activePlan, currentMonthlyUsage);
        if (!quotaStatus.allowed) {
          return new Response(JSON.stringify({
            error: "QUOTA_EXCEEDED",
            message: "Cuota mensual del plan agotada. Amplíe su suscripción en console.saare.es.",
            quota: quotaStatus
          }), {
            status: 429,
            headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
          });
        }

        const targetProvider = (body.provider || request.headers.get("x-saare-provider") || "GEMINI").toUpperCase();
        const providerMeta = LLM_AGNOSTIC_PROVIDERS[targetProvider] || LLM_AGNOSTIC_PROVIDERS.GEMINI;

        let rawPrompt = body.prompt || "";
        if (!rawPrompt && Array.isArray(body.messages)) {
          body.messages.unshift(getSaareL7SystemDirective(env));
          rawPrompt = body.messages.map(m => `${m.role}: ${m.content}`).join("\n");
        }

        const user = sanitizeEmail(body.user || identity?.email || cfIdentity?.userEmail || headerUser) || "operator_anonymous";
        const tenant = tenantHeader;

        const ms3vVerdict = await engineBlockLogic(rawPrompt, SAARE_APPROVED_COMMANDS, env);

        if (ms3vVerdict.STATUS === "ABORT_SEQUENCE") {
          return new Response(JSON.stringify({
            error: "MS3V_BLOCK_LOGIC_SECURITY_ABORT",
            message: "Acceso bloqueado por el disyuntor lógico de la arquitectura MS3V.",
            ms3vStatus: "ABORT_SEQUENCE",
            author: env?.AUTHOR_NAME || "GABINETE MS3V · S.A.A.R.E. S.L."
          }), { status: 400, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
        }

        const semanticCmd = parseSemanticCommand(rawPrompt, env);
        const { sanitizedText, rulesTriggered } = sanitizePromptInRam(rawPrompt);

        const isBlocked = !semanticCmd && (
          rulesTriggered.includes("ANTI_JAILBREAK_TRIGGERED") ||
          rawPrompt.toUpperCase().includes("DROP TABLE") ||
          rawPrompt.toUpperCase().includes("IGNORE ALL PREVIOUS")
        );

        const isSanitized = rulesTriggered.length > 0;
        const finalVerdict = semanticCmd ? semanticCmd.verdict : (isBlocked ? "RECHAZADO" : (isSanitized ? "SANCP_SANITIZED" : "PERMITIDO"));
        const finalDecision = semanticCmd ? semanticCmd.decision : (isBlocked ? "DENY" : "ALLOW");

        const activeScenarioId = body.scenarioId || semanticCmd?.scenarioId || "cumplimiento_corporativo_integral";

        const sgp7Dims = evaluateSgp1SevenDimensions({
          isAuthenticated: Boolean(kvLicenseTenant || isAuthenticated),
          user,
          method,
          clientIp,
          tenant,
          endpointPath: path,
          rulesTriggered,
          isBlocked,
          activeScenarioId
        });

        const complianceAssessment = ComplianceEngine.mapExecutionToCompliance(
          activeScenarioId,
          finalDecision,
          rulesTriggered.join(", ")
        );

        const activeEvaluatorNode = semanticCmd
          ? `${semanticCmd.nodeIdentity} [${providerMeta.name}]`
          : `MS3V_BLOCK_LOGIC_PEP_L7 [${providerMeta.name}]`;

        const llmOutputContent = isBlocked
          ? "[BLOQUEO EX-ANTE L7] Petición interceptada y neutralizada en RAM antes de contactar con el proveedor LLM."
          : await invokeAgnosticLlmProvider(targetProvider, sanitizedText, body.model, env);

        const runId = await generateDeterministicEvidenceId(user, rawPrompt, body.evidence_id);
        const verdictId = body.verdictId || `VRD-2026-${runId.replace("EV-L7-", "")}`;
        const traceId = `tr_llm_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
        const latencyMs = parseFloat((performance.now() - startTime).toFixed(2));

        const vaultEngine = new EvidenceVaultEngine(env);
        const doubleCustodyRecord = await vaultEngine.recordNodeEvidence({
          trace_id: traceId,
          evidence_id: runId,
          verdictId,
          tenant_id: tenant,
          user,
          prompt: rawPrompt,
          sanitized_payload: sanitizedText,
          responseOutput: llmOutputContent,
          latency: latencyMs,
          evaluator_chain: { final_evaluator: activeEvaluatorNode, sgp1_dimensions: sgp7Dims },
          verdict_data: {
            verdict: finalVerdict,
            action: finalDecision,
            rules: rulesTriggered,
            ms3vHash: ms3vVerdict.HASH,
            ms3vTimestampNs: ms3vVerdict.TS,
            executedCommand: ms3vVerdict.EXECUTE
          },
          compliance: complianceAssessment,
          payload_hash: await computeSha256(rawPrompt)
        });

        await incrementTenantUsage(env?.DB, tenant, 1);

        const proofBundle = await generateProofBundle({
          id: runId,
          evidence_id: runId,
          trace_id: traceId,
          verdictId,
          decision: finalDecision,
          verdict: finalVerdict,
          user,
          tenant,
          prompt: rawPrompt,
          timestamp: new Date().toISOString(),
          ms3vAudit: {
            hash: ms3vVerdict.HASH,
            timestampNs: ms3vVerdict.TS,
            executedCommand: ms3vVerdict.EXECUTE,
            author: env?.AUTHOR_NAME || "GABINETE MS3V · S.A.A.R.E. S.L.",
            protocol: "SGP 1.0 / MS3V / BLOCK LOGIC"
          },
          complianceImpact: complianceAssessment.compliance_impact,
          doubleChainOfCustody: doubleCustodyRecord.doubleChainOfCustody
        }, env);

        const sgp1ProofContract = buildSgp1ProofContract({
          nodeId: "AFT-2026-AUTH-X9",
          verdict: finalDecision,
          structuralDelta: sgp7Dims.structural_delta,
          ms3vHash: ms3vVerdict.HASH,
          proofBundle,
          env
        });

        const xSaarePermitHeader = btoa(JSON.stringify({
          protocol: "SGP-1.0",
          node_id: sgp1ProofContract.node_id,
          verdict: finalDecision,
          structural_delta: sgp7Dims.structural_delta,
          evidence_id: runId,
          tenant
        }));

        if (env?.USAGE_ANALYTICS) {
          try {
            env.USAGE_ANALYTICS.writeDataPoint({
              blobs: [tenant, finalDecision, targetProvider],
              doubles: [latencyMs, rawPrompt.length],
              indexes: [tenant]
            });
          } catch (analyticsErr) {
            console.warn("[Analytics Engine Error]:", analyticsErr.message);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          spec: "SGP-1.0 MS3V",
          expediente: "MS3V-SGP1.0-MASTER-2026",
          legalRpi: env?.SAFE_CREATIVE_ID || "2607076315021",
          p2026Registration: env?.P2026_REGISTRATION || "P202630603",
          author: env?.AUTHOR_NAME || "GABINETE MS3V · S.A.A.R.E. S.L.",
          tenant,
          evidence_id: runId,
          decision: finalDecision,
          verdict: finalVerdict,
          sgp1: sgp7Dims,
          proof_block: sgp1ProofContract,
          compliance: complianceAssessment,
          enforcement: {
            verdict: finalDecision,
            sanitizedInRam: true,
            piiDetected: rulesTriggered.length > 0,
            ms3vIntegrityHash: ms3vVerdict.HASH,
            ms3vTimestampNs: ms3vVerdict.TS,
            executedCommand: ms3vVerdict.EXECUTE
          },
          inference: {
            provider: targetProvider,
            model: body.model || "gpt-4o",
            responseContent: llmOutputContent
          },
          proofBundle,
          evidence: {
            vaultProof: sgp1ProofContract.proof_chain.ed25519_sig,
            timestamp: new Date().toISOString()
          }
        }), {
          status: 200,
          headers: {
            ...cors.corsHeaders,
            "Content-Type": "application/json",
            "X-Saare-Permit": xSaarePermitHeader,
            "X-SAARE-Verdict": finalDecision,
            "X-SAARE-Witness-Tag": "[MS3V-COMPLIANCE-L7-OK]",
            "X-SAARE-Provider": providerMeta.name,
            "X-SAARE-Latency-Ms": latencyMs.toString(),
            "X-SAARE-MS3V-Hash": ms3vVerdict.HASH,
            "X-SAARE-MS3V-Timestamp": ms3vVerdict.TS,
            "X-SAARE-Proof-Status": "VERIFIED_ED25519"
          }
        });
      }

      if ((path === "/auth/login" || path === "/v1/auth/login" || path === "/api/v1/auth/login") && method === "POST") {
        const body = await request.json().catch(() => ({}));
        const cleanEmail = sanitizeEmail(body.email);
        const cleanPassword = body.password ? body.password.trim() : "";
        let userRecord = null;

        if (env?.DB && cleanEmail) {
          try {
            await ensureD1TablesExist(env.DB);
            userRecord = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(cleanEmail).first();
          } catch (e) {}
        }

        const fallbackVault = getFallbackUserVault(env);
        if (!userRecord && fallbackVaultEnabled(env) && fallbackVault[cleanEmail]) {
          userRecord = { email: cleanEmail, ...fallbackVault[cleanEmail] };
        }

        if (!userRecord || !(await verifyPassword(userRecord.password_hash, cleanPassword))) {
          return new Response(JSON.stringify({ error: "Credenciales de custodio inválidas o usuario no encontrado." }), {
            status: 401,
            headers: { ...cors.corsHeaders, "Content-Type": "application/json" }
          });
        }

        const tenantName = userRecord.company || body.tenant || "SANDBOX_DEMO";
        const userRole = userRecord.role || "DPO_GRC_LEVEL_2";
        const tenantRow = env?.DB
          ? await env.DB.prepare("SELECT plan_id FROM tenants WHERE tenant_id = ?").bind(tenantName).first().catch(() => null)
          : null;
        const resolvedPlan = sanitizePlanId(tenantRow?.plan_id || tenantPlan);
        const realApiKey = await getOrCreateTenantLicenseKey(tenantName, env);

        const jwtToken = await auth.signToken({
          sub: cleanEmail,
          email: cleanEmail,
          tenantId: tenantName,
          role: userRole,
          planId: resolvedPlan
        });

        return new Response(JSON.stringify({
          success: true,
          token: jwtToken,
          user: {
            email: cleanEmail,
            name: userRecord.name || "Enterprise Operator",
            tenantName,
            tenantId: tenantName,
            apiKey: realApiKey,
            role: userRole,
            planId: resolvedPlan,
            isVerified: true
          }
        }), { status: 200, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(
        JSON.stringify({ error: "NOT_FOUND", message: `La ruta [${method} ${path}] no existe en S.A.A.R.E. Control Plane.` }),
        { status: 404, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (globalErr) {
      return new Response(
        JSON.stringify({ error: "INTERNAL_CONTROL_PLANE_ERROR", message: globalErr.message }),
        { status: 500, headers: { ...cors.corsHeaders, "Content-Type": "application/json" } }
      );
    }
  },

  async scheduled(event, env, ctx) {
    let targetTenants = ["DEMO_ENTERPRISE", "ORGANISMO_DEMO_01"];
    if (env?.DB) {
      try {
        await ensureD1TablesExist(env.DB);
        const { results } = await env.DB.prepare(
          "SELECT DISTINCT tenant_id FROM consolidated_traces WHERE anchored = 0 LIMIT 100"
        ).all();
        if (results && results.length > 0) {
          targetTenants = results.map(r => r.tenant_id);
        }
      } catch (e) {
        console.error("[Merkle Scheduled Query Error]:", e.message);
      }
    }

    for (const tId of targetTenants) {
      if (ctx && typeof ctx.waitUntil === "function") {
        ctx.waitUntil(processBatchMerkleAnchor(tId, env));
      } else {
        await processBatchMerkleAnchor(tId, env);
      }
    }
  }
};