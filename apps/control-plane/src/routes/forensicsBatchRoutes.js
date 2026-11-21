// control-plane/src/routes/forensicsBatchRoutes.js — Endpoints de Sellado y Verificación Forense
import {
  sealForensicBatch,
  verifyEvidenceInclusion
} from "../../../packages/merkle-eidas/forensicBatchService.js";

function normalizeTenant(rawTenant) {
  return (
    String(rawTenant || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, "_")
      .slice(0, 32) || ""
  );
}

async function ensureBatchesTable(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS forensic_batches (
      batch_id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      merkle_root TEXT NOT NULL,
      leaf_count INTEGER NOT NULL DEFAULT 0,
      is_qualified_eidas INTEGER NOT NULL DEFAULT 0,
      assurance_level TEXT NOT NULL DEFAULT 'LOCAL_INTEGRITY',
      tsa_reference TEXT DEFAULT '',
      batch_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

async function loadTenantEvidences(env, tenantId, limit = 100) {
  if (env?.DB) {
    try {
      const { results } = await env.DB.prepare(
        "SELECT evidence_id, trace_id, tenant, decision, payload_json, created_at FROM runs WHERE tenant = ? ORDER BY id DESC LIMIT ?"
      )
        .bind(tenantId, limit)
        .all();

      if (Array.isArray(results) && results.length > 0) {
        return results.map((r) => {
          let parsed = {};
          try {
            parsed = r.payload_json ? JSON.parse(r.payload_json) : {};
          } catch {
            parsed = {};
          }
          return {
            evidence_id: r.evidence_id,
            trace_id: r.trace_id,
            tenant_id: tenantId,
            decision: r.decision,
            payloadHash: parsed.payload_hash || parsed.ms3v_hash || "",
            timestamp: r.created_at
          };
        });
      }
    } catch {}
  }

  const kv = env?.SAARE_VAULT_KV || env?.SAARE_KV_VAULT;
  if (kv) {
    try {
      const stored = await kv.get(`runs_${tenantId}`, "json");
      if (Array.isArray(stored)) return stored.slice(0, limit);
    } catch {}
  }

  return [];
}

export async function handleForensicsRoutes(request, env, corsHeaders = {}) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "POST" && path === "/api/v1/forensics/batch/seal") {
    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const headerTenant = request.headers.get("x-saare-tenant");
    const tenantId = normalizeTenant(body.tenantId || headerTenant);
    if (!tenantId) {
      return new Response(
        JSON.stringify({ error: "TENANT_REQUIRED", message: "Se requiere tenantId válido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const sourceEvidences =
      Array.isArray(body.evidences) && body.evidences.length > 0
        ? body.evidences
        : await loadTenantEvidences(env, tenantId, Number(body.limit) || 100);

    const bundle = await sealForensicBatch(
      {
        tenantId,
        evidences: sourceEvidences,
        enable2of3Custody: body.enable2of3Custody !== false,
        expedienteId: body.expedienteId || null
      },
      env
    );

    if (env?.DB) {
      try {
        await ensureBatchesTable(env.DB);
        await env.DB.prepare(
          `INSERT OR REPLACE INTO forensic_batches (
            batch_id, tenant_id, merkle_root, leaf_count,
            is_qualified_eidas, assurance_level, tsa_reference, batch_json, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            bundle.batchId,
            bundle.tenantId,
            bundle.merkleRoot,
            bundle.leafCount,
            bundle.isQualifiedEidas ? 1 : 0,
            bundle.assuranceLevel,
            bundle.timestampSeal?.tsaReference || "",
            JSON.stringify(bundle),
            bundle.createdAt
          )
          .run();
      } catch (e) {
        console.warn("[ForensicsRoutes] Error guardando lote en D1:", e.message);
      }
    }

    const kv = env?.SAARE_VAULT_KV || env?.SAARE_KV_VAULT;
    if (kv) {
      try {
        await kv.put(`forensic_batch:latest:${bundle.tenantId}`, JSON.stringify(bundle), {
          expirationTtl: 86400 * 90
        });
      } catch {}
    }

    return new Response(JSON.stringify(bundle), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  if (request.method === "POST" && path === "/api/v1/forensics/batch/verify") {
    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const result = await verifyEvidenceInclusion({
      leafHash: body.leafHash,
      proof: body.proof,
      merkleRoot: body.merkleRoot
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  return null;
}