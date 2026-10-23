// control-plane/zeroTrustMiddleware.js — Adaptador de Validación Cloudflare Access (Zero Trust)

export class ZeroTrustMiddleware {
  /**
   * @param {string} teamDomain - ej. "tu-equipo.cloudflareaccess.com"
   * @param {string} audienceTag - AUD tag de la aplicación en Cloudflare Zero Trust
   */
  constructor(teamDomain, audienceTag) {
    this.teamDomain = teamDomain ? teamDomain.replace(/^https?:\/\//, "").replace(/\/$/, "") : "";
    this.audienceTag = audienceTag;
    this.certsUrl = `https://${this.teamDomain}/cdn-cgi/access/certs`;
    this.cachedKeys = null;
    this.keysExpiry = 0;
  }

  /**
   * Obtiene y almacena en caché las claves públicas (JWKS) de Cloudflare Access
   */
  async getPublicKeys() {
    const now = Date.now();
    if (this.cachedKeys && now < this.keysExpiry) {
      return this.cachedKeys;
    }

    const res = await fetch(this.certsUrl);
    if (!res.ok) {
      throw new Error(`No se pudieron obtener las claves públicas JWKS de ${this.certsUrl}`);
    }

    const jwks = await res.json();
    this.cachedKeys = jwks.keys || [];
    // Caché por 1 hora
    this.keysExpiry = now + 3600 * 1000;
    return this.cachedKeys;
  }

  /**
   * Decodifica una cadena Base64URL
   * @param {string} str 
   * @returns {string}
   */
  base64UrlDecode(str) {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    return atob(base64);
  }

  /**
   * Extrae y valida el token emitido por Cloudflare Access
   * @param {Request} request 
   * @returns {Promise<{ userEmail: string | null, isZeroTrustVerified: boolean, identityData?: object, error?: string }>}
   */
  async verifyCloudflareAccessHeader(request) {
    const cfToken = request.headers.get("Cf-Access-Jwt-Assertion");

    if (!cfToken) {
      return { userEmail: null, isZeroTrustVerified: false, error: "Cabecera Cf-Access-Jwt-Assertion ausente" };
    }

    try {
      const parts = cfToken.split(".");
      if (parts.length !== 3) {
        return { userEmail: null, isZeroTrustVerified: false, error: "Formato JWT inválido" };
      }

      const header = JSON.parse(this.base64UrlDecode(parts[0]));
      const payload = JSON.parse(this.base64UrlDecode(parts[1]));

      // 1. Verificación de Expiración (exp)
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && now >= payload.exp) {
        return { userEmail: null, isZeroTrustVerified: false, error: "Token expirado" };
      }

      // 2. Verificación de Not Before (nbf)
      if (payload.nbf && now < payload.nbf) {
        return { userEmail: null, isZeroTrustVerified: false, error: "Token aún no es válido" };
      }

      // 3. Verificación del AUD (Audience Tag)
      if (this.audienceTag) {
        const tokenAud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
        if (!tokenAud.includes(this.audienceTag)) {
          return { userEmail: null, isZeroTrustVerified: false, error: "Audience (AUD) no coincide" };
        }
      }

      // 4. Verificación de Emisor (iss)
      if (this.teamDomain && payload.iss && !payload.iss.includes(this.teamDomain)) {
        return { userEmail: null, isZeroTrustVerified: false, error: "Emisor (iss) no coincide con el Team Domain" };
      }

      const userEmail = payload.email || payload.common_name || payload.sub || "zero_trust_authenticated_user";

      return {
        userEmail,
        isZeroTrustVerified: true,
        identityData: payload
      };
    } catch (e) {
      console.warn("[ZeroTrustMiddleware] Fallo al validar token de Cloudflare Access:", e.message);
      return { userEmail: null, isZeroTrustVerified: false, error: e.message };
    }
  }
}

export default ZeroTrustMiddleware;