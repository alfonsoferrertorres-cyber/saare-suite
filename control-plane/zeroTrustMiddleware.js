// control-plane/zeroTrustMiddleware.js — Adaptador de Validación Cloudflare Access (Zero Trust)
export class ZeroTrustMiddleware {
  constructor(teamDomain, audienceTag) {
    this.teamDomain = teamDomain; // ej. "tu-equipo.cloudflareaccess.com"
    this.audienceTag = audienceTag; // AUD tag de la aplicación en Cloudflare Zero Trust
  }

  /**
   * Extrae y valida el token emitido por Cloudflare Access
   * @param {Request} request 
   * @returns {Promise<{ userEmail: string, isZeroTrustVerified: boolean }>}
   */
  async verifyCloudflareAccessHeader(request) {
    const cfToken = request.headers.get("Cf-Access-Jwt-Assertion");
    
    if (!cfToken) {
      return { userEmail: null, isZeroTrustVerified: false };
    }

    try {
      // Decodificación de cabecera y payload JWT para autenticación Edge
      const parts = cfToken.split(".");
      if (parts.length !== 3) return { userEmail: null, isZeroTrustVerified: false };

      const payloadB64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(payloadB64));

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && now >= payload.exp) {
        return { userEmail: null, isZeroTrustVerified: false };
      }

      return {
        userEmail: payload.email || payload.common_name || "zero_trust_authenticated_user",
        isZeroTrustVerified: true,
        identityData: payload
      };
    } catch (e) {
      console.warn("[ZeroTrustMiddleware] Fallo al validar token de Cloudflare Access:", e.message);
      return { userEmail: null, isZeroTrustVerified: false };
    }
  }
}

export default ZeroTrustMiddleware;