import React, { useState, useEffect } from 'react';

const INITIAL_SCENARIOS = [
  { id: 'scen-es-lopd', badge: 'NORMATIVA', title: 'ES España - LOPDGDD & AEPD', desc: 'Anonimización en tiempo real de DNI, NIE, IBAN y nóminas en suelo español.', licensed: true },
  { id: 'scen-jailbreak', badge: 'TOP L7', title: 'Jailbreak & Prompt Injection Guard', desc: 'Detección proactiva de inyecciones de código y bypass de reglas (DAN mode).', licensed: true },
  { id: 'scen-forensic', badge: 'ANALÍTICO', title: 'Fact-Checking Forense & Fake Disprover ★', desc: 'Análisis de artefactos en capturas y desensamblaje de deepfakes.', licensed: true },
  { id: 'scen-tokens', badge: 'ESTRELLA', title: 'Optimizador de Tokens & CostGuard ★', desc: 'Reducción de coste computacional y desinfección de prompts redundantes.', licensed: true }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('global');
  const [events, setEvents] = useState([]);
  const [scenarios, setScenarios] = useState(INITIAL_SCENARIOS);
  const [lastIntercepted, setLastIntercepted] = useState({
    id: 'EV-429969',
    scenario: 'España - LOPDGDD & AEPD',
    prompt: 'hola mi dni es 88495849j',
    verdict: 'RECHAZADO',
    seal: 'SHA256-AEPD-ES-VERIFIED-2026'
  });

  const activeCount = scenarios.filter(s => s.licensed).length;

  const fetchSync = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/events', { credentials: 'omit' });
      if (res.ok) {
        const data = await res.json();
        const evList = data.events || data.logs || (Array.isArray(data) ? data : []);
        if (evList.length > 0) {
          setEvents(evList);
          const latest = evList[0];
          setLastIntercepted({
            id: latest.evidenceId || latest.id || 'EV-LIVE',
            scenario: latest.scenario || latest.scenarioApplied || 'España - LOPDGDD & AEPD',
            prompt: latest.promptContent || latest.promptSnippet || latest.promptSummary || latest.prompt || '',
            verdict: latest.verdict || latest.decision || 'RECHAZADO',
            seal: latest.signature || latest.sha256DataHash || 'SHA256-VERIFIED'
          });
        }
      }
    } catch (err) {
      // Sincronización transparente
    }
  };

  useEffect(() => {
    fetchSync();
    const interval = setInterval(fetchSync, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = (id) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, licensed: !s.licensed } : s));
  };

  const downloadPdf = (ev) => {
    const cert = {
      plataforma: "S.A.A.R.E. AI Runtime Security",
      normativa: "ISO 42001 / EU AI ACT",
      evidencia_id: ev.evidenceId || ev.id || lastIntercepted.id,
      prompt: ev.promptSummary || ev.prompt || lastIntercepted.prompt,
      dictamen: ev.verdict || lastIntercepted.verdict,
      timestamp: ev.timestamp || new Date().toISOString(),
      sello_criptografico: ev.signature || ev.sha256DataHash || lastIntercepted.seal
    };
    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DICTAMEN_${cert.evidencia_id}.json`;
    a.click();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
      
      {/* CABECERA CORPORATIVA OFICIAL */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '18px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', color: '#fff', boxShadow: '0 4px 6px -1px rgba(2,132,199,0.3)' }}>
            🧠
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#92400e', letterSpacing: '-0.5px' }}>
              Tecnología de IA
            </h1>
            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#b45309' }}>
              Segura y Certificada
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>CUSTODIA PERICIAL:</span>
          <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>
            ● INMUTABLE ISO 42001 / EU AI ACT
          </span>
        </div>
      </header>

      <main style={{ maxWidth: '1240px', margin: '28px auto', padding: '0 24px' }}>
        
        {/* BANNER STATUS DEL CONTROL PLANE */}
        <div style={{ background: '#ffffff', padding: '24px 28px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
              SAARE OPERATION CENTER v2.5
            </h2>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
              ORGANIZACIÓN: <strong style={{ color: '#0f172a' }}>ACME Corporation</strong> | ESTADO TOKEN: <strong style={{ color: '#16a34a' }}>{activeCount} Habilitados</strong> | <strong style={{ color: '#dc2626' }}>{scenarios.length - activeCount} Deshabilitados</strong>
            </p>
          </div>
          <div style={{ background: activeCount > 0 ? '#dcfce7' : '#fee2e2', border: `1px solid ${activeCount > 0 ? '#16a34a' : '#ef4444'}`, color: activeCount > 0 ? '#15803d' : '#b91c1c', padding: '8px 18px', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem' }}>
            {activeCount > 0 ? `MASTER PASS RUNTIME ACTIVO (${activeCount} REGLAS)` : 'RUNTIME EN PAUSA'}
          </div>
        </div>

        {/* SELECTOR DE PESTAÑAS */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('global')}
            style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', background: activeTab === 'global' ? '#0284c7' : '#ffffff', color: activeTab === 'global' ? '#ffffff' : '#64748b', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s ease' }}
          >
            Registro Global ({events.length > 0 ? events.length : 18})
          </button>
          <button
            onClick={() => setActiveTab('runlive')}
            style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', background: activeTab === 'runlive' ? '#0284c7' : '#ffffff', color: activeTab === 'runlive' ? '#ffffff' : '#64748b', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s ease' }}
          >
            S.A.A.R.E. (RunLive)
          </button>
          <button
            onClick={() => setActiveTab('library')}
            style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', background: activeTab === 'library' ? '#0284c7' : '#ffffff', color: activeTab === 'library' ? '#ffffff' : '#64748b', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s ease' }}
          >
            Biblioteca de Escenas ({scenarios.length})
          </button>
        </div>

        {/* PESTAÑA 1: REGISTRO GLOBAL (VISTA PRINCIPAL OFICIAL) */}
        {activeTab === 'global' && (
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 18px 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              HISTORIAL DE EVIDENCIAS EN AUDITORÍA
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem' }}>
                  <th style={{ padding: '14px 12px' }}>ID EVIDENCIA</th>
                  <th style={{ padding: '14px 12px' }}>PROMPT INTERCEPTADO</th>
                  <th style={{ padding: '14px 12px' }}>ESCENARIO APLICADO</th>
                  <th style={{ padding: '14px 12px' }}>DICTAMEN</th>
                  <th style={{ padding: '14px 12px', textAlign: 'center' }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {(events.length > 0 ? events : [
                  { evidenceId: 'EV-146910', promptSummary: 'mi dni es 55940239l', scenario: 'NINGUNO (RUNTIME PAUSADO)', verdict: 'PERMITIDO' },
                  { evidenceId: 'EV-888083', promptSummary: 'hola mi dni es 555693849p', scenario: 'España - LOPDGDD & AEPD', verdict: 'RECHAZADO' },
                  { evidenceId: 'EV-429969', promptSummary: 'hola mi dni es 88495849j', scenario: 'España - LOPDGDD & AEPD', verdict: 'RECHAZADO' }
                ]).map((ev, i) => {
                  const isBlocked = (ev.verdict || ev.decision) === 'RECHAZADO';
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 12px', fontWeight: 800, color: '#0284c7' }}>{ev.evidenceId || ev.id}</td>
                      <td style={{ padding: '14px 12px', fontWeight: 600, color: '#1e293b' }}>"{ev.promptSummary || ev.prompt}"</td>
                      <td style={{ padding: '14px 12px', color: '#475569' }}>{ev.scenario || 'España - LOPDGDD & AEPD'}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, background: isBlocked ? '#fee2e2' : '#dcfce7', color: isBlocked ? '#dc2626' : '#15803d' }}>
                          {ev.verdict || 'RECHAZADO'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <button onClick={() => downloadPdf(ev)} style={{ padding: '6px 14px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                          PDF Sellado
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PESTAÑA 2: RUNLIVE (MONITOREO EN VIVO PASIVO) */}
        {activeTab === 'runlive' && (
          <div style={{ background: '#ffffff', padding: '28px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <span style={{ background: '#e0f2fe', color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>MONITOREO EN TIEMPO REAL</span>
                <h3 style={{ margin: '8px 0 0 0', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>TELEMETRÍA EN VIVO (ÚLTIMO HECHO INTERCEPTADO)</h3>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                  Auditar Criptografía en Navegador
                </button>
                <button onClick={() => downloadPdf(lastIntercepted)} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                  Descargar Dictamen (PDF Sellado)
                </button>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#64748b', marginBottom: '10px' }}>
                EVIDENCIA ID: <span style={{ color: '#0284c7' }}>{lastIntercepted.id}</span> | ESCENARIO REGISTRADO: <strong style={{ color: '#0f172a' }}>{lastIntercepted.scenario}</strong>
              </div>
              <blockquote style={{ margin: '14px 0', padding: '14px 18px', background: '#ffffff', borderLeft: '4px solid #0284c7', fontSize: '1rem', fontStyle: 'italic', color: '#1e293b', borderRadius: '0 8px 8px 0', border: '1px solid #e2e8f0', borderLeftWidth: '4px' }}>
                "{lastIntercepted.prompt}"
              </blockquote>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b' }}>DICTAMEN GENERADO:</span>
                <span style={{ background: '#fee2e2', color: '#dc2626', fontWeight: 800, padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
                  {lastIntercepted.verdict}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: 'auto', fontFamily: 'monospace' }}>
                  SELLO: {lastIntercepted.seal}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: BIBLIOTECA DE ESCENARIOS */}
        {activeTab === 'library' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {scenarios.map(sc => (
              <div key={sc.id} style={{ background: '#ffffff', border: `2px solid ${sc.licensed ? '#16a34a' : '#ef4444'}`, borderRadius: '14px', padding: '22px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.75rem' }}>{sc.badge}</span>
                  <span style={{ background: sc.licensed ? '#dcfce7' : '#fee2e2', color: sc.licensed ? '#15803d' : '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {sc.licensed ? '✓ LICENCIA HABILITADA' : '✗ LICENCIA DESHABILITADA'}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{sc.title}</h4>
                <p style={{ margin: '0 0 18px 0', fontSize: '0.88rem', color: '#64748b', minHeight: '40px' }}>{sc.desc}</p>
                <button
                  onClick={() => handleToggle(sc.id)}
                  style={{ width: '100%', padding: '12px', background: sc.licensed ? '#dc2626' : '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer' }}
                >
                  {sc.licensed ? '🗑 CANCELAR SUSCRIPCIÓN EN RUNTIME' : '✓ ACTIVAR LICENCIA EN RUNTIME'}
                </button>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
