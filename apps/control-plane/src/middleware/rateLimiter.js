// rateLimiter.js — Limitador de Tasa Distribuido por Isolates
export class DistributedRateLimiter {
  constructor(windowMs = 60000, defaultMaxRequests = 100) {
    this.windowMs = windowMs;
    this.defaultMaxRequests = defaultMaxRequests;
    this.requests = new Map();
  }

  isAllowed(tenantId, maxRequests = this.defaultMaxRequests) {
    const now = Date.now();
    const cleanTenant = tenantId ? String(tenantId).trim() : "DEFAULT";

    if (!this.requests.has(cleanTenant)) {
      this.requests.set(cleanTenant, []);
    }

    let timestamps = this.requests.get(cleanTenant);
    timestamps = timestamps.filter(t => now - t < this.windowMs);

    if (timestamps.length >= maxRequests) {
      this.requests.set(cleanTenant, timestamps);
      return {
        allowed: false,
        remaining: 0,
        resetInMs: this.windowMs - (now - timestamps[0]),
        reason: "429 Too Many Requests: Cuota de Tenant excedida (Noisy Neighbor Protection)"
      };
    }

    timestamps.push(now);
    this.requests.set(cleanTenant, timestamps);

    return {
      allowed: true,
      remaining: maxRequests - timestamps.length,
      resetInMs: this.windowMs
    };
  }

  check(tenantId, maxRequests = this.defaultMaxRequests) {
    return this.isAllowed(tenantId, maxRequests);
  }
}