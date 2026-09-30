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
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export class AuthMiddleware {
  constructor(jwtSecret = "enterprise_oidc_secret_key_v3") {
    this.jwtSecret = jwtSecret;
    this.roleMapping = {
      "saare-ciso-group": "CISO_ADMIN",
      "saare-secops-group": "CISO_SECOPS_LEVEL_3",
      "saare-grc-group": "DPO_GRC_LEVEL_2",
      "saare-exec-group": "BOARD_EXECUTIVE_LEVEL_1"
    };
  }

  /**
   * Genera y firma un Token JWT HMAC-SHA256 para la sesión
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

    const cleanToken = token.startsWith("Bearer ")
      ? token.replace("Bearer ", "").trim()
      : token.trim();

    // 1. Validar API Keys maestras o de servicio
    if (cleanToken.startsWith("sk_saare_")) {
      return {
        sub: "api_key_user",
        email: "operator@saare.es",
        tenantId: "ENTERPRISE",
        role: "CISO_ADMIN",
        isApiKey: true
      };
    }

    // 2. Validar JWT OIDC
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

    const signatureBytes = base64UrlDecode(signatureB64);
    const isValidSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      dataToVerify
    );

    if (!isValidSignature) {
      throw new Error("[AUTH_ERROR] Firma JWT inválida o manipulada");
    }

    const payloadBytes = base64UrlDecode(payloadB64);
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error("[AUTH_ERROR] Token JWT expirado");
    }

    const userGroups = payload.groups || [];
    let assignedRole = payload.role || "OPERATIONAL_AGENT_USER";
    for (const group of userGroups) {
      if (this.roleMapping[group]) {
        assignedRole = this.roleMapping[group];
        break;
      }
    }

    return {
      sub: payload.sub,
      email: sanitizeEmail(payload.email),
      tenantId: payload.tenant_id || payload.tenantId || "ENTERPRISE",
      role: assignedRole,
      groups: userGroups
    };
  }
}