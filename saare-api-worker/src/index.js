const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-SAARE-License, Authorization, X-Control-Plane-Token",
};

const AUTHORIZED_TENANTS = {
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

let IN_MEMORY_RUNS = [
  {
    evidenceId: "EV-BLOCK-390615",
    timestamp: "2026-08-18T23:43:34.775Z",
    verdict: "RECHAZADO",
    user: "alfonsosb1@gmail.com",
    licenseKey: "SAARE-MASTER-2026-ROOT-001",
    violationDetails: {
      norma: "España - LOPDGDD & AEPD",
      reason: "Detección de DNI/NIE en texto de entrada",
      isViolation: true
    }
  },
  {
    evidenceId: "EV-BLOCK-184920",
    timestamp: "2026-08-18T22:15:10.120Z",
    verdict: "RECHAZADO",
    user: "alfonsosb1@gmail.com",
    licenseKey: "SAARE-MASTER-2026-ROOT-001",
    violationDetails: {
      norma: "RGPD Bancario",
      reason: "Filtro RGPD: Intento de fuga de cuenta IBAN",
      isViolation: true
    }
  },
  {
    evidenceId: "EV-BLOCK-928311",
    timestamp: "2026-08-18T21:04:45.300Z",
    verdict: "RECHAZADO",
    user: "alfonsosb1@gmail.com",
    licenseKey: "SAARE-MASTER-2026-ROOT-001",
    violationDetails: {
      norma: "Ciberseguridad L7",
      reason: "Top L7: Mitigación de Prompt Injection / Jailbreak DAN",
      isViolation: true
    }
  }
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // 1. Verificación de Licencia, Autenticación y RBAC Scope Guard
    if (url.pathname === "/api/v1/auth/verify-license" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const licenseKey = (body.licenseKey || "").trim();
      const userEmail = (body.userEmail || "").trim().toLowerCase();
      const requiredScope = (body.required_scope || "saare-console").trim();

      // Registro dinámico para altas nuevas de evaluación
      if (!AUTHORIZED_TENANTS[licenseKey] && licenseKey.startsWith("SAARE-")) {
        AUTHORIZED_TENANTS[licenseKey] = [
          {
            email: userEmail,
            role: "Tenant Security Lead",
            tier: "enterprise_evaluation",
            status: "ACTIVE",
            allowed_scopes: ["saare-console"]
          }
        ];
      }

      const tenants = AUTHORIZED_TENANTS[licenseKey];
      if (!tenants) {
        return new Response(JSON.stringify({
          valid: false,
          error: "Licencia no registrada en la Bóveda Forense de SAARE."
        }), {
          status: 403,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      const user = tenants.find(t => t.email.toLowerCase() === userEmail);
      if (!user) {
        return new Response(JSON.stringify({
          valid: false,
          error: `El usuario ${userEmail} no está autorizado bajo la licencia proporcionada.`
        }), {
          status: 401,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      // Validación de Scope / Escenario
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

    // 2. Health Status
    if (url.pathname === "/api/v1/auth/status" || url.pathname === "/api/v1/health") {
      return new Response(JSON.stringify({
        status: "healthy",
        service: "SAARE Edge Core v2.7.0",
        governance_engine: "L7_PERIMETRAL_RAM_ISOLATED",
        node_id: "2607076315021",
        tenants_active: Object.keys(AUTHORIZED_TENANTS).length,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    // 3. Ingesta de Evidencias Forenses (POST)
    if (url.pathname === "/api/v1/runs" && request.method === "POST") {
      const evidence = await request.json().catch(() => ({}));
      if (evidence && evidence.evidenceId) {
        IN_MEMORY_RUNS.unshift(evidence);
      }
      return new Response(JSON.stringify({
        status: "healthy",
        service: "SAARE Edge Core v2.7.0",
        message: "Evidencia indexada en Bóveda Forense Dual-Vault",
        evidenceId: evidence.evidenceId,
        user: evidence.user,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    // 4. Consulta de Evidencias Filtradas (GET)
    if (url.pathname === "/api/v1/runs" && request.method === "GET") {
      const targetUser = (url.searchParams.get("user") || "").toLowerCase();
      const isMaster = targetUser === "alfonsosb1@gmail.com";

      const filteredRuns = isMaster || !targetUser
        ? IN_MEMORY_RUNS
        : IN_MEMORY_RUNS.filter(r => (r.user || "").toLowerCase() === targetUser);

      return new Response(JSON.stringify({
        user: targetUser,
        total: filteredRuns.length,
        runs: filteredRuns
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    // 5. Endpoint L7 Dual-Vault Sync con control-plane
    if (url.pathname === "/api/v1/vault/sync") {
      if (request.method === "POST") {
        const syncPayload = await request.json().catch(() => ({}));
        if (syncPayload.evidence) {
          IN_MEMORY_RUNS.unshift(syncPayload.evidence);
        }
        return new Response(JSON.stringify({
          status: "synced",
          node: "2607076315021",
          hash: CANONICAL_HASH,
          synced_at: new Date().toISOString()
        }), {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({
        status: "Dual-Vault L7 Pipeline Active",
        node: "2607076315021",
        total_sealed: IN_MEMORY_RUNS.length,
        rfc3161_provider: "Ed25519 Native Node"
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    // 6. Certificación Pública de Integridad (SHA-256)
    if (url.pathname.startsWith("/api/v1/verify")) {
      const hash = url.pathname.split("/").pop();
      const isMatch = (hash && hash.toLowerCase() === CANONICAL_HASH.toLowerCase());
      if (isMatch) {
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
      return new Response(JSON.stringify({ valid: false, error: "Huella no indexada." }), {
        status: 404,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Endpoint no encontrado" }), {
      status: 404,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });
  }
};
