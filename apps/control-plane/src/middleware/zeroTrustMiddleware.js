// control-plane/src/middleware/zeroTrustMiddleware.js — Adaptador Cloudflare Access + Motor Determinista MS3V (BLOCK-LOGIC)
import { engineBlockLogic } from "../packages/ms3v-core.js";

const JWKS_MODULE_CACHE = new Map();

export class ZeroTrustMiddleware {
  /**
   * @param {string} teamDomain - ej. "tu-equipo" o "tu-equipo.cloudflareaccess.com"
   * @param {string|string[]} audienceTag - AUD tag(s) de la(s) aplicación(es) en Cloudflare Zero Trust
   * @param {string[]} [approvedParams] - Lista global de comandos/parámetros aprobados para BLOCK-LOGIC
   * @param {Object} [env] - Entorno de ejecución opcional (Cloudflare Workers env)
   */
  constructor(teamDomain, audienceTag, approvedParams = [], env = {}) {
    this.teamDomain = this.normalizeTeamDomain(teamDomain);
    this.audienceTags = Array.isArray(audienceTag)
      ? audienceTag.filter(Boolean)
      : audienceTag ? [audienceTag] : [];
    this.certsUrl = this.teamDomain ? `https://${this.teamDomain}/cdn-cgi/access/certs` : "";
    this.env = env || {};

    this.approvedParams = new Set(
      Array.isArray(approvedParams)
        ? approvedParams.map(p => String(p).trim().toUpperCase()).filter(Boolean)
        : []
    );
  }

  normalizeTeamDomain(domain) {
    if (!domain || typeof domain !== "string") return "";
    let clean = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    if (clean && !clean.includes(".")) {
      clean = `${clean}.cloudflareaccess.com`;
    }
    return clean;
  }

  async getPublicKeys() {
    if (!this.certsUrl) return [];

    const now = Date.now();
    const cached = JWKS_MODULE_CACHE.get(this.certsUrl);
    if (cached && now < cached.expiry) {
      return cached.keys;
    }

    const res = await fetch(this.certsUrl);
    if (!res.ok) {
      throw new Error(`No se pudieron obtener las claves públicas JWKS de ${this.certsUrl}`);
    }

    const jwks = await res.json();
    const keys = Array.isArray(jwks.keys) ? jwks.keys : [];
    JWKS_MODULE_CACHE.set(this.certsUrl, {
      keys,
      expiry: now + 3600 * 1000
    });
    return keys;
  }

  base64UrlDecode(str) {
    const bytes = this.base64UrlToUint8Array(str);
    return new TextDecoder().decode(bytes);
  }

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

  async verifyCloudflareAccessHeader(request) {
    const cfToken = request?.headers?.get("Cf-Access-Jwt-Assertion");

    if (!cfToken) {
      return { userEmail: null, isZeroTrustVerified: false, error: "Cabecera Cf-Access-Jwt-Assertion ausente" };
    }

    if (!this.teamDomain) {
      return {
        userEmail: null,
        isZeroTrustVerified: false,
        error: "CF_TEAM_DOMAIN no configurado; verificación Zero Trust deshabilitada en modo Fail-Closed"
      };
    }

    try {
      const parts = cfToken.split(".");
      if (parts.length !== 3) {
        return { userEmail: null, isZeroTrustVerified: false, error: "Formato JWT inválido" };
      }

      const [rawHeader, rawPayload, rawSignature] = parts;

      const header = JSON.parse(this.base64UrlDecode(rawHeader));
      const payload = JSON.parse(this.base64UrlDecode(rawPayload));

      if (header.alg !== "RS256") {
        return { userEmail: null, isZeroTrustVerified: false, error: `Algoritmo JWT no soportado: ${header.alg || "ausente"}` };
      }

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && now >= payload.exp) {
        return { userEmail: null, isZeroTrustVerified: false, error: "Token expirado" };
      }

      if (payload.nbf && now < payload.nbf) {
        return { userEmail: null, isZeroTrustVerified: false, error: "Token aún no es válido" };
      }

      if (this.audienceTags.length > 0) {
        const tokenAud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
        const hasValidAud = this.audienceTags.some(tag => tokenAud.includes(tag));
        if (!hasValidAud) {
          return { userEmail: null, isZeroTrustVerified: false, error: "Audience (AUD) no coincide" };
        }
      }

      if (payload.iss) {
        const cleanIss = String(payload.iss).trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
        if (cleanIss !== this.teamDomain) {
          return { userEmail: null, isZeroTrustVerified: false, error: "Emisor (iss) no coincide con el Team Domain" };
        }
      }

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

  async processBlockLogic(rawInstruction, customApprovedParams = null) {
    if (!rawInstruction || (typeof rawInstruction !== "string" && typeof rawInstruction !== "object")) {
      return { STATUS: "ABORT_SEQUENCE", REASON: "Instrucción de entrada vacía o no válida" };
    }

    const validParams = Array.isArray(customApprovedParams)
      ? customApprovedParams
      : Array.from(this.approvedParams);

    return await engineBlockLogic(rawInstruction, validParams, this.env);
  }
}

export default ZeroTrustMiddleware;