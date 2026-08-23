/**
 * S.A.A.R.E. Control-Plane L7 Core Gateway
 * Cloudflare Worker Backend v5.2.0 (Forensic Vault, GRC Multi-Tenant & SaaS Paywall)
 */

function isOriginAllowed(origin) {
  if (!origin) return false;
  return (
    origin.endsWith(".saare.es") ||
    origin === "https://saare.es" ||
    origin.endsWith(".pages.dev") ||
    origin.startsWith("chrome-extension://") ||
    origin.startsWith("edge-extension://") ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:")
  );
}

function getCorsHeaders(requestOrigin) {
  const originHeader = isOriginAllowed(requestOrigin) ? requestOrigin : (requestOrigin || "*");
  return {
    "Access-Control-Allow-Origin": originHeader,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-SAARE-Client-ID, X-SAARE-Token, X-SAARE-License, X-SAARE-Suite",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY"
  };
}

function jsonResponse(data, status = 200, origin = "") {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(origin), "Content-Type": "application/json; charset=utf-8" },
  });
}

function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return "";
  return email.toLowerCase().replace(/[^a-z0-9@.\-_]/g, '').trim();
}

async function computeSha256(text) {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const requestOrigin = request.headers.get("Origin") || "";

    // 1. Manejo de Preflight CORS (OPTIONS)
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: getCorsHeaders(requestOrigin) });
    }

    try {
      const kv = env.SAARE_VAULT_KV;
      if (!kv) {
        return jsonResponse({ error: "Binding SAARE_VAULT_KV no disponible" }, 500, requestOrigin);
      }

      // 2. ENDPOINT: REGISTRO / CREAR PERFIL (Desde saare-suite)
      if (path === "/api/v1/auth/register" && method === "POST") {
        const body = await request.json();
        const cleanEmail = sanitizeEmail(body.email);
        const password = body.password || "";
        const tenantName = (body.tenantName || "Organización").trim();

        if (!cleanEmail || !password) {
          return jsonResponse({ error: "Correo y contraseña obligatorios." }, 400, requestOrigin);
        }

        const existing = await kv.get(`user:${cleanEmail}`);
        if (existing) {
          return jsonResponse({ error: "El correo ya se encuentra registrado. Inicia sesión." }, 409, requestOrigin);
        }

        const passwordHash = await computeSha256(password);
        const newRecord = {
          email: cleanEmail,
          passwordHash,
          tenantName,
          status: "ACTIVE",
          role: "CISO / Global Admin",
          createdAt: new Date().toISOString()
        };

        await kv.put(`user:${cleanEmail}`, JSON.stringify(newRecord));

        const token = `saare_jwt_${crypto.randomUUID()}`;
        return jsonResponse({
          status: "SUCCESS",
          token,
          user: {
            email: cleanEmail,
            tenantName: newRecord.tenantName,
            role: newRecord.role,
            status: newRecord.status
          }
        }, 201, requestOrigin);
      }

      // 3. ENDPOINT: INICIAR SESIÓN
      if (path === "/api/v1/auth/login" && method === "POST") {
        const body = await request.json();
        const cleanEmail = sanitizeEmail(body.email);
        const password = body.password || "";

        if (!cleanEmail || !password) {
          return jsonResponse({ error: "Credenciales incompletas." }, 400, requestOrigin);
        }

        const raw = await kv.get(`user:${cleanEmail}`);
        let userRecord = raw ? JSON.parse(raw) : null;

        if (!userRecord) {
          // Provisionado automático inicial
          const passwordHash = await computeSha256(password);
          userRecord = {
            email: cleanEmail,
            passwordHash,
            tenantName: "ACME Corp",
            status: "ACTIVE",
            role: "CISO / Global Admin",
            createdAt: new Date().toISOString()
          };
          await kv.put(`user:${cleanEmail}`, JSON.stringify(userRecord));
        } else {
          const inputHash = await computeSha256(password);
          if (userRecord.passwordHash && userRecord.passwordHash !== inputHash) {
            return jsonResponse({ error: "Contraseña incorrecta." }, 401, requestOrigin);
          }
        }

        const token = `saare_jwt_${crypto.randomUUID()}`;
        return jsonResponse({
          status: "SUCCESS",
          token,
          user: {
            email: cleanEmail,
            tenantName: userRecord.tenantName || "Empresa Suscrita",
            role: userRecord.role || "CISO / Global Admin",
            status: userRecord.status || "ACTIVE"
          }
        }, 200, requestOrigin);
      }

      // 4. TELEMETRÍA Y CAPTURA L7 (/api/v1/runs)
      if (path === "/api/v1/runs") {
        if (method === "GET") {
          const user = sanitizeEmail(url.searchParams.get("user") || "");
          if (!user) return jsonResponse([], 200, requestOrigin);
          
          const raw = await kv.get(`runs:${user}`);
          const logs = raw ? JSON.parse(raw) : [];
          return jsonResponse(logs, 200, requestOrigin);
        }

        if (method === "POST") {
          const body = await request.json();
          // Soporta tanto body.user, body.userEmail como query param
          const user = sanitizeEmail(body.user || body.userEmail || url.searchParams.get("user") || "agente_local");
          const kvKey = `runs:${user}`;
          
          const timestamp = body.timestamp || new Date().toISOString();
          const rawInput = body.promptInput || body.promptSummary || body.payload || "Evidencia interceptada en Capa 7";
          const shaHash = await computeSha256(`${user}|${rawInput}|${timestamp}`);
          const runId = body.runId || body.evidenceId || `EV-${shaHash.substring(0, 10).toUpperCase()}`;

          const newEvidence = {
            runId: runId,
            evidenceId: runId,
            timestamp: timestamp,
            user: user,
            tenant: body.tenant || body.tenantDomain || "Corporativo",
            promptInput: rawInput.substring(0, 5000),
            verdict: body.verdict === "PERMITIDO" ? "PERMITIDO" : "RECHAZADO",
            violationDetails: body.violationDetails || { norma: "España - LOPDGDD & AEPD", reason: "Detección en Memoria RAM L7" },
            sha256: shaHash,
            signature: `SHA256:${shaHash}`,
            verifiedL7: true
          };

          const raw = await kv.get(kvKey);
          let current = raw ? JSON.parse(raw) : [];
          current.unshift(newEvidence);
          
          await kv.put(kvKey, JSON.stringify(current.slice(0, 150)));

          return jsonResponse({
            status: "SUCCESS",
            runId: runId,
            evidence: newEvidence
          }, 200, requestOrigin);
        }
      }

      // 5. DIRECTIVAS Y REGLAS DINÁMICAS (/api/v1/custom-rules)
      if (path === "/api/v1/custom-rules") {
        const user = sanitizeEmail(url.searchParams.get("user") || "");

        if (method === "GET") {
          if (!user) {
            // Reglas maestras por defecto si no se pasa usuario
            return jsonResponse([], 200, requestOrigin);
          }
          const raw = await kv.get(`rules:${user}`);
          return jsonResponse(raw ? JSON.parse(raw) : [], 200, requestOrigin);
        }

        if (method === "POST") {
          const body = await request.json();
          if (user && Array.isArray(body)) {
            await kv.put(`rules:${user}`, JSON.stringify(body));
          }
          return jsonResponse({ status: "SYNCED" }, 200, requestOrigin);
        }
      }

      // 6. STRIPE WEBHOOK
      if (path === "/api/v1/stripe/webhook" && method === "POST") {
        const event = await request.json();
        if (event.type === "checkout.session.completed") {
          const session = event.data.object;
          const customerEmail = sanitizeEmail(session.customer_details?.email || session.customer_email);
          
          if (customerEmail) {
            const raw = await kv.get(`user:${customerEmail}`);
            let record = raw ? JSON.parse(raw) : { email: customerEmail, tenantName: "Empresa Suscrita" };
            record.status = "ACTIVE";
            await kv.put(`user:${customerEmail}`, JSON.stringify(record));
          }
          return jsonResponse({ status: "PROVISIONED" }, 200, requestOrigin);
        }
        return jsonResponse({ status: "IGNORED" }, 200, requestOrigin);
      }

      return jsonResponse({ service: "SAARE L7 API SECURE", status: "ONLINE", version: "5.2.0" }, 200, requestOrigin);

    } catch (error) {
      return jsonResponse({ error: "Internal Server Error", details: error.message }, 500, requestOrigin);
    }
  }
};