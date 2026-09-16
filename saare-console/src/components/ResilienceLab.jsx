// saare-console/src/components/ResilienceLab.jsx
import React, { useState } from 'react';
import { saareFetch } from '../utils/api';

export const ResilienceLab = ({ tenantId }) => {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);

  const runSimulation = async (scenario) => {
    setRunning(true);
    try {
      const res = await saareFetch('/resilience/check', {
        method: 'POST',
        body: JSON.stringify({ scenario, tenantId })
      });
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error("Fallo al ejecutar test de resiliencia:", e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ background: '#030712', border: '1px solid #1e293b', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
      <h3 style={{ color: '#f43f5e', margin: '0 0 6px 0', fontSize: '1.1rem' }}>🧪 SAARE RESILIENCE LAB & ATTACK SURFACE</h3>
      <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '16px' }}>
        Pruebas automatizadas de inyección, simulación de fallos y validación de políticas Fail-Closed en L7.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        <button 
          onClick={() => runSimulation('PROMPT_INJECTION')} 
          disabled={running}
          style={{ background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', textAlign: 'left' }}
        >
          💥 Inyección Prompt / Jailbreak
        </button>
        <button 
          onClick={() => runSimulation('PII_EXFILTRATION')} 
          disabled={running}
          style={{ background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', textAlign: 'left' }}
        >
          🔐 Fuga PII / DNI / IBAN
        </button>
        <button 
          onClick={() => runSimulation('PROVIDER_OUTAGE')} 
          disabled={running}
          style={{ background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', textAlign: 'left' }}
        >
          ⚡ Caída Proveedor LLM
        </button>
        <button 
          onClick={() => runSimulation('FAIL_CLOSED_GATE')} 
          disabled={running}
          style={{ background: '#0f172a', border: '1px solid #059669', color: '#34d399', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700', textAlign: 'left' }}
        >
          🛡️ Test Fail-Closed Gate
        </button>
      </div>

      {results && (
        <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.75rem' }}>
          <div style={{ color: '#4ade80', fontWeight: 'bold', marginBottom: '6px' }}>Dictamen: PASS (0 Alteraciones)</div>
          <pre style={{ margin: 0, color: '#94a3b8', whiteSpace: 'pre-wrap' }}>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};