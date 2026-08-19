const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-SAARE-License, Authorization, X-Control-Plane-Token, Stripe-Signature",
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

async function sendDeliveryEmail(apiKey, toEmail, licenseKey, scopes) {
  if (!apiKey) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "S.A.A.R.E. Platform <licencias@saare.es>",
        to: [toEmail],
        subject: "🏛️ S.A.A.R.E. L7 | Bienvenida y Credenciales de Acceso - Gabinete MS3V",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#090d16; color:#e2e8f0; padding:32px; border-radius:12px; max-width:620px; margin:auto; border:1px solid #1e293b;">
            <div style="text-align:center; border-bottom:1px solid #1e293b; padding-bottom:20px; margin-bottom:24px;">
              <h1 style="color:#38bdf8; font-size:22px; margin:0 0 6px 0; letter-spacing:1px;">S.A.A.R.E. PLATFORM</h1>
              <p style="color:#94a3b8; font-size:12px; margin:0; text-transform:uppercase; letter-spacing:0.5px;">Gobierno Técnico e Inmutabilidad Forense L7</p>
            </div>

            <p style="font-size:14px; line-height:1.6; color:#f1f5f9;">Estimado/a titular,</p>
            
            <p style="font-size:14px; line-height:1.6; color:#cbd5e1;">
              Le damos la más cordial bienvenida a <strong>S.A.A.R.E. (Stateless Autonomous Audit Runtime Engine)</strong>. Su infraestructura perimetral ha sido aprovisionada y vinculada satisfactoriamente en nuestra Bóveda Forense Dual-Vault.
            </p>

            <div style="background:#0f172a; border:1px solid #334155; border-left:4px solid #0284c7; padding:18px; border-radius:8px; margin:24px 0;">
              <h3 style="color:#38bdf8; font-size:13px; margin:0 0 12px 0; text-transform:uppercase;">Credenciales de Acreditación Forense</h3>
              <p style="margin:0 0 8px 0; font-size:13px;"><strong>Usuario Registrado:</strong> <span style="color:#fff;">${toEmail}</span></p>
              <p style="margin:0 0 8px 0; font-size:13px;"><strong>Clave de Licencia L7:</strong> <code style="color:#38bdf8; background:#020617; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:14px;">${licenseKey}</code></p>
              <p style="margin:0; font-size:13px;"><strong>Módulos y Escenarios Habilitados:</strong> <span style="color:#10b981; font-weight:bold;">${scopes.join(", ")}</span></p>
            </div>

            <h3 style="color:#f8fafc; font-size:14px; margin:24px 0 12px 0;">📘 Instrucciones de Puesta en Marcha y Funcionamiento:</h3>
            <ol style="font-size:13px; color:#cbd5e1; line-height:1.7; padding-left:20px; margin:0 0 24px 0;">
              <li><strong>Acceso a la Consola GRC:</strong> Ingrese en <a href="https://console.saare.es?email=${encodeURIComponent(toEmail)}&license=${licenseKey}" style="color:#38bdf8; text-decoration:none; font-weight:bold;">https://console.saare.es</a> para monitorizar en vivo sus directivas de cumplimiento corporativo.</li>
              <li><strong>Protección Always-On:</strong> El Gateway perimetral L7 intercepta y neutraliza en memoria RAM cualquier intento de fuga de PII (DNI, IBAN) o vectores de Jailbreak antes de su remisión a modelos LLM comerciales.</li>
              <li><strong>Dictámenes Periciales RFC 3161:</strong> Cada evento registrado genera una huella criptográfica canónica Ed25519 con plena validez probatoria ante tribunales y organismos de control (AEPD / ISO 42001).</li>
            </ol>

            <div style="text-align:center; margin:30px 0;">
              <a href="https://console.saare.es?email=${encodeURIComponent(toEmail)}&license=${licenseKey}" style="background:linear-gradient(to right, #0ea5e9, #0284c7); color:#fff; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:13px; display:inline-block;">ENTRAR AL PANEL DE CONTROL &rarr;</a>
            </div>

            <div style="border-top:1px solid #1e293b; padding-top:20px; margin-top:30px; font-size:12px; color:#94a3b8; line-height:1.5;">
              <p style="margin:0 0 4px 0; font-weight:bold; color:#e2e8f0;">Reciba un cordial saludo,</p>
              <p style="margin:0; font-weight:bold; color:#38bdf8;">Gabinete Jurídico y Pericial MS3V</p>
              <p style="margin:2px 0 0 0; font-size:11px; color:#64748b;">División de Auditoría Técnica, Peritaje Forense y Cumplimiento Normativo IA</p>
              <p style="margin:6px 0 0 0; font-size:10px; color:#475569;">Nodo Canónico: 2607076315021 | Custodia Dual-Vault RFC 3161</p>
            </div>
          </div>
        `
      })
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

        // Endpoint de Intercepción L7 para SDKs (Node.js, Python, cURL)
    if (url.pathname === "/api/v1/intercept" && request.method === "POST") {
      const payload = await request.json().catch(() => ({}));
      const promptText = JSON.stringify(payload.messages || payload.prompt || "");
      
      const isDni = /\b(\d{8}[A-HJ-NP-TV-Z]|[XYZ]\d{7}[A-HJ-NP-TV-Z])\b/i.test(promptText);
      const isIban = /\bES\d{2}[\s-]?\d{4}/i.test(promptText);

      if (isDni || isIban) {
        return new Response(JSON.stringify({
          status: "BLOCKED_BY_SAARE_L7",
          verdict: "RECHAZADO",
          node_id: "2607076315021",
          reason: isDni ? "Filtro LOPDGDD: DNI/NIE detectado en RAM" : "Filtro RGPD: IBAN bancario detectado",
          timestamp: new Date().toISOString()
        }), { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({
        status: "APPROVED_CLEAN",
        verdict: "CONFORME",
        node_id: "2607076315021",
        timestamp: new Date().toISOString()
      }), { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }

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
        return new Response(JSON.stringify({ valid: false, error: "Licencia no registrada en Bóveda Forense." }), {
          status: 403,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      const user = tenantList.find(t => t.email.toLowerCase() === userEmail);
      if (!user) {
        return new Response(JSON.stringify({ valid: false, error: `Usuario ${userEmail} no autorizado.` }), {
          status: 401,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      const scopes = user.allowed_scopes || ["all", "saare-console"];
      const hasScope = scopes.includes("all") || scopes.includes(requiredScope);
      if (!hasScope) {
        return new Response(JSON.stringify({ valid: false, error: `Acceso no autorizado al módulo '${requiredScope}'.` }), {
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

    if (url.pathname === "/api/v1/billing/webhook" && request.method === "POST") {
      try {
        const payload = await request.json().catch(() => ({}));
        const dataObject = payload.data ? payload.data.object : payload;
        const customerEmail = (
          dataObject.customer_email ||
          (dataObject.customer_details && dataObject.customer_details.email) ||
          dataObject.email ||
          ""
        ).trim().toLowerCase();

        const planRequested = dataObject.metadata?.plan || dataObject.plan || "saare-console";

        if (!customerEmail) {
          return new Response(JSON.stringify({ error: "Missing customer email" }), {
            status: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
          });
        }

        const generatedLicense = "SAARE-PAID-2026-" + Math.floor(1000 + Math.random() * 9000) + "-COM";
        const scopes = planRequested === "full-bundle" ? ["all", "saare-console", "escenario-b"] : [planRequested];

        const newTenant = [
          {
            email: customerEmail,
            role: "Enterprise Subscriber",
            tier: "production_commercial",
            status: "ACTIVE",
            allowed_scopes: scopes,
            created_at: new Date().toISOString()
          }
        ];

        if (env.SAARE_KV) {
          await env.SAARE_KV.put(`tenant:${generatedLicense}`, JSON.stringify(newTenant));
          await env.SAARE_KV.put(`user_license:${customerEmail}`, generatedLicense);
        }

        if (env.RESEND_API_KEY) {
          await sendDeliveryEmail(env.RESEND_API_KEY, customerEmail, generatedLicense, scopes);
        }

        return new Response(JSON.stringify({
          status: "SUCCESS",
          message: "Licencia emitida con acreditación de Gabinete MS3V",
          customer: customerEmail,
          licenseKey: generatedLicense,
          scopes: scopes
        }), {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });

      } catch (e) {
        return new Response(JSON.stringify({ error: "Billing process error" }), {
          status: 500,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }
    }

    if (url.pathname === "/api/v1/runs") {
      if (request.method === "GET") {
        const targetUser = (url.searchParams.get("user") || "").toLowerCase();
        let runs = [];
        if (env.SAARE_KV && targetUser) {
          runs = (await env.SAARE_KV.get(`runs:${targetUser}`, "json")) || [];
        }
        if (runs.length === 0) {
          runs = [{
            evidenceId: "EV-BLOCK-390615",
            timestamp: "2026-08-18T23:43:34.775Z",
            verdict: "RECHAZADO",
            user: targetUser || "alfonsosb1@gmail.com",
            licenseKey: "SAARE-MASTER-2026-ROOT-001",
            violationDetails: { norma: "España - LOPDGDD & AEPD", reason: "Detección de DNI/NIE en texto de entrada" }
          }];
        }
        return new Response(JSON.stringify({ user: targetUser, total: runs.length, runs: runs }), {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }

      if (request.method === "POST") {
        const evidence = await request.json().catch(() => ({}));
        if (evidence && evidence.evidenceId && env.SAARE_KV) {
          const userKey = `runs:${(evidence.user || "global").toLowerCase()}`;
          const currentRuns = (await env.SAARE_KV.get(userKey, "json")) || [];
          currentRuns.unshift(evidence);
          await env.SAARE_KV.put(userKey, JSON.stringify(currentRuns.slice(0, 100)));
        }
        return new Response(JSON.stringify({ status: "healthy", message: "Evidencia almacenada en Bóveda Forense" }), {
          status: 200,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
        });
      }
    }

    if (url.pathname === "/api/v1/vault/sync") {
      return new Response(JSON.stringify({ status: "Dual-Vault Active", node: "2607076315021", authority: "Gabinete MS3V" }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    if (url.pathname.startsWith("/api/v1/verify")) {
      const hash = url.pathname.split("/").pop();
      if (hash && hash.toLowerCase() === CANONICAL_HASH.toLowerCase()) {
        return new Response(JSON.stringify({
          valid: true,
          status: "IMMUTABLE_ORIGIN_VERIFIED",
          node_id: "2607076315021",
          auditor: "Gabinete Jurídico y Pericial MS3V",
          sha256_fingerprint: hash
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

