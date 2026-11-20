// apps/control-plane/src/middleware/authMiddleware.js — Autenticación JWT HS256 y API Keys S.A.A.R.E.

export function sanitizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error("[AUTH_ERROR] Cadena Base64URL con longitud o formato inválido");
    }
    base64 += "=".repeat(4 - pad);
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export class AuthMiddleware {
  constructor(jwtSecret = "enterprise_oidc_secret_key_v3", env = null) {
    this.jwtSecret = jwtSecret;
    this.env = env;
    this.roleMapping = {
      "saare-ciso-group": "CISO_ADMIN",
      "saare-secops-group": "CISO_SECOPS_LEVEL_3",
      "saare-grc-group": "DPO_GRC_LEVEL_2",
      "saare-exec-group": "BOARD_EXECUTIVE_LEVEL_1"
    };
  }

  async signToken(payload, expiresInSeconds = 86400) {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
      iss: "saare-control-plane"
    };

    const encoder = new TextEncoder();
    const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
    const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(fullPayload)));
    const dataToSign = encoder.encode(`${headerB64}.${payloadB64}`);

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(this.jwtSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", key, dataToSign);
    const signatureB64 = base64UrlEncode(signatureBuffer);

    return `${headerB64}.${payloadB64}.${signatureB64}`;
  }

  async verifyAndDecodeToken(token, envOverride = null) {
    if (!token) {
      throw new Error("[AUTH_ERROR] Token o API Key no proporcionada");
    }

    const cleanToken = token.startsWith("Bearer ")
      ? token.replace(/^Bearer\s+/i, "").trim()
      : token.trim();

    if (!cleanToken) {
      throw new Error("[AUTH_ERROR] Token o API Key vacío");
    }

    if (cleanToken.startsWith("sk_saare_")) {
      const runtimeEnv = envOverride || this.env;
      const kv = runtimeEnv?.SAARE_KV_VAULT || runtimeEnv?.SAARE_VAULT_KV || null;
      let resolvedTenant = "DEFAULT_TENANT";

      if (kv) {
        try {
          const mappedTenant = await kv.get(`token_tenant:${cleanToken}`);
          if (mappedTenant) {
            resolvedTenant = mappedTenant;
          }
        } catch {}
      }

      return {
        sub: "service_custodian",
        email: "custodian@tenant.local",
        tenantId: resolvedTenant,
        role: "CISO_ADMIN",
        planId: null,
        isApiKey: true
      };
    }

    const parts = cleanToken.split(".");
    if (parts.length !== 3) {
      throw new Error("[AUTH_ERROR] Estructura JWT no válida");
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    let header;
    try {
      header = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerB64)));
    } catch {
      throw new Error("[AUTH_ERROR] Cabecera JWT inválida");
    }

    if (header.alg !== "HS256") {
      throw new Error(`[AUTH_ERROR] Algoritmo JWT no permitido: ${header.alg || "desconocido"}`);
    }

    const encoder = new TextEncoder();
    const dataToVerify = encoder.encode(`${headerB64}.${payloadB64}`);

    let isValidSignature = false;
    try {
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(this.jwtSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      );

      const signatureBytes = base64UrlDecode(signatureB64);
      isValidSignature = await crypto.subtle.verify(
        "HMAC",
        key,
        signatureBytes,
        dataToVerify
      );
    } catch (err) {
      throw new Error(`[AUTH_ERROR] Error al verificar la firma criptográfica: ${err.message}`);
    }

    if (!isValidSignature) {
      throw new Error("[AUTH_ERROR] Firma JWT inválida o manipulada");
    }

    let payload;
    try {
      const payloadBytes = base64UrlDecode(payloadB64);
      payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    } catch {
      throw new Error("[AUTH_ERROR] Imposible decodificar o parsear el JSON del payload");
    }

    if (payload.exp && (Date.now() / 1000) >= (payload.exp + 5)) {
      throw new Error("[AUTH_ERROR] Token JWT expirado");
    }

    const userGroups = Array.isArray(payload.groups) ? payload.groups : [];
    let assignedRole = payload.role || "OPERATIONAL_AGENT_USER";

    for (const group of userGroups) {
      if (this.roleMapping[group]) {
        assignedRole = this.roleMapping[group];
        break;
      }
    }

    return {
      sub: payload.sub || "user_anonymous",
      email: sanitizeEmail(payload.email || ""),
      tenantId: payload.tenant_id || payload.tenantId || "DEFAULT_TENANT",
      role: assignedRole,
      planId: payload.plan_id || payload.planId || null,
      groups: userGroups
    };
  }
}

export default AuthMiddleware;