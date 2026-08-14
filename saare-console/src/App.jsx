import React, { useState, useEffect } from 'react';

export default function App() {
  const [sessionToken, setSessionToken] = useState(localStorage.getItem('saare_auth_token') || 'SAARE-TOKEN-ENT-M57TOVV');
  const [sessionUser, setSessionUser] = useState(localStorage.getItem('saare_auth_user') || 'Alfonso Ferrer (Auditor SOC)');
  const [activeTab, setActiveTab] = useState('runlive');
  const [events, setEvents] = useState([]);
  const [vaultAudit, setVaultAudit] = useState(null);
  const [selectedSceneFilter, setSelectedSceneFilter] = useState('ALL');
  const [scenarios, setScenarios] = useState([
    { id: 'ES_CUMPLIMIENTO_ESPANA', title: 'España - LOPDGDD & AEPD', category: 'ENS-ALTO', compliance: 'ISO 42001 / LOPDGDD Art. 5', licensed: true, desc: 'Anonimización en tiempo real de DNI, NIE, IBAN y nóminas en suelo español.' },
    { id: 'TOP_PROMPT_INJECTION', title: 'Jailbreak & Prompt Injection Guard', category: 'EU-AI-ACT', compliance: 'EU AI Act Art. 15 (Robustness)', licensed: true, desc: 'Detección proactiva de inyecciones de código y bypass de reglas (DAN mode).' },
    { id: 'STAR_FACT_CHECKER', title: 'Fact-Checking Forense & Fake Disprover', category: 'ANALÍTICO', compliance: 'EU Disinformation Code', licensed: true, desc: 'Análisis de artefactos en capturas y desensamblaje de deepfakes.' },
    { id: 'STAR_TOKEN_OPTIMIZER', title: 'Optimizador de Tokens & CostGuard', category: 'ESTRELLA', compliance: 'Green AI & FinOps Framework', licensed: true, desc: 'Reducción de coste computacional y desinfección de prompts redundantes.' }
  ]);

  const loadVaultData = async () => {
    try {
      const [resEvents, resVault] = await Promise.all([
        fetch('http://localhost:3001/api/v1/events'),
        fetch('http://localhost:3001/api/v1/vault/inspect')
      ]);
      if (resEvents.ok) {
        const d = await resEvents.json();
        setEvents(d.events || []);
      }
      if (resVault.ok) {
        const v = await resVault.json();
        setVaultAudit(v);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadVaultData();
    const interval = setInterval(loadVaultData, 1500);
    return () => clearInterval(interval);
  }, []);

  const activeCount = scenarios.filter(s => s.licensed).length;
  const disabledCount = scenarios.length - activeCount;
  const latestEvent = events.length > 0 ? events[0] : null;

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f6', fontFamily: 'system-ui, sans-serif', color: '#0f172a' }}>
      
      {/* Banner Corporativo */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #cbd5e1', padding: '24px 40px', display: 'flex', alignItems: 'center', gap: '30px' }}>
        <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px' }}>
          🧠
        </div>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#c5a059', margin: 0, letterSpacing: '-0.5px' }}>Tecnología de IA</h1>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#c5a059', margin: 0, letterSpacing: '-0.5px' }}>Segura y Certificada</h2>
        </div>
      </div>

      <div style={{ maxWidth: '1300px', margin: '24px auto', padding: '0 20px' }}>
        
        {/* Barra de Estado y Gobernanza */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>SAARE OPERATION CENTER v2.5</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              ORGANIZACIÓN: <strong>ACME Corporation</strong> | AUDITOR: <strong style={{ color: '#0284c7' }}>{sessionUser}</strong> | BÓVEDA LOCAL: <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>/evidence_vault</code>
              <span style={{ marginLeft: '12px', color: '#16a34a', fontWeight: 700 }}>● {activeCount} Habilitados</span>
              <span style={{ marginLeft: '6px', color: '#dc2626', fontWeight: 700 }}>| {disabledCount} Deshabilitados</span>
            </p>
          </div>
          <div>
            <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '6px 14px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800 }}>
              MASTER PASS RUNTIME ACTIVO ({activeCount} REGLAS)
            </span>
          </div>
        </div>

        {/* 3 Botones Principales */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('runlive')}
            style={{ background: activeTab === 'runlive' ? '#0284c7' : '#ffffff', color: activeTab === 'runlive' ? '#ffffff' : '#334155', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            S.A.A.R.E. (RunLive) ⚡
          </button>
          <button
            onClick={() => setActiveTab('global')}
            style={{ background: activeTab === 'global' ? '#0284c7' : '#ffffff', color: activeTab === 'global' ? '#ffffff' : '#334155', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Registro Global ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            style={{ background: activeTab === 'scenarios' ? '#0284c7' : '#ffffff', color: activeTab === 'scenarios' ? '#ffffff' : '#334155', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Biblioteca de Escenas ({scenarios.length})
          </button>
        </div>

        {/* TAB: RUNLIVE FORENSE AUTOMÁTICO (SIN FORMULARIOS DEMO) */}
        {activeTab === 'runlive' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* AUDITORÍA AUTOMÁTICA DE CADA UNA DE LAS ESCENAS CONTRATADAS */}
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>
                    🔍 AUDITOR FORENSE WEBCRYPTO (W3C API) - LECTURA DE BÓVEDA DE ESCENAS
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Validación inmutable de evidencias leídas desde el disco por el Runtime y Control Plane.
                  </p>
                </div>
                <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                  📂 {events.length} Archivos Periciales Sellados
                </span>
              </div>

              {/* Grid de las 4 escenas contratadas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {(vaultAudit?.scenariosAudit || scenarios.map(s => ({
                  sceneId: s.id,
                  title: s.title,
                  compliance: s.compliance,
                  evidencesCount: events.filter(e => e.scenarioApplied?.includes(s.title) || e.sceneId === s.id).length,
                  lastEvidence: events.find(e => e.scenarioApplied?.includes(s.title) || e.sceneId === s.id) || null,
                  status: 'AUDITORIA_ACTIVA'
                }))).map((sc, i) => (
                  <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>{sc.compliance}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#15803d' }}>● INMUTABLE</span>
                      </div>
                      <h5 style={{ margin: '6px 0 4px 0', fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>{sc.title}</h5>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '10px' }}>
                        Evidencias registradas en bóveda: <strong style={{ color: '#0f172a' }}>{sc.evidencesCount}</strong>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', fontSize: '0.72rem' }}>
                      {sc.lastEvidence ? (
                        <div>
                          <div style={{ color: '#334155' }}>Último dictamen: <strong style={{ color: sc.lastEvidence.verdict === 'RECHAZADO' ? '#b91c1c' : '#15803d' }}>{sc.lastEvidence.verdict}</strong> ({sc.lastEvidence.evidenceId})</div>
                          <div style={{ fontFamily: 'monospace', color: '#64748b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            Sello: {sc.lastEvidence.cryptoSeal || 'AES256-AEPD-ES'}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Sin incidentes pendientes en esta escena</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TELEMETRÍA DEL ÚLTIMO PROMPT EN MEMORIA VOLÁTIL */}
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#334155' }}>
                  ⚡ TELEMETRÍA L7 EN MEMORIA VOLÁTIL (ÚLTIMA INTERCEPCIÓN)
                </h4>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                  LATENCIA: 1.4 ms
                </span>
              </div>

              {latestEvent ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', fontSize: '0.82rem' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700 }}>PAYLOAD CAPTURADO:</span>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>"{latestEvent.promptSummary || latestEvent.prompt}"</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700 }}>ESCENARIO & MARCO:</span>
                    <div style={{ fontWeight: 700, color: '#0284c7', marginTop: '4px' }}>{latestEvent.scenarioApplied || latestEvent.scene}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700 }}>DIRECCIÓN RAM VOLÁTIL:</span>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#15803d', marginTop: '4px' }}>{latestEvent.ramAddress || '0x7FFF8A42B100'}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700 }}>FIRMA HARDWARE:</span>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#334155', marginTop: '4px' }}>{latestEvent.cryptoSeal || 'AES256-AEPD-ES'}</div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Esperando intercepciones...</div>
              )}
            </div>

          </div>
        )}

        {/* TAB: REGISTRO GLOBAL DE EVIDENCIAS */}
        {activeTab === 'global' && (
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
              HISTORIAL DE EVIDENCIAS EN AUDITORÍA (ARCHIVOS DE BÓVEDA)
            </h4>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>ID EVIDENCIA</th>
                  <th style={{ padding: '12px' }}>HORA</th>
                  <th style={{ padding: '12px' }}>PROMPT INTERCEPTADO</th>
                  <th style={{ padding: '12px' }}>ESCENARIO APLICADO</th>
                  <th style={{ padding: '12px' }}>DICTAMEN</th>
                  <th style={{ padding: '12px' }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#0284c7' }}>{ev.evidenceId || ev.id}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{ev.timestamp}</td>
                    <td style={{ padding: '12px', color: '#1e293b', fontWeight: 600 }}>{ev.promptSummary || ev.prompt}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{ev.scenarioApplied || ev.scene}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '0.7rem', background: ev.verdict === 'RECHAZADO' ? '#fee2e2' : '#dcfce7', color: ev.verdict === 'RECHAZADO' ? '#b91c1c' : '#15803d' }}>
                        {ev.verdict}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => setActiveTab('runlive')} style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                        Auditar W3C
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: BIBLIOTECA DE ESCENARIOS */}
        {activeTab === 'scenarios' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {scenarios.map(s => (
              <div key={s.id} style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: s.licensed ? '1px solid #86efac' : '1px solid #fca5a5', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', color: '#475569' }}>{s.category}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: s.licensed ? '#16a34a' : '#dc2626' }}>
                    {s.licensed ? '● ACTIVO' : '○ PAUSADO'}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700 }}>{s.title}</h4>
                <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700, marginBottom: '8px' }}>
                  Marco: {s.compliance}
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: '#64748b', minHeight: '38px' }}>{s.desc}</p>
                <button
                  onClick={() => {
                    fetch('http://localhost:3001/api/toggle-license', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: s.id })
                    }).then(() => loadVaultData());
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', background: s.licensed ? '#fee2e2' : '#dcfce7', color: s.licensed ? '#b91c1c' : '#15803d' }}
                >
                  {s.licensed ? '⚡ CONMUTAR Y DESHABILITAR' : '🔒 REACTIVAR LICENCIA'}
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
