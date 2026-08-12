import React, { useState } from 'react';
import { l7Proxy } from '../services/l7Interceptor';

export function L7Dashboard() {
  const [metrics, setMetrics] = useState(l7Proxy.getBenchmarks());
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const handleSimulateCall = async () => {
    setLoading(true);
    // Simular llamada a un modelo LLM con latencia aleatoria
    const mockPayload = { prompt: "Generar informe de cumplimiento", model: "saare-governed-llm" };
    
    // Ejecutar llamada interceptada
    const result = await l7Proxy.executeInterceptedCall('https://jsonplaceholder.typicode.com/posts/1', mockPayload);
    
    setMetrics(l7Proxy.getBenchmarks());
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] Latencia: ${result.latency_ms}ms | Status: ${result.status}`, ...prev.slice(0, 4)]);
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #00F0FF', borderRadius: '8px', background: '#0F141C', color: '#CBD5E1', margin: '20px 0' }}>
      <h3 style={{ color: '#00F0FF', marginTop: 0 }}>Monitor Runtime L7 & Benchmarks de Latencia</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <div style={{ background: '#050811', padding: '15px', border: '1px solid #1E293B', textIndent: 'center' }}>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>P50 (Mediana)</span>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>{metrics.p50} ms</div>
        </div>
        <div style={{ background: '#050811', padding: '15px', border: '1px solid #1E293B', textIndent: 'center' }}>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>P95 (Alta Carga)</span>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F59E0B' }}>{metrics.p95} ms</div>
        </div>
        <div style={{ background: '#050811', padding: '15px', border: '1px solid #1E293B', textIndent: 'center' }}>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>P99 (Pico Máximo)</span>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#EF4444' }}>{metrics.p99} ms</div>
        </div>
        <div style={{ background: '#050811', padding: '15px', border: '1px solid #1E293B', textIndent: 'center' }}>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>Muestras Capturadas</span>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3B82F6' }}>{metrics.total_samples}</div>
        </div>
      </div>

      <button onClick={handleSimulateCall} disabled={loading} style={{ background: '#00F0FF', color: '#050811', border: 'none', padding: '10px 18px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }}>
        {loading ? 'Interceptando...' : 'Simular Petición L7 Interceptada'}
      </button>

      {logs.length > 0 && (
        <div style={{ background: '#050811', padding: '10px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>
          {logs.map((log, idx) => <div key={idx}>{log}</div>)}
        </div>
      )}
    </div>
  );
}
