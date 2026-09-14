export function sanitizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

// Helper para decodificar Base64Url estándar en entornos web/edge
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) { base64 += '='; }
  return atob(base64);
}

export class AuthMiddleware {
  constructor(jwtSecret = "enterprise_oidc_secret_key_v3") {
    this.jwtSecret = jwtSecret;
    this.roleMapping = {
      "saare-ciso-group": "Business",
      "saare-ops-group": "Operator",
      "saare-eng-group": "Engineer"
    };
  }

  async verifyAndDecodeToken(token) {
    if (!token || !token.startsWith("Bearer ")) {
      throw new Error("[AUTH_ERROR] Token OIDC no proporcionado o malformado");
    }

    const rawToken = token.replace("Bearer ", "");
    const parts = rawToken.split(".");
    if (parts.length !== 3) {
      throw new Error("[AUTH_ERROR] Estructura JWT no válida");
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // 1. Verificación Criptográfica de la Firma (Web Crypto API)
    const encoder = new TextEncoder();
    const dataToVerify = encoder.encode(`${headerB64}.${payloadB64}`);
    
    // Importar la clave secreta para HMAC SHA-256
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(this.jwtSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Convertir la firma base64url a Uint8Array
    const signatureBytes = Uint8Array.from(base64UrlDecode(signatureB64), c => c.charCodeAt(0));

    const isValidSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      dataToVerify
    );

    if (!isValidSignature) {
      throw new Error("[AUTH_ERROR] Firma JWT inválida o manipulada");
    }

    // 2. Validación de expiración y extracción de datos
    const payload = JSON.parse(decodeURIComponent(escape(base64UrlDecode(payloadB64))));
    
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error("[AUTH_ERROR] Token JWT expirado");
    }

    const userGroups = payload.groups || [];
    let assignedRole = "Business"; 
    for (const group of userGroups) {
      if (this.roleMapping[group]) {
        assignedRole = this.roleMapping[group];
        break;
      }
    }

    return {
      sub: payload.sub,
      email: payload.email,
      tenantId: payload.tenant_id,
      role: assignedRole,
      groups: userGroups
    };
  }
}