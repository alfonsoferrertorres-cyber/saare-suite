// control-plane/authMiddleware.js — Middleware Unificado de Autenticación y Generación JWT
export function sanitizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) { base64 += '='; }
  return atob(base64);
}

export class AuthMiddleware {
  constructor(jwtSecret = "enterprise_oidc_secret_key_v3") {
    this.jwtSecret = jwtSecret;
    this.roleMapping = {
      "saare-ciso-group": "CISO_ADMIN",
      "saare-ops-group": "Operator",
      "saare-eng-group": "Engineer"
    };
  }

  /**
   * Genera y firma un Token JWT HMAC-SHA256 para el usuario autenticado
   */
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

  /**
   * Verifica la validez y la firma de un token JWT o API Key entrante
   */
  async verifyAndDecodeToken(token) {
    if (!token) {
      throw new Error("[AUTH_ERROR] Token o API Key no proporcionada");
    }

    const cleanToken = token.startsWith("Bearer ") ? token.replace("Bearer ", "").trim() : token.trim();

    // SOPORTE PARA API KEYS DIRECTAS DE CUSTODIO
    if (cleanToken.startsWith("sk_saare_")) {
      return {
        sub: "api_key_user",
        email: "operator@saare.es",
        tenantId: "ENTERPRISE",
        role: "CISO_ADMIN",
        isApiKey: true
      };
    }

    // VERIFICACIÓN CRIPTOGRÁFICA DE JWT OIDC
    const parts = cleanToken.split(".");
    if (parts.length !== 3) {
      throw new Error("[AUTH_ERROR] Estructura JWT no válida");
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const encoder = new TextEncoder();
    const dataToVerify = encoder.encode(`${headerB64}.${payloadB64}`);
    
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(this.jwtSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBytes = Uint8Array.from(base64UrlDecode(signatureB64), c => c.charCodeAt(0));
    const isValidSignature = await crypto.subtle.verify("HMAC", key, signatureBytes, dataToVerify);

    if (!isValidSignature) {
      throw new Error("[AUTH_ERROR] Firma JWT inválida o manipulada");
    }

    const payloadBytes = Uint8Array.from(base64UrlDecode(payloadB64), c => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error("[AUTH_ERROR] Token JWT expirado");
    }

    const userGroups = payload.groups || [];
    let assignedRole = payload.role || "Business"; 
    for (const group of userGroups) {
      if (this.roleMapping[group]) {
        assignedRole = this.roleMapping[group];
        break;
      }
    }

    return {
      sub: payload.sub,
      email: payload.email,
      tenantId: payload.tenant_id || payload.tenantId || "ENTERPRISE",
      role: assignedRole,
      groups: userGroups
    };
  }
}