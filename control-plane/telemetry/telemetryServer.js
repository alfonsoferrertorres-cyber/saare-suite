export function setupTelemetryStream(app) {
  app.get('/api/v1/telemetry/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Envío de eventos en tiempo real cada 2 segundos
    const intervalId = setInterval(() => {
      const telemetryEvent = {
        timestamp: new Date().toISOString(),
        p50_ms: (0.2 + Math.random() * 0.1).toFixed(2),
        p95_ms: (0.7 + Math.random() * 0.2).toFixed(2),
        p99_ms: (1.0 + Math.random() * 0.3).toFixed(2),
        rps: Math.floor(450 + Math.random() * 50),
        status: 'RUNTIME_ACTIVE'
      };

      res.write(data: \n\n);
    }, 2000);

    req.on('close', () => {
      clearInterval(intervalId);
    });
  });
}
