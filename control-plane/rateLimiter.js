/**
 * S.A.A.R.E. Distributed Edge Rate Limiter v10.0 (SGP 1.0)
 * Global Sliding Window & Cloudflare KV Integration for Multi-Tenant Throttling
 */

export class DistributedRateLimiter {
  constructor(kvBinding = null, windowSec = 60, defaultMaxRequests = 60) {
    this.kv = kvBinding;
    this.windowSec = windowSec;
    this.defaultMaxRequests = defaultMaxRequests;
    this.memoryFallback = new Map();
  }

  /**
   * Evalúa si una petición está dentro de la cuota del tenant o IP
   * @param {string} identifier - Tenant ID, API Key o IP
   * @param {number} maxRequests - Límite de peticiones por ventana
   * @returns {Promise<object>} Estado de admisión y cabeceras de rate limit
   */
  async isAllowed(identifier, maxRequests = this.defaultMaxRequests) {
    const cleanId = String(identifier || "anonymous").trim().toLowerCase();
    const currentWindowKey = `ratelimit:${cleanId}:${Math.floor(Date.now() / (this.windowSec * 1000))}`;

    // 1. Camino A: Almacén Distribuido Cloudflare KV
    if (this.kv) {
      try {
        const rawCount = await this.kv.get(currentWindowKey);
        const count = rawCount ? parseInt(rawCount, 10) : 0;

        if (count >= maxRequests) {
          return {
            allowed: false,
            remaining: 0,
            limit: maxRequests,
            resetInSec: this.windowSec,
            reason: "429 Too Many Requests: Cuota excedida (Noisy Neighbor Protection)"
          };
        }

        const newCount = count + 1;
        await this.kv.put(currentWindowKey, newCount.toString(), {
          expirationTtl: this.windowSec * 2
        });

        return {
          allowed: true,
          remaining: maxRequests - newCount,
          limit: maxRequests,
          resetInSec: this.windowSec
        };
      } catch {
        // Fallback al camino B si hay microcorte en KV
      }
    }

    // 2. Camino B: Memoria local de respaldo
    const now = Date.now();
    const windowMs = this.windowSec * 1000;

    if (!this.memoryFallback.has(cleanId)) {
      this.memoryFallback.set(cleanId, []);
    }

    const timestamps = this.memoryFallback.get(cleanId);
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    this.memoryFallback.set(cleanId, validTimestamps);

    if (validTimestamps.length >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        limit: maxRequests,
        resetInSec: Math.ceil((windowMs - (now - validTimestamps[0])) / 1000),
        reason: "429 Too Many Requests: Cuota de Tenant excedida (Local Protection)"
      };
    }

    validTimestamps.push(now);
    return {
      allowed: true,
      remaining: maxRequests - validTimestamps.length,
      limit: maxRequests,
      resetInSec: this.windowSec
    };
  }
}