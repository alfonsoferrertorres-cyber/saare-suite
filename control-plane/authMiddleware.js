/**
 * SAARE Workload Identity & OIDC Authentication Middleware v10.0 (SGP 1.0)
 * Edge-Native Web Crypto Verification for Cloudflare Workers & Runtime Plane
 */

export class AuthMiddleware {
  constructor(jwtSecret, kvBinding = null) {
    if (!jwtSecret && !kvBinding) {
      throw new Error("[AUTH_INIT_ERROR] Se requiere jwtSecret o kvBinding para inicializar AuthMiddleware.");
    }
    this.jwtSecret = jwtSecret || "";
    this.kv = kvBinding;
    this.roleMapping = {
      "saare-ciso-group": "CISO",
      "saare-policy-admin-group": "POLICY_ADMIN",
      "saare-operator-group": "OPERATOR",
      "saare-workload-agent": "WORKLOAD_AGENT"
    };
  }

  /**
   * Decodifica Base64URL en entornos Edge sin dependencias externas
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
    if (!this.jwtSecret) return false;
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
   * Extrae, valida y mapea las credenciales del token Bearer OIDC o API Key contra KV
   */
  async verifyAndDecodeToken(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("[AUTH_ERROR] Token no proporcionado o cabecera Authorization malformada.");
    }

    const rawToken = authHeader.replace("Bearer ", "").trim();

    // 1. Validación de API Keys de Runtime (@saare/judge) contra el almacén KV
    if (rawToken.startsWith("sk_saare_live_") || rawToken.startsWith("sk_live_")) {
      if (this.kv) {
        const tenantDataRaw = await this.kv.get(`apikey:${rawToken}`);
        if (tenantDataRaw) {
          const tenant = JSON.parse(tenantDataRaw);
          return {
            sub: tenant.agentId || "workload-agent",
            email: tenant.ownerEmail || "agent-runtime@saare.es",
            tenantId: tenant.tenantId || "ORGANIZACION_ENTERPRISE",
            role: "WORKLOAD_AGENT",
            authType: "API_KEY_VERIFIED"
          };
        }
      }

      // Si no existe en KV, rechazar de forma estricta (sin fallbacks)
      throw new Error("[AUTH_ERROR] API Key de autorización inválida o no provisionada.");
    }

    // 2. Validación de Tokens JWT / OIDC
    const parts = rawToken.split(".");
    if (parts.length !== 3) {
      throw new Error("[AUTH_ERROR] Formato JWT inválido.");
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    const isSignatureValid = await this.verifySignature(headerB64, payloadB64, signatureB64);
    if (!isSignatureValid) {
      throw new Error("[AUTH_ERROR] Firma JWT no válida o clave de verificación incorrecta.");
    }

    let payload;
    try {
      payload = JSON.parse(this.base64UrlDecode(payloadB64));
    } catch {
      throw new Error("[AUTH_ERROR] Payload JWT corrupto.");
    }

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error("[AUTH_ERROR] Token JWT expirado.");
    }

    // Mapeo estricto de roles corporativos
    const userGroups = payload.groups || payload.roles || [];
    let assignedRole = "OPERATOR"; // Rol base de mínimo privilegio

    for (const group of userGroups) {
      if (this.roleMapping[group]) {
        assignedRole = this.roleMapping[group];
        break;
      }
    }

    return {
      sub: payload.sub || "unknown_subject",
      email: payload.email || payload.user || "operator@empresa.com",
      tenantId: payload.tenant_id || payload.tenant || "SAARE_ENTERPRISE_ORG",
      role: assignedRole,
      groups: userGroups,
      authType: "OIDC_JWT_VERIFIED"
    };
  }
}