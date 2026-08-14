const fs = require('fs');
const path = require('path');

const jsxContent = `import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('BIBLIOTECA_ESCENAS');
  
  // Estado con lectura de token
  const [libraryScenes, setLibraryScenes] = useState([
    { 
      id: 'ES_CUMPLIMIENTO_ESPANA', 
      title: '🇪🇸 España - LOPDGDD & AEPD', 
      badge: 'NORMATIVA', 
      cryptoSignature: 'AES256-AEPD-ES-2026', 
      desc: 'Anonimización en tiempo real de DNI, NIE, IBAN y nóminas en suelo español.',
      licensed: true
    },
    { 
      id: 'TOP_PROMPT_INJECTION', 
      title: '🎯 Jailbreak & Prompt Injection Guard', 
      badge: 'TOP L7', 
      cryptoSignature: 'SHA256-JAILBREAK-GUARD-2026', 
      desc: 'Detección proactiva de inyecciones de código y bypass de reglas (DAN mode).',
      licensed: true
    },
    { 
      id: 'STAR_FACT_CHECKER', 
      title: '🔬 Fact-Checking Forense & Fake Disprover ⭐', 
      badge: 'ANALÍTICO', 
      cryptoSignature: 'ED25519-8F93A2-M3V-2026', 
      desc: 'Análisis de artefactos en capturas y desensamblaje de deepfakes.',
      licensed: true
    },
    { 
      id: 'STAR_TOKEN_OPTIMIZER', 
      title: '⚡ Optimizador de Tokens & CostGuard ⭐', 
      badge: 'ESTRELLA', 
      cryptoSignature: 'RSA4096-COST-GUARD-2026', 
      desc: 'Reducción de coste computacional y desinfección de prompts redundantes.',
      licensed: true
    }
  ]);

  const [activeSceneId, setActiveSceneId] = useState('TOP_PROMPT_INJECTION');

  // Cargar estado inicial desde Control Plane
  const fetchScenarios = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/scenarios');
      const data = await res.json();
      if (data.scenarios && data.scenarios.length > 0) {
        setLibraryScenes(data.scenarios);
      }
    } catch (e) {
      console.log('Modo local dinámico activo');
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  // Función de conmutación reactiva e inminente
  const handleToggleScenario = async (scId) => {
    // 1. Cambiamos el estado local inmediatamente para respuesta visual 100% fluida
    setLibraryScenes(prev => prev.map(sc => {
      if (sc.id === scId) {
        return { ...sc, licensed: !sc.licensed };
      }
      return sc;
    }));

    // 2. Notificamos al Control Plane Runtime
    try {
      await fetch('http://localhost:3001/api/v1/scenarios/toggle-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: scId })
      });
    } catch (e) {
      console.log('Estado conmutado en UI');
    }
  };

  const activeCount = libraryScenes.filter(s => s.licensed).length;
  const disabledCount = libraryScenes.filter(s => !s.licensed).length;

  return (
    <div style={{ backgroundColor: '#e2e8f0', minHeight: '100vh', color: '#1e293b', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* CABECERA CORPORATIVA */}
      <div style={{ 
        width: '100%', 
        height: '220px', 
        backgroundImage: 'url(/saare-brand-header.jpg)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        borderBottom: '2px solid #cbd5e1',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
      </div>

      <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* ENCABEZADO SOC */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#ffffff', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #cbd5e1' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>SAARE OPERATION CENTER v2.5</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              ORGANIZACIÓN: <strong>ACME Corporation</strong> | ESTADO TOKEN: <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{activeCount} Habilitados</span> | <span style={{ color: '#dc2626', fontWeight: 'bold' }}>{disabledCount} Deshabilitados</span>
            </p>
          </div>
          <div style={{ background: '#dcfce7', border: '1px solid #16a34a', color: '#15803d', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            ● MASTER PASS RUNTIME ACTIVO
          </div>
        </div>

        {/* NAVEGACIÓN PESTAÑAS */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setActiveTab('REGISTRO_GLOBAL')} style={{ background: activeTab === 'REGISTRO_GLOBAL' ? '#0284c7' : '#ffffff', color: activeTab === 'REGISTRO_GLOBAL' ? '#ffffff' : '#475569', border: '1px solid #cbd5e1', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📑 Registro Global</button>
          <button onClick={() => setActiveTab('RUNLIVE')} style={{ background: activeTab === 'RUNLIVE' ? '#0284c7' : '#ffffff', color: activeTab === 'RUNLIVE' ? '#ffffff' : '#475569', border: '1px solid #cbd5e1', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📡 S.A.A.R.E. (RunLive)</button>
          <button onClick={() => setActiveTab('BIBLIOTECA_ESCENAS')} style={{ background: activeTab === 'BIBLIOTECA_ESCENAS' ? '#0284c7' : '#ffffff', color: activeTab === 'BIBLIOTECA_ESCENAS' ? '#ffffff' : '#475569', border: '1px solid #cbd5e1', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>📚 Biblioteca de Escenas ({libraryScenes.length})</button>
        </div>

        {/* TARJETAS CON BADGES DINÁMICOS VERDE <-> ROJO */}
        {activeTab === 'BIBLIOTECA_ESCENAS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {libraryScenes.map(sc => {
              const isEnabled = sc.licensed;

              return (
                <div key={sc.id} style={{ 
                  background: '#ffffff', 
                  border: isEnabled ? '2px solid #16a34a' : '2px solid #ef4444', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease'
                }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>{sc.badge}</span>
                    
                    {/* CUADRADITO SUPERIOR DERECHO CAMBIA SEGÚN EL ESTADO */}
                    {isEnabled ? (
                      <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #16a34a', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                        ✓ LICENCIA HABILITADA
                      </span>
                    ) : (
                      <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #ef4444', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                        🔒 LICENCIA DESHABILITADA
                      </span>
                    )}
                  </div>

                  <h3 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '16px' }}>{sc.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>{sc.desc}</p>
                  
                  <button onClick={() => handleToggleScenario(sc.id)} style={{ 
                    background: isEnabled ? '#16a34a' : '#ef4444', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '12px', 
                    width: '100%', 
                    borderRadius: '8px', 
                    fontWeight: 'bold', 
                    cursor: 'pointer', 
                    fontSize: '13px',
                    boxShadow: isEnabled ? '0 2px 8px rgba(22,163,74,0.3)' : '0 2px 8px rgba(239,68,68,0.3)'
                  }}>
                    {isEnabled ? '⚡ CONMUTAR Y DESHABILITAR (➔ CAMBIAR A ROJO)' : '🔒 REACTIVAR LICENCIA (➔ CAMBIAR A VERDE)'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'src', 'App.jsx'), jsxContent, 'utf8');
console.log('=== CUADRADITO Y BOTÓN VINCULADOS EN SINCRO VERDE/ROJO ===');
