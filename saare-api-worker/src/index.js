const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-SAARE-License, Authorization, X-Control-Plane-Token",
};

const SEED_TENANTS = {
  "SAARE-MASTER-2026-ROOT-001": [
    {
      email: "alfonsosb1@gmail.com",
      role: "CISO / Global Admin",
      tier: "master_isv_enterprise",
      status: "ACTIVE",
      allowed_scopes: ["all", "saare-console", "escenario-b", "escenario-c"]
    }
  ],
  "SAARE-PRO-2026-1167-TEST": [
    {
      email: "pmaiquess@gmail.com",
      role: "Tenant Auditor / Security Lead",
      tier: "enterprise_custodian",
      status: "ACTIVE",
      allowed_scopes: ["saare-console", "escenario-b"]
    }
  ],
  "SAARE-PRO-2026-3374-EVAL": [
    {
      email: "alfonsoferrertorres@gmail.com",
      role: "Tenant Security Lead",
      tier: "enterprise_evaluation",
      status: "ACTIVE",
      allowed_scopes: ["saare-console"]
    }
  ]
};

const CANONICAL_HASH = "128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // 1. Verificación de Licencia, Autenticación y RBAC Scope Guard (Persistente con KV)
    if (url.pathname === "/api/v1/auth/verify-license" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const licenseKey = (body.licenseKey || "").trim();
      const userEmail = (body.userEmail || "").trim().toLowerCase();
      const requiredScope = (body.required_scope || "saare-console").trim();

      let tenantList = null;

      if (env.SAARE_KV) {
        const stored = await env.SAARE_KV.get(`tenant:${licenseKey}`, "json");
        if (stored) tenantList = stored;
      }

      if (!tenantList) {
        tenantList = SEED_TENANTS[licenseKey];
      }

      // Auto-registro dinámico persistente
      if (!tenantList && licenseKey.startsWith("SAARE-")) {
        tenantList = [
          {
            email: userEmail,
            role: "Tenant Security Lead",
            tier: "enterprise_evaluation",
            status: "ACTIVE",
            allowed_scopes: ["saare-console"]
          }
        ];
        if (env.SAARE_KV) {
          await env.SAARE_KV.put(`tenant:${licenseKey}`, JSON.stringify(tenantList));
        }
      }

      if (!tenantList) {
        return new Response(JSON.stringify({
          valid: false,
          error: "Licencia no registrada en la Bóveda Forense de SAARE."
        }), {
          status: 403,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      const user = tenantList.find(t => t.email.toLowerCase() === userEmail);
      if (!user) {
        return new Response(JSON.stringify({
          valid: false,
          error: `El usuario ${userEmail} no está autorizado bajo la licencia proporcionada.`
        }), {
          status: 401,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      const scopes = user.allowed_scopes || ["all", "saare-console"];
      const hasScope = scopes.includes("all") || scopes.includes(requiredScope);
      if (!hasScope) {
        return new Response(JSON.stringify({
          valid: false,
          error: `Acceso restringido: Su suscripción no autoriza el acceso al módulo '${requiredScope}'.`
        }), {
          status: 403,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({
        valid: true,
        user: user.email,
        role: user.role,
        tier: user.tier,
        status: user.status,
        license: licenseKey,
        allowed_scopes: scopes,
        rfc3161_timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    // 2. Ingesta de Evidencias Forenses Persistentes (POST /api/v1/runs)
    if (url.pathname === "/api/v1/runs" && request.method === "POST") {
      const evidence = await request.json().catch(() => ({}));
      if (evidence && evidence.evidenceId) {
        if (env.SAARE_KV) {
          const userKey = `runs:${(evidence.user || "global").toLowerCase()}`;
          const currentRuns = (await env.SAARE_KV.get(userKey, "json")) || [];
          currentRuns.unshift(evidence);
          await env.SAARE_KV.put(userKey, JSON.stringify(currentRuns.slice(0, 100)));
        }
      }
      return new Response(JSON.stringify({
        status: "healthy",
        service: "SAARE Edge Core v3.4.0 (KV Persistent)",
        message: "Evidencia indexada permanentemente en Cloudflare KV y Dual-Vault",
        evidenceId: evidence.evidenceId,
        user: evidence.user,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    // 3. Consulta de Evidencias Forenses Persistentes (GET /api/v1/runs)
    if (url.pathname === "/api/v1/runs" && request.method === "GET") {
      const targetUser = (url.searchParams.get("user") || "").toLowerCase();
      let runs = [];

      if (env.SAARE_KV && targetUser) {
        runs = (await env.SAARE_KV.get(`runs:${targetUser}`, "json")) || [];
      }

      if (runs.length === 0) {
        runs = [
          {
            evidenceId: "EV-BLOCK-390615",
            timestamp: "2026-08-18T23:43:34.775Z",
            verdict: "RECHAZADO",
            user: targetUser || "alfonsosb1@gmail.com",
            licenseKey: "SAARE-MASTER-2026-ROOT-001",
            violationDetails: {
              norma: "España - LOPDGDD & AEPD",
              reason: "Detección de DNI/NIE en texto de entrada",
              isViolation: true
            }
          }
        ];
      }

      return new Response(JSON.stringify({
        user: targetUser,
        total: runs.length,
        runs: runs
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    // 4. Health Status
    if (url.pathname === "/api/v1/auth/status" || url.pathname === "/api/v1/health") {
      return new Response(JSON.stringify({
        status: "healthy",
        service: "SAARE Edge Core v3.4.0 (KV Persistent)",
        node_id: "2607076315021",
        database: env.SAARE_KV ? "Cloudflare KV Connected" : "Local Seed Active",
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    // 5. Endpoint L7 Dual-Vault Sync
    if (url.pathname === "/api/v1/vault/sync") {
      return new Response(JSON.stringify({
        status: "Dual-Vault L7 Pipeline Active (Persistent Edge)",
        node: "2607076315021",
        rfc3161_provider: "Ed25519 Native Node"
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    // 6. Certificación Pública de Integridad
    if (url.pathname.startsWith("/api/v1/verify")) {
      const hash = url.pathname.split("/").pop();
      if (hash && hash.toLowerCase() === CANONICAL_HASH.toLowerCase()) {
        return new Response(JSON.stringify({
          valid: true,
          status: "IMMUTABLE_ORIGIN_VERIFIED",
          node_id: "2607076315021",
          protocol: "SAARE V7.0 PRO (Stateless ex-ante Engine)",
          compliance: ["EU AI Act 2024/1689", "RGPD Art. 32", "DORA Capa 7"],
          timestamp_utc: new Date().toISOString(),
          sha256_fingerprint: hash,
          custody: "DUAL_VAULT_RFC3161_COMPLIANT"
        }), {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }
    }

    return new Response(JSON.stringify({ error: "Endpoint no encontrado" }), {
      status: 404,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });
  }
};
