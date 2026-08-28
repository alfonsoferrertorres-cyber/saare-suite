/**
 * S.A.A.R.E. Control-Plane L7 Core Gateway
 * Cloudflare Worker Backend v5.4.0 (Hardened Auth, Reset Password & KV Vault)
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

function generateSalt() {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
}

async function computeSaltedHash(password, salt) {
  const saltedText = `${salt}:${password}:${salt}`;
  const msgUint8 = new TextEncoder().encode(saltedText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function computeLegacySha256(text) {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Control de intentos fallidos
async function checkLoginRateLimit(kv, clientIp) {
  const key = `ratelimit:login:${clientIp}`;
  const attempts = parseInt(await kv.get(key) || "0", 10);
  return attempts < 5;
}

async function recordFailedLogin(kv, clientIp) {
  const key = `ratelimit:login:${clientIp}`;
  const attempts = parseInt(await kv.get(key) || "0", 10) + 1;
  await kv.put(key, attempts.toString(), { expirationTtl: 300 });
}

async function clearLoginRateLimit(kv, clientIp) {
  const key = `ratelimit:login:${clientIp}`;
  await kv.delete(key);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const requestOrigin = request.headers.get("Origin") || "";
    const clientIp = request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "127.0.0.1";

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: getCorsHeaders(requestOrigin) });
    }

    try {
      const kv = env.SAARE_VAULT_KV;
      if (!kv) {
        return jsonResponse({ error: "Binding SAARE_VAULT_KV no disponible" }, 500, requestOrigin);
      }

      // 1. ENDPOINT: REGISTRO / CREAR PERFIL
      if (path === "/api/v1/auth/register" && method === "POST") {
        const body = await request.json();
        const cleanEmail = sanitizeEmail(body.email);
        const password = body.password || "";
        const tenantName = (body.tenantName || "Organización").trim();

        if (!cleanEmail || !password || password.length < 6) {
          return jsonResponse({ error: "Correo y contraseña válida (mínimo 6 caracteres) requeridos." }, 400, requestOrigin);
        }

        const existing = await kv.get(`user:${cleanEmail}`);
        if (existing) {
          return jsonResponse({ error: "El correo ya se encuentra registrado. Inicia sesión o recupera tu contraseña." }, 409, requestOrigin);
        }

        const salt = generateSalt();
        const passwordHash = await computeSaltedHash(password, salt);

        const newRecord = {
          email: cleanEmail,
          salt,
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

      // 2. ENDPOINT: INICIAR SESIÓN
      if (path === "/api/v1/auth/login" && method === "POST") {
        const isAllowed = await checkLoginRateLimit(kv, clientIp);
        if (!isAllowed) {
          return jsonResponse({ 
            error: "Demasiados intentos fallidos. Acceso bloqueado temporalmente durante 5 minutos por seguridad." 
          }, 429, requestOrigin);
        }

        const body = await request.json();
        const cleanEmail = sanitizeEmail(body.email);
        const password = body.password || "";

        if (!cleanEmail || !password) {
          return jsonResponse({ error: "Credenciales incompletas." }, 400, requestOrigin);
        }

        const raw = await kv.get(`user:${cleanEmail}`);
        if (!raw) {
          await recordFailedLogin(kv, clientIp);
          return jsonResponse({ error: "Usuario no registrado o credenciales incorrectas." }, 404, requestOrigin);
        }

        const userRecord = JSON.parse(raw);
        let passwordMatches = false;

        if (userRecord.salt) {
          const computed = await computeSaltedHash(password, userRecord.salt);
          passwordMatches = (computed === userRecord.passwordHash);
        } else {
          const legacy = await computeLegacySha256(password);
          if (legacy === userRecord.passwordHash) {
            passwordMatches = true;
            userRecord.salt = generateSalt();
            userRecord.passwordHash = await computeSaltedHash(password, userRecord.salt);
            await kv.put(`user:${cleanEmail}`, JSON.stringify(userRecord));
          }
        }

        if (!passwordMatches) {
          await recordFailedLogin(kv, clientIp);
          return jsonResponse({ error: "Contraseña incorrecta." }, 401, requestOrigin);
        }

        await clearLoginRateLimit(kv, clientIp);

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

      // 3. ENDPOINT: RECUPERAR / RESTABLECER CONTRASEÑA
      if (path === "/api/v1/auth/reset" && method === "POST") {
        const body = await request.json();
        const cleanEmail = sanitizeEmail(body.email);
        const newPassword = body.password || "";

        if (!cleanEmail || !newPassword || newPassword.length < 6) {
          return jsonResponse({ error: "Introduce un correo válido y una nueva contraseña (mínimo 6 caracteres)." }, 400, requestOrigin);
        }

        const raw = await kv.get(`user:${cleanEmail}`);
        if (!raw) {
          return jsonResponse({ error: "No existe ninguna cuenta registrada con este correo." }, 404, requestOrigin);
        }

        const userRecord = JSON.parse(raw);
        const salt = generateSalt();
        userRecord.salt = salt;
        userRecord.passwordHash = await computeSaltedHash(newPassword, salt);
        userRecord.updatedAt = new Date().toISOString();

        await kv.put(`user:${cleanEmail}`, JSON.stringify(userRecord));
        await clearLoginRateLimit(kv, clientIp);

        return jsonResponse({
          status: "SUCCESS",
          message: "Contraseña restablecida con éxito. Ya puedes iniciar sesión con tu nueva clave."
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
          const user = sanitizeEmail(body.user || body.userEmail || url.searchParams.get("user") || "agente_local");
          const kvKey = `runs:${user}`;

          const timestamp = body.timestamp || new Date().toISOString();
          const rawInput = body.promptInput || body.promptSummary || body.payload || "Evidencia interceptada en Capa 7";
          const shaHash = await computeLegacySha256(`${user}|${rawInput}|${timestamp}`);
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
          if (!user) return jsonResponse([], 200, requestOrigin);
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

      return jsonResponse({ service: "SAARE L7 API SECURE", status: "ONLINE", version: "5.4.0" }, 200, requestOrigin);

    } catch (error) {
      return jsonResponse({ error: "Internal Server Error", details: error.message }, 500, requestOrigin);
    }
  }
};