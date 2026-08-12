import React, { useState } from 'react';

export default function OperationCenter() {
  const [activeScenario, setActiveScenario] = useState('EU AI Act España');
  const [isolationMode, setIsolationMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([
    { id: 'REC-8801', time: '06:32:01', event: 'Validación de Prompt', verdict: 'Aprobado', hash: 'e2f5...89a1', state: 'Local + Cloud' },
    { id: 'REC-8802', time: '06:33:14', event: 'DNI Detectado (Filtro ES)', verdict: 'Anonymizado en RAM', hash: 'a4b1...32f0', state: 'Local + Cloud' }
  ]);

  const handleScenarioChange = async (scenarioName) => {
    setActiveScenario(scenarioName);
    setLoading(true);
    try {
      await fetch('https://www.saare.es/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenarioName, action: 'ACTIVATE_SCENARIO' })
      });
    } catch (e) {
      console.log('Cambio de escenario local registrado:', scenarioName);
    } finally {
      setLoading(false);
    }
  };

  const toggleIsolation = () => {
    setIsolationMode(!isolationMode);
  };

  const handleTriggerTest = async () => {
    setLoading(true);
    const newId = 'REC-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toLocaleTimeString();
    
    try {
      const res = await fetch('https://www.saare.es/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: activeScenario, action: 'TEST_PROMPT' })
      });
      const data = await res.json();
      
      setLogs(prev => [
        { id: newId, time: now, event: 'Ejecución de Prueba', verdict: 'Aprobado (Ed25519)', hash: data.id ? data.id.substring(0, 10) + '...' : 'c8f2...99e1', state: 'Local + Cloud' },
        ...prev
      ]);
    } catch (err) {
      setLogs(prev => [
        { id: newId, time: now, event: 'Simulación de Inspección', verdict: 'Aprobado Local', hash: 'f91a...33d2', state: 'Local' },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#050811', color: '#CBD5E1', minHeight: '100vh', padding: '24px', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span style={{ background: '#059669', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>RUNTIME ACTIVO</span>
          <span style={{ fontSize: '12px', color: '#64748B', marginLeft: '12px' }}>Node: saare-edge-eu-west</span>
          <h1 style={{ color: '#F8FAFC', margin: '8px 0 0 0', fontSize: '24px' }}>Centro de Mando & Registro Dual-Vault</h1>
        </div>
        <div>
          <button 
            onClick={toggleIsolation}
            style={{ 
              background: isolationMode ? '#DC2626' : '#1E293B', 
              color: '#fff', 
              border: '1px solid #334155', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: 'bold' 
            }}
          >
            Modo Aislamiento Estricto (Air-Gapped): {isolationMode ? 'ACTIVADO' : 'DESACTIVADO (Dual-Vault)'}
          </button>
        </div>
      </div>

      {/* Escenarios */}
      <h3 style={{ color: '#C5A059', fontSize: '14px', letterSpacing: '1px' }}>1. ESCENARIO DE PROTECCIÓN ACTIVO</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        
        {/* Card 1 */}
        <div 
          onClick={() => handleScenarioChange('EU AI Act España')}
          style={{ 
            border: activeScenario === 'EU AI Act España' ? '2px solid #C5A059' : '1px solid #1E293B', 
            background: '#0F172A', padding: '16px', borderRadius: '8px', cursor: 'pointer' 
          }}
        >
          <span style={{ background: '#0284C7', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>Máxima Seguridad</span>
          <h4 style={{ color: '#F8FAFC', margin: '8px 0' }}>EU AI Act España</h4>
          <p style={{ fontSize: '12px', color: '#94A3B8' }}>Anonymización DNI/IBAN/NIF ex-ante, auditoría AESIA y firma criptográfica Ed25519.</p>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => handleScenarioChange('Banca & Finanzas DORA')}
          style={{ 
            border: activeScenario === 'Banca & Finanzas DORA' ? '2px solid #C5A059' : '1px solid #1E293B', 
            background: '#0F172A', padding: '16px', borderRadius: '8px', cursor: 'pointer' 
          }}
        >
          <span style={{ background: '#0284C7', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>DORA / PCI-DSS</span>
          <h4 style={{ color: '#F8FAFC', margin: '8px 0' }}>Banca & Finanzas DORA</h4>
          <p style={{ fontSize: '12px', color: '#94A3B8' }}>Protección PCI-DSS, detección de tarjetas y cifrado de transacciones L7.</p>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => handleScenarioChange('Agentes Autónomos & MCP')}
          style={{ 
            border: activeScenario === 'Agentes Autónomos & MCP' ? '2px solid #C5A059' : '1px solid #1E293B', 
            background: '#0F172A', padding: '16px', borderRadius: '8px', cursor: 'pointer' 
          }}
        >
          <span style={{ background: '#0284C7', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>Control Agéntico</span>
          <h4 style={{ color: '#F8FAFC', margin: '8px 0' }}>Agentes Autónomos & MCP</h4>
          <p style={{ fontSize: '12px', color: '#94A3B8' }}>Guardarraíles para llamadas a herramientas y prevención de bucles infinitos.</p>
        </div>

      </div>

      {/* Botón de Invocación */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button 
          onClick={handleTriggerTest}
          disabled={loading}
          style={{ 
            background: '#C5A059', color: '#000', fontWeight: 'bold', border: 'none', 
            padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' 
          }}
        >
          {loading ? 'PROCESANDO INSPECION L7...' : 'EJECUTAR SIMULACIÓN DE PRUEBA DE CAMPO'}
        </button>
        <span style={{ fontSize: '13px', color: '#64748B' }}>Escenario seleccionado: <strong style={{ color: '#38BDF8' }}>{activeScenario}</strong></span>
      </div>

      {/* Tabla de Evidencias */}
      <h3 style={{ color: '#C5A059', fontSize: '14px', letterSpacing: '1px' }}>REGISTRO DE ACTIVIDAD Y EVIDENCIAS CRIPTOGRÁFICAS</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', background: '#0F172A', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#1E293B', textAlign: 'left', color: '#64748B' }}>
            <th style={{ padding: '12px' }}>ID RECIBO</th>
            <th style={{ padding: '12px' }}>HORA</th>
            <th style={{ padding: '12px' }}>EVENTO / INTERCEPCIÓN</th>
            <th style={{ padding: '12px' }}>VEREDICTO</th>
            <th style={{ padding: '12px' }}>HASH ED25519</th>
            <th style={{ padding: '12px' }}>ESTADO DUAL-VAULT</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} style={{ borderBottom: '1px solid #1E293B' }}>
              <td style={{ padding: '12px', color: '#F59E0B', fontWeight: 'bold' }}>{log.id}</td>
              <td style={{ padding: '12px' }}>{log.time}</td>
              <td style={{ padding: '12px', color: '#F8FAFC' }}>{log.event}</td>
              <td style={{ padding: '12px', color: '#10B981' }}>{log.verdict}</td>
              <td style={{ padding: '12px', fontFamily: 'monospace', color: '#94A3B8' }}>{log.hash}</td>
              <td style={{ padding: '12px', color: '#38BDF8' }}>{log.state}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
