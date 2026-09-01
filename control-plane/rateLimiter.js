/**
 * SAARE Distributed Edge Rate Limiter v10.0 (SGP 1.0)
 * Tier-Aware Sliding Window & Multi-Tenant Throttling for Cloudflare Workers
 */

export class DistributedRateLimiter {
  constructor(kvBinding = null, windowSec = 60) {
    this.kv = kvBinding;
    this.windowSec = windowSec;
    this.tierLimits = {
      ANONYMOUS: 60,            // 60 req/min para IPs sin autenticar
      DEVELOPER: 600,           // 600 req/min (Judge API Developer)
      ENTERPRISE_AGENT: 60000,  // 60.000 req/min (High-Throughput Workload Agent)
      CONTROL_PLANE_ADMIN: 300  // 300 req/min para operaciones de consola
    };
    this.memoryFallback = new Map();
  }

  /**
   * Evalúa si una petición está dentro de la cuota autorizada según su nivel
   * @param {string} identifier - Tenant ID, API Key o IP de origen
   * @param {string} tier - 'ANONYMOUS' | 'DEVELOPER' | 'ENTERPRISE_AGENT' | 'CONTROL_PLANE_ADMIN'
   * @returns {Promise<object>} Estado de admisión y cabeceras estándar
   */
  async isAllowed(identifier, tier = "ANONYMOUS") {
    const cleanId = String(identifier || "anonymous").trim().toLowerCase();
    const maxRequests = this.tierLimits[tier] || this.tierLimits.ANONYMOUS;
    const windowSlot = Math.floor(Date.now() / (this.windowSec * 1000));
    const currentWindowKey = `ratelimit:${cleanId}:${windowSlot}`;

    // 1. Almacén Distribuido KV
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
            code: "RATE_LIMIT_EXCEEDED",
            reason: `Cuota de peticiones excedida para el nivel [${tier}].`
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
        // Fallback a memoria local si KV experimenta latencia
      }
    }

    // 2. Memoria Local In-Process
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
        code: "RATE_LIMIT_EXCEEDED",
        reason: `Límite de ejecución alcanzado en nodo local para [${cleanId}].`
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