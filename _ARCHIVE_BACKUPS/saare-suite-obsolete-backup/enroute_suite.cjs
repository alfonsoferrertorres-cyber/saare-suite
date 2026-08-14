const fs = require('fs');
const path = require('path');

const jsxContent = `import React, { useState, useEffect } from 'react';

export default function App() {
  const [scenarios, setScenarios] = useState([]);
  const [tenantInfo, setTenantInfo] = useState({
    tenantId: 'ACME-CORP-ES-2026',
    plan: 'Enterprise Sovereign',
    activeCount: 0
  });

  const fetchSuiteState = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/scenarios');
      const data = await res.json();
      if (data.scenarios) {
        setScenarios(data.scenarios);
        const active = data.scenarios.filter(s => s.licensed).length;
        setTenantInfo(prev => ({ ...prev, activeCount: active }));
      }
    } catch (e) {
      console.log('Error conectando Suite con Control Plane');
    }
  };

  useEffect(() => {
    fetchSuiteState();
  }, []);

  const handleSubscribeInSuite = async (scenarioId) => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/scenarios/toggle-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId })
      });
      const data = await res.json();
      if (data.status === 'UPDATED') {
        fetchSuiteState(); // Re-sincronizar con el Control Plane
      }
    } catch (e) {
      alert('Error de conexión con el Control Plane (:3001)');
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', padding: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* CABECERA TIENDA B2B */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#38bdf8' }}>🏪 S.A.A.R.E. MARKETPLACE SUITE</h1>
            <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
              Catálogo Comercial B2B | Conectado con Control Plane (:3001)
            </p>
          </div>
          <div style={{ background: '#1e293b', border: '1px solid #0284c7', padding: '12px 20px', borderRadius: '10px', textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', display: 'block' }}>LICENCIAS ACTIVAS EN TENANT</span>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>{tenantInfo.activeCount} de {scenarios.length} Suscritos</span>
          </div>
        </div>

        {/* CATÁLOGO ENRUTADO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          {scenarios.map(sc => (
            <div key={sc.id} style={{ background: '#1e293b', border: sc.licensed ? '1px solid #16a34a' : '1px solid #334155', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ background: '#0284c7', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>{sc.badge}</span>
                <span style={{ color: sc.licensed ? '#4ade80' : '#f87171', fontWeight: 'bold', fontSize: '12px' }}>
                  {sc.licensed ? '✓ LICENCIA SUSCRITA' : '🔒 SIN SUSCRIPCIÓN'}
                </span>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#ffffff' }}>{sc.title}</h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>{sc.desc}</p>
              
              <button onClick={() => handleSubscribeInSuite(sc.id)} style={{ 
                background: sc.licensed ? '#dc2626' : '#16a34a', 
                color: '#ffffff', 
                border: 'none', 
                padding: '12px', 
                width: '100%', 
                borderRadius: '8px', 
                fontWeight: 'bold', 
                cursor: 'pointer',
                fontSize: '13px'
              }}>
                {sc.licensed ? '🗑️ CANCELAR SUSCRIPCIÓN EN RUNTIME' : '🛒 CONTRATAR LICENCIA Y DESPLEGAR EN CONTROL PLANE'}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'src', 'App.jsx'), jsxContent, 'utf8');
console.log('=== SAARE-SUITE ENRUTADO DIRECTAMENTE CON EL CONTROL PLANE ===');
