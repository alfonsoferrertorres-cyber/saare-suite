import crypto from "crypto";

export function sanitizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
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

  verifyAndDecodeToken(token) {
    if (!token || !token.startsWith("Bearer ")) {
      throw new Error("[AUTH_ERROR] Token OIDC no proporcionado o malformado");
    }
    const rawToken = token.replace("Bearer ", "");
    const parts = rawToken.split(".");
    if (parts.length !== 3) {
      throw new Error("[AUTH_ERROR] Firma JWT no válida");
    }
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
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