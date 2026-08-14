import fs from "fs";
const code = `export class DistributedRateLimiter {
  constructor(windowMs = 60000, defaultMaxRequests = 5) {
    this.windowMs = windowMs;
    this.defaultMaxRequests = defaultMaxRequests;
    this.requests = new Map();
  }
  isAllowed(tenantId, maxRequests = this.defaultMaxRequests) {
    const now = Date.now();
    if (!this.requests.has(tenantId)) {
      this.requests.set(tenantId, []);
    }
    const timestamps = this.requests.get(tenantId);
    // Filtrar solicitudes fuera de la ventana deslizante
    const validTimestamps = timestamps.filter(t => now - t < this.windowMs);
    this.requests.set(tenantId, validTimestamps);
    if (validTimestamps.length >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetInMs: this.windowMs - (now - validTimestamps[0]),
        reason: "429 Too Many Requests: Cuota de Tenant excedida (Noisy Neighbor Protection)"
      };
    }
    validTimestamps.push(now);
    return {
      allowed: true,
      remaining: maxRequests - validTimestamps.length,
      resetInMs: this.windowMs
    };
  }
}
`;
fs.writeFileSync("rateLimiter.js", code);
console.log("=== rateLimiter.js generado exitosamente ===");

