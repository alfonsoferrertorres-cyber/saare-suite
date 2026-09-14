export class DistributedRateLimiter {
  constructor(windowMs = 60000, defaultMaxRequests = 5) {
    this.windowMs = windowMs;
    this.defaultMaxRequests = defaultMaxRequests;
    // Nota: En CF Workers, esto protege a nivel de Isolate (nodo local), no a nivel global.
    this.requests = new Map();
  }

  isAllowed(tenantId, maxRequests = this.defaultMaxRequests) {
    const now = Date.now();
    
    if (!this.requests.has(tenantId)) {
      this.requests.set(tenantId, []);
    }
    
    let timestamps = this.requests.get(tenantId);
    
    // Filtrar solicitudes fuera de la ventana deslizante para evitar fugas de memoria
    timestamps = timestamps.filter(t => now - t < this.windowMs);
    
    if (timestamps.length >= maxRequests) {
      this.requests.set(tenantId, timestamps); // Actualizar el mapa
      return {
        allowed: false,
        remaining: 0,
        resetInMs: this.windowMs - (now - timestamps[0]),
        reason: "429 Too Many Requests: Cuota de Tenant excedida (Noisy Neighbor Protection)"
      };
    }
    
    timestamps.push(now);
    this.requests.set(tenantId, timestamps);
    
    return {
      allowed: true,
      remaining: maxRequests - timestamps.length,
      resetInMs: this.windowMs
    };
  }
}