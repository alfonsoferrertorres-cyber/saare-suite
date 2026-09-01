/**
 * S.A.A.R.E. OIDC & JWT Authentication Middleware v10.0 (SGP 1.0)
 * Edge-Native Web Crypto Token Verification for Cloudflare Workers
 */

export class AuthMiddleware {
  constructor(jwtSecret = "enterprise_oidc_secret_key_v3") {
    this.jwtSecret = jwtSecret;
    this.roleMapping = {
      "saare-ciso-group": "CISO",
      "saare-auditor-group": "AUDITOR",
      "saare-ops-group": "OPERATOR",
      "saare-admin-group": "SECURITY_ADMIN"
    };
  }

  /**
   * Decodifica Base64URL en entornos Edge sin dependencias de Node.js
   */
  base64UrlDecode(str) {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  /**
   * Valida la firma criptográfica HMAC-SHA256 del JWT
   */
  async verifySignature(headerB64, payloadB64, signatureB64) {
    try {
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(this.jwtSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      );

      let sigBase64 = signatureB64.replace(/-/g, "+").replace(/_/g, "/");
      while (sigBase64.length % 4) {
        sigBase64 += "=";
      }
      const sigBytes = Uint8Array.from(atob(sigBase64), c => c.charCodeAt(0));

      const dataToVerify = enc.encode(`${headerB64}.${payloadB64}`);
      return await crypto.subtle.verify("HMAC", key, sigBytes, dataToVerify);
    } catch {
      return false;
    }
  }

  /**
   * Extrae, valida y mapea las credenciales del token Bearer OIDC
   */
  async verifyAndDecodeToken(authHeader, requireSignatureCheck = false) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("[AUTH_ERROR] Token OIDC no proporcionado o malformado");
    }

    const rawToken = authHeader.replace("Bearer ", "").trim();

    // Soporte para tokens de API estáticos (sk_live_...)
    if (rawToken.startsWith("sk_saare_live_") || rawToken.startsWith("sk_live_")) {
      return {
        sub: "api-key-operator",
        email: "node-agent@saare.es",
        tenantId: "ORGANIZACION_ENTERPRISE",
        role: "AUDITOR",
        authType: "API_KEY"
      };
    }

    const parts = rawToken.split(".");
    if (parts.length !== 3) {
      throw new Error("[AUTH_ERROR] Formato JWT inválido");
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Validación de firma criptográfica
    if (requireSignatureCheck) {
      const isValid = await this.verifySignature(headerB64, payloadB64, signatureB64);
      if (!isValid) {
        throw new Error("[AUTH_ERROR] Firma JWT no válida");
      }
    }

    let payload;
    try {
      payload = JSON.parse(this.base64UrlDecode(payloadB64));
    } catch {
      throw new Error("[AUTH_ERROR] Payload JWT corrupto");
    }

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error("[AUTH_ERROR] Token JWT expirado");
    }

    // Mapeo de grupos corporativos a roles
    const userGroups = payload.groups || payload.roles || [];
    let assignedRole = "AUDITOR"; // Rol base de mínimo privilegio

    for (const group of userGroups) {
      if (this.roleMapping[group]) {
        assignedRole = this.roleMapping[group];
        break;
      }
    }

    return {
      sub: payload.sub || "unknown_subject",
      email: payload.email || payload.user || "auditor@empresa.es",
      tenantId: payload.tenant_id || payload.tenant || "SAARE_ENTERPRISE_ORG",
      role: assignedRole,
      groups: userGroups,
      authType: "OIDC_JWT"
    };
  }
}