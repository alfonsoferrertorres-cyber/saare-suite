// control-plane/zeroTrustMiddleware.js — Adaptador de Validación Cloudflare Access (Zero Trust)

export class ZeroTrustMiddleware {
  /**
   * @param {string} teamDomain - ej. "tu-equipo" o "tu-equipo.cloudflareaccess.com"
   * @param {string|string[]} audienceTag - AUD tag(s) de la(s) aplicación(es) en Cloudflare Zero Trust
   */
  constructor(teamDomain, audienceTag) {
    this.teamDomain = this.normalizeTeamDomain(teamDomain);
    this.audienceTags = Array.isArray(audienceTag)
      ? audienceTag.filter(Boolean)
      : audienceTag ? [audienceTag] : [];
    this.certsUrl = this.teamDomain ? `https://${this.teamDomain}/cdn-cgi/access/certs` : "";
    this.cachedKeys = null;
    this.keysExpiry = 0;
  }

  /**
   * Normaliza cualquier entrada de dominio al formato estándar de Cloudflare Access
   * @param {string} domain 
   * @returns {string}
   */
  normalizeTeamDomain(domain) {
    if (!domain || typeof domain !== "string") return "";
    let clean = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (clean && !clean.includes(".")) {
      clean = `${clean}.cloudflareaccess.com`;
    }
    return clean;
  }

  /**
   * Obtiene y almacena en caché las claves públicas (JWKS) de Cloudflare Access
   */
  async getPublicKeys() {
    if (!this.certsUrl) return [];

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
   * Decodifica una cadena Base64URL soportando caracteres UTF-8 de forma segura
   * @param {string} str 
   * @returns {string}
   */
  base64UrlDecode(str) {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
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
   * Convierte una cadena Base64URL a un Uint8Array para operaciones criptográficas
   * @param {string} str 
   * @returns {Uint8Array}
   */
  base64UrlToUint8Array(str) {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Importa una clave JWKS RSA en un objeto CryptoKey listo para verificación RS256
   * @param {object} jwkKey 
   * @returns {Promise<CryptoKey>}
   */
  async importRsaKey(jwkKey) {
    const keyData = { ...jwkKey, alg: jwkKey.alg || "RS256" };
    return await crypto.subtle.importKey(
      "jwk",
      keyData,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: { name: "SHA-256" }
      },
      false,
      ["verify"]
    );
  }

  /**
   * Extrae, valida las peticiones y verifica criptográficamente la firma del JWT emitido por Cloudflare Access
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

      const rawHeader = parts[0];
      const rawPayload = parts[1];
      const rawSignature = parts[2];

      const header = JSON.parse(this.base64UrlDecode(rawHeader));
      const payload = JSON.parse(this.base64UrlDecode(rawPayload));

      // 1. Verificación de Expiración (exp)
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && now >= payload.exp) {
        return { userEmail: null, isZeroTrustVerified: false, error: "Token expirado" };
      }

      // 2. Verificación de Not Before (nbf)
      if (payload.nbf && now < payload.nbf) {
        return { userEmail: null, isZeroTrustVerified: false, error: "Token aún no es válido" };
      }

      // 3. Verificación de AUD (Soporta múltiples audience tags)
      if (this.audienceTags.length > 0) {
        const tokenAud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
        const hasValidAud = this.audienceTags.some(tag => tokenAud.includes(tag));
        if (!hasValidAud) {
          return { userEmail: null, isZeroTrustVerified: false, error: "Audience (AUD) no coincide" };
        }
      }

      // 4. Verificación de Emisor (iss)
      if (this.teamDomain && payload.iss && !payload.iss.includes(this.teamDomain)) {
        return { userEmail: null, isZeroTrustVerified: false, error: "Emisor (iss) no coincide con el Team Domain" };
      }

      // 5. Verificación Criptográfica de la Firma RS256 mediante Web Crypto API
      if (this.teamDomain) {
        const publicKeys = await this.getPublicKeys();
        const matchingJwk = publicKeys.find(key => key.kid === header.kid);

        if (!matchingJwk) {
          return { userEmail: null, isZeroTrustVerified: false, error: "Clave pública (kid) no encontrada en JWKS de Cloudflare" };
        }

        const cryptoKey = await this.importRsaKey(matchingJwk);
        const encoder = new TextEncoder();
        const dataToVerify = encoder.encode(`${rawHeader}.${rawPayload}`);
        const signatureBytes = this.base64UrlToUint8Array(rawSignature);

        const isValidSignature = await crypto.subtle.verify(
          "RSASSA-PKCS1-v1_5",
          cryptoKey,
          signatureBytes,
          dataToVerify
        );

        if (!isValidSignature) {
          return { userEmail: null, isZeroTrustVerified: false, error: "Firma criptográfica RS256 inválida" };
        }
      }

      // Identificación unívoca del usuario sin colisiones
      const userEmail = payload.email || payload.common_name || payload.sub || null;

      if (!userEmail) {
        return { userEmail: null, isZeroTrustVerified: false, error: "Token válido pero carece de identificador de usuario (email/sub)" };
      }

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