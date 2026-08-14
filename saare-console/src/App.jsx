import React, { useState, useEffect } from 'react';

export default function App() {
  const [user, setUser] = useState(localStorage.getItem('saare_user') || 'alfonsosb1@gmail.com');
  const [activeTab, setActiveTab] = useState('global');
  const [events, setEvents] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [selectedEv, setSelectedEv] = useState(null);

  const fetchData = async () => {
    try {
      const [rScen, rEv] = await Promise.all([
        fetch('http://localhost:3001/api/v1/scenarios').catch(() => null),
        fetch('http://localhost:3001/api/v1/events').catch(() => null)
      ]);
      if (rScen && rScen.ok) setScenarios(await rScen.json());
      if (rEv && rEv.ok) {
        const d = await rEv.json();
        const list = d.events || [];
        // ORDENACIÓN ESTRICTA: EL MÁS NUEVO SIEMPRE ARRIBA
        list.sort((a, b) => (b.timestampRaw || 0) - (a.timestampRaw || 0));
        setEvents(list);
      }
    } catch {}
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000); // Actualización en vivo cada 1 segundo
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async (id) => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/scenarios/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const d = await res.json();
        setScenarios(d.scenarios);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeCount = scenarios.filter(s => s.licensed).length;
  const disabledCount = scenarios.length - activeCount;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
      
      {/* CABECERA */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '36px' }}>🧠</div>
          <div style={{ borderLeft: '2px solid #cbd5e1', paddingLeft: '14px' }}>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#92400e' }}>Tecnología de IA</h1>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#b45309' }}>Segura y Certificada</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>👤 {user}</span>
          <button onClick={() => { localStorage.removeItem('saare_user'); setUser(''); }} style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1240px', margin: '24px auto', padding: '0 24px' }}>
        
        {/* BANNER ESTADO */}
        <div style={{ background: '#ffffff', padding: '18px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.35rem', fontWeight: 800 }}>SAARE OPERATION CENTER v2.5</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              ORGANIZACIÓN: <strong style={{ color: '#0f172a' }}>ACME Corporation</strong> | ESTADO TOKEN: <strong style={{ color: '#16a34a' }}>{activeCount} Habilitados</strong> | <strong style={{ color: '#dc2626' }}>{disabledCount} Deshabilitados</strong>
            </p>
          </div>
          <div style={{ background: '#dcfce7', border: '1px solid #16a34a', color: '#15803d', padding: '6px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '0.8rem' }}>
            ● MASTER PASS RUNTIME ACTIVO
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('global')}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', background: activeTab === 'global' ? '#0284c7' : '#ffffff', color: activeTab === 'global' ? '#ffffff' : '#64748b', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            📄 Registro Global ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('runlive')}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', background: activeTab === 'runlive' ? '#0284c7' : '#ffffff', color: activeTab === 'runlive' ? '#ffffff' : '#64748b', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            🛰️ S.A.A.R.E. (RunLive)
          </button>
          <button
            onClick={() => setActiveTab('library')}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', background: activeTab === 'library' ? '#0284c7' : '#ffffff', color: activeTab === 'library' ? '#ffffff' : '#64748b', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          >
            🗃️ Biblioteca de Escenas ({scenarios.length})
          </button>
        </div>

        {/* PESTAÑA 1: REGISTRO GLOBAL (EL MÁS RECIENTE ARRIBA) */}
        {activeTab === 'global' && (
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>HISTORIAL DE EVIDENCIAS EN AUDITORÍA (TIEMPO REAL)</h3>
              <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', border: '1px solid #16a34a', padding: '4px 10px', borderRadius: '6px', fontWeight: 800 }}>
                ● Sincronización en Vivo Activa
              </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 10px' }}>ID EVIDENCIA</th>
                  <th style={{ padding: '12px 10px' }}>HORA</th>
                  <th style={{ padding: '12px 10px' }}>PROMPT INTERCEPTADO</th>
                  <th style={{ padding: '12px 10px' }}>ESCENARIO APLICADO</th>
                  <th style={{ padding: '12px 10px' }}>DICTAMEN</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center' }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                      Esperando interacción de prompts en tiempo real...
                    </td>
                  </tr>
                ) : (
                  events.map((ev, i) => {
                    const isNewest = i === 0;
                    return (
                      <tr key={ev.evidenceId || i} style={{ borderBottom: '1px solid #f1f5f9', background: isNewest ? '#f0fdf4' : 'transparent', transition: 'background 0.3s' }}>
                        <td style={{ padding: '12px 10px', fontWeight: 800, color: '#0284c7' }}>
                          {ev.evidenceId} {isNewest && <span style={{ fontSize: '0.65rem', background: '#16a34a', color: '#fff', padding: '2px 4px', borderRadius: '3px', marginLeft: '4px' }}>NUEVO</span>}
                        </td>
                        <td style={{ padding: '12px 10px', color: '#64748b', fontSize: '0.8rem' }}>{ev.timestamp || 'N/D'}</td>
                        <td style={{ padding: '12px 10px', fontWeight: 600, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          "{ev.promptSummary}"
                        </td>
                        <td style={{ padding: '12px 10px', color: '#475569' }}>{ev.scenario}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, background: ev.verdict === 'RECHAZADO' ? '#fee2e2' : '#dcfce7', color: ev.verdict === 'RECHAZADO' ? '#dc2626' : '#15803d' }}>
                            {ev.verdict}
                          </span>
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedEv(ev)}
                            style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            🔍 Ver JSON
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* MODAL JSON */}
            {selectedEv && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', maxWidth: '600px', width: '90%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Recibo Forense: {selectedEv.evidenceId}</h4>
                    <button onClick={() => setSelectedEv(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                  </div>
                  <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '16px', borderRadius: '8px', fontSize: '0.8rem', overflowX: 'auto', maxHeight: '350px' }}>
                    {JSON.stringify(selectedEv, null, 2)}
                  </pre>
                  <div style={{ textAlign: 'right', marginTop: '14px' }}>
                    <button onClick={() => setSelectedEv(null)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 2: RUNLIVE */}
        {activeTab === 'runlive' && (
          <div style={{ background: '#ffffff', padding: '28px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <span style={{ background: '#e0f2fe', color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>MONITOREO EN TIEMPO REAL</span>
            <h3 style={{ margin: '8px 0 16px 0', fontSize: '1.3rem', fontWeight: 800 }}>TELEMETRÍA EN VIVO (ÚLTIMO HECHO INTERCEPTADO)</h3>
            {events.length > 0 ? (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                <p><strong>Evidencia:</strong> {events[0].evidenceId}</p>
                <p><strong>Hora:</strong> {events[0].timestamp}</p>
                <blockquote style={{ margin: '10px 0', padding: '10px', background: '#fff', borderLeft: '4px solid #0284c7' }}>
                  "{events[0].promptSummary}"
                </blockquote>
                <p><strong>Dictamen:</strong> <span style={{ color: events[0].verdict === 'RECHAZADO' ? '#dc2626' : '#15803d', fontWeight: 'bold' }}>{events[0].verdict}</span></p>
                <p style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#64748b' }}>Firma: {events[0].signature}</p>
              </div>
            ) : (
              <p style={{ color: '#64748b' }}>Esperando intercepciones...</p>
            )}
          </div>
        )}

        {/* PESTAÑA 3: BIBLIOTECA */}
        {activeTab === 'library' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {scenarios.map(sc => {
              const isEnabled = sc.licensed;
              return (
                <div key={sc.id} style={{ background: '#ffffff', border: `2px solid ${isEnabled ? '#16a34a' : '#ef4444'}`, borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}>
                      {sc.badge}
                    </span>
                    <span style={{ background: isEnabled ? '#dcfce7' : '#fee2e2', color: isEnabled ? '#15803d' : '#dc2626', border: `1px solid ${isEnabled ? '#16a34a' : '#ef4444'}`, padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {isEnabled ? '✓ LICENCIA HABILITADA' : '🔒 LICENCIA DESHABILITADA'}
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 800 }}>{sc.title}</h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748b', minHeight: '36px' }}>{sc.desc}</p>
                  <button
                    onClick={() => handleToggle(sc.id)}
                    style={{ width: '100%', padding: '10px', background: isEnabled ? '#16a34a' : '#ef4444', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    {isEnabled ? '⚡ CONMUTAR Y DESHABILITAR (➔ CAMBIAR A ROJO)' : '🔒 REACTIVAR LICENCIA (➔ CAMBIAR A VERDE)'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
