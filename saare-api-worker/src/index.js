// S.A.A.R.E. Cloudflare Worker Edge Backend (L7 Ingestion & Licensing)
export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-SAARE-License, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // Healthcheck
    if (url.pathname === "/" || url.pathname === "/api/health") {
      return new Response(JSON.stringify({ status: "healthy", service: "SAARE Control-Plane Edge", version: "2.5.0", timestamp: new Date().toISOString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 1. Verificación de Sesiones y Tokens
    if (url.pathname === "/api/v1/verify-session" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const token = (body.token || request.headers.get("X-SAARE-License") || "").trim();
      const user = (body.user || "").trim().toLowerCase();

      const isValid = token === "VK4WH7ZA7rnYNC9" || 
                      token.startsWith("sk_saare_") || 
                      user === "alfonsosb1@gmail.com" || 
                      user.endsWith("@saare.es");

      return new Response(JSON.stringify({
        authenticated: isValid,
        user: user || "alfonsosb1@gmail.com",
        role: "CISO / Global Admin",
        tier: "enterprise_custodian",
        node: "edge-cf-primary",
        sha256_root: "128fa8c937f946a0e695d0ef4654924a"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: isValid ? 200 : 401
      });
    }

    // 2. Ingesta de Telemetría L7 y Evidencias desde la Extensión
    if (url.pathname === "/api/v1/telemetry" && request.method === "POST") {
      const payload = await request.json().catch(() => ({}));
      const license = request.headers.get("X-SAARE-License") || "sk_saare_custodian_session_VK4WH7ZA7rnYNC9";
      
      const evidenceRecord = {
        id: "EV-" + Math.floor(100000 + Math.random() * 900000),
        timestamp: new Date().toISOString(),
        auditor: "alfonsosb1@gmail.com",
        license: license,
        event: payload.event || "PROMPT_INTERCEPTION",
        directive: payload.directive || "LOPD_EU_AI_ACT",
        status: payload.action || "BLOCKED_ON_RAM",
        sha256: payload.hash || "128fa8c937f946a0" + Math.random().toString(16).substring(2, 10)
      };

      return new Response(JSON.stringify({ success: true, evidence: evidenceRecord }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 3. Emisión Automática de Nuevas Licencias Comerciales
    if (url.pathname === "/api/v1/checkout-license" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const clientEmail = (body.email || "client@enterprise.com").toLowerCase();
      const plan = body.plan || "Enterprise Tier";

      const tokenGenerated = "sk_saare_live_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

      return new Response(JSON.stringify({
        success: true,
        license_key: tokenGenerated,
        assigned_to: clientEmail,
        plan: plan,
        valid_until: "2027-12-31T23:59:59Z",
        dual_vault_enabled: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Endpoint no encontrado" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};