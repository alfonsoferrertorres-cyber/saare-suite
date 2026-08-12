// Interceptor L7 y Medidor de Benchmarking de latencia para modelos LLM

class L7ProxyInterceptor {
  constructor() {
    this.latencies = [];
  }

  // Intercepta una llamada API, calcula la latencia y la registra
  async executeInterceptedCall(targetUrl, payload, headers = {}) {
    const startTime = performance.now();

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SAARE-L7-Intercepted': 'true',
          ...headers
        },
        body: JSON.stringify(payload)
      });

      const endTime = performance.now();
      const durationMs = parseFloat((endTime - startTime).toFixed(2));
      
      this.recordMetrics(durationMs);

      return {
        ok: response.ok,
        status: response.status,
        data: await response.json(),
        latency_ms: durationMs
      };
    } catch (error) {
      const endTime = performance.now();
      const durationMs = parseFloat((endTime - startTime).toFixed(2));
      this.recordMetrics(durationMs);

      return {
        ok: false,
        error: error.message,
        latency_ms: durationMs
      };
    }
  }

  recordMetrics(durationMs) {
    this.latencies.push(durationMs);
    if (this.latencies.length > 500) this.latencies.shift();
  }

  // Cálculo de percentiles P50, P95 y P99
  getBenchmarks() {
    if (this.latencies.length === 0) {
      return { p50: 0, p95: 0, p99: 0, total_samples: 0 };
    }

    const sorted = [...this.latencies].sort((a, b) => a - b);
    const getPercentile = (p) => {
      const index = Math.ceil((p / 100) * sorted.length) - 1;
      return sorted[Math.max(0, index)];
    };

    return {
      p50: getPercentile(50),
      p95: getPercentile(95),
      p99: getPercentile(99),
      total_samples: sorted.length
    };
  }
}

export const l7Proxy = new L7ProxyInterceptor();
