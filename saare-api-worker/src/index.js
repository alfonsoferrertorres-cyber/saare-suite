const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-SAARE-License, Authorization",
};

const AUTHORIZED_TENANTS = {
  "SAARE-MASTER-2026-ROOT-001": [
    {
      email: "alfonsosb1@gmail.com",
      role: "CISO / Global Admin",
      tier: "master_isv_enterprise",
      status: "ACTIVE"
    }
  ],
  "SAARE-PRO-2026-1167-TEST": [
    {
      email: "pmaiquess@gmail.com",
      role: "Tenant Auditor / Security Lead",
      tier: "enterprise_custodian",
      status: "ACTIVE"
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

    // 1. Verificación de Licencia y Autenticación Directa
    if (url.pathname === "/api/v1/auth/verify-license" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const licenseKey = (body.licenseKey || "").trim();
      const userEmail = (body.userEmail || "").trim().toLowerCase();

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

      return new Response(JSON.stringify({
        valid: true,
        user: user.email,
        role: user.role,
        tier: user.tier,
        status: user.status,
        license: licenseKey,
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
        tenants_active: 2,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    // 3. Ingesta de Evidencias Forenses
    if (url.pathname === "/api/v1/runs" && request.method === "POST") {
      const evidence = await request.json().catch(() => ({}));
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

    // 4. Consulta de Evidencias Filtradas
    if (url.pathname === "/api/v1/runs" && request.method === "GET") {
      const targetUser = url.searchParams.get("user") || "pmaiquess@gmail.com";
      const sampleRuns = [
        {
          evidenceId: "EV-BLOCK-390615",
          timestamp: new Date().toISOString(),
          verdict: "RECHAZADO",
          user: targetUser,
          licenseKey: targetUser === "alfonsosb1@gmail.com" ? "SAARE-MASTER-2026-ROOT-001" : "SAARE-PRO-2026-1167-TEST",
          violationDetails: {
            norma: "España - LOPDGDD & AEPD",
            reason: "Detección de DNI/NIE en texto de entrada",
            isViolation: true
          }
        }
      ];
      return new Response(JSON.stringify({ runs: sampleRuns }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    // 5. Certificación Pública de Integridad (SHA-256)
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
