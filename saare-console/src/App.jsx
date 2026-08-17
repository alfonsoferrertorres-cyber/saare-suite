import React, { useState, useEffect } from 'react';
import cabeceraImg from './public/CABECERA WEB.jfif';

const DEFAULT_BASE_SCENARIOS = [
  { id: 'saare-espana-lopd', title: 'España - LOPDGDD & AEPD', desc: 'Detección y bloqueo perimetral de DNI, NIE, IBAN, nóminas y fuga de PII.', licensed: true, badge: 'PRIVACIDAD ES' },
  { id: 'saare-l7-jailbreak', title: 'TOP L7: Jailbreak & Prompt Injection Guard', desc: 'Mitigación de ataques adversarios, modo DAN y anulación de directivas.', licensed: true, badge: 'CIBERSEGURIDAD' },
  { id: 'saare-forensic-factcheck', title: 'Fact-Checking Forense & Fake Disprover', desc: 'Trazabilidad y sellado criptográfico SHA-256 de consistencia documental e ISO 42001.', licensed: true, badge: 'TRAZABILIDAD' },
  { id: 'saare-token-costguard', title: 'Optimizador de Tokens & CostGuard', desc: 'Reducción de consumo de tokens (20-40%) y modo bypass para auditoría.', licensed: true, badge: 'FINOPS IT' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('library');
  const [events, setEvents] = useState([]);
  const [scenarios, setScenarios] = useState(DEFAULT_BASE_SCENARIOS);
  const [customRules, setCustomRules] = useState([]);
  const [selectedEv, setSelectedEv] = useState(null);
  const [scenarioToDisable, setScenarioToDisable] = useState(null);

  // Estados del modal de nueva regla personalizada
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPattern, setNewPattern] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const fetchData = async () => {
    try {
      const [rScen, rEv, rRules] = await Promise.all([
        fetch('https://saare-api.alfonsoferrertorres.workers.dev/api/v1/scenarios').catch(() => null),
        fetch('https://saare-api.alfonsoferrertorres.workers.dev/api/v1/events').catch(() => null),
        fetch('https://saare-api.alfonsoferrertorres.workers.dev/api/v1/custom-rules').catch(() => null)
      ]);

      if (rScen && rScen.ok) {
        const dScen = await rScen.json();
        if (Array.isArray(dScen) && dScen.length > 0) {
          setScenarios(dScen);
        }
      }
      if (rRules && rRules.ok) {
        const dRules = await rRules.json();
        if (Array.isArray(dRules)) setCustomRules(dRules);
      }
      if (rEv && rEv.ok) {
        const d = await rEv.json();
        const list = d.events || [];
        list.sort((a, b) => (b.timestampRaw || 0) - (a.timestampRaw || 0));
        setEvents(list);
      }
    } catch {}
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  const executeToggle = async (id) => {
    try {
      const res = await fetch('https://saare-api.alfonsoferrertorres.workers.dev/api/v1/scenarios/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const d = await res.json();
        setScenarios(d.scenarios);
      } else {
        setScenarios(prev => prev.map(s => s.id === id ? { ...s, licensed: !s.licensed } : s));
      }
    } catch (e) {
      setScenarios(prev => prev.map(s => s.id === id ? { ...s, licensed: !s.licensed } : s));
    }
  };

  const handleButtonClick = (scenario) => {
    if (scenario.licensed) {
      setScenarioToDisable(scenario);
    } else {
      executeToggle(scenario.id);
    }
  };

  const confirmDisable = () => {
    if (scenarioToDisable) {
      executeToggle(scenarioToDisable.id);
      setScenarioToDisable(null);
    }
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!newPattern.trim()) return;
    try {
      const res = await fetch('https://saare-api.alfonsoferrertorres.workers.dev/api/v1/custom-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern: newPattern, label: newLabel })
      });
      if (res.ok) {
        const d = await res.json();
        setCustomRules(d.rules);
        setNewPattern('');
        setNewLabel('');
        setShowAddModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      const res = await fetch(`https://saare-api.alfonsoferrertorres.workers.dev/api/v1/custom-rules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const d = await res.json();
        setCustomRules(d.rules);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeCount = scenarios.filter(s => s.licensed).length;
  const disabledCount = scenarios.length - activeCount;

  const fontStack = '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif';
  const monoFont = '"Consolas", "Courier New", monospace';

  return (
    <div style={{ minHeight: '100vh', background: '#94a3b8', fontFamily: fontStack, color: '#0f172a', paddingBottom: '40px', margin: 0 }}>
      
      {/* CABECERA */}
      <div style={{ width: '100%', background: '#64748b', overflow: 'hidden', borderBottom: '2px solid #475569' }}>
        <img src={cabeceraImg} alt="Cabecera SAARE" style={{ width: '100%', maxHeight: '190px', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.src = '/cabecera.jfif'; }} />
      </div>

      <main style={{ maxWidth: '1240px', margin: '22px auto 0 auto', padding: '0 20px' }}>
        
        {/* BANNER GRC */}
        <div style={{ background: '#ffffff', padding: '16px 24px', borderRadius: '8px', border: '1px solid #64748b', boxShadow: '0 4px 8px rgba(0,0,0,0.12)', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
              PANEL DE CONTROL GRC &amp; CUMPLIMIENTO CORPORATIVO IA V2.5
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
              ORGANIZACION: <strong style={{ color: '#0f172a' }}>ACME Corporation</strong> &nbsp;|&nbsp; 
              DIRECTIVAS BASE: <strong style={{ color: '#16a34a' }}>{activeCount} Activas</strong> &nbsp;|&nbsp; 
              <strong style={{ color: '#dc2626' }}>{disabledCount} Deshabilitadas</strong> &nbsp;|&nbsp; 
              REGLAS PERSONALIZADAS: <strong style={{ color: '#0284c7' }}>{customRules.length} Filtros</strong>
            </p>
          </div>
          <div style={{ background: '#f0fdf4', border: '1.5px solid #16a34a', color: '#15803d', padding: '6px 14px', borderRadius: '4px', fontWeight: 900, fontSize: '0.8rem', textTransform: 'uppercase' }}>
            MASTER PASS RUNTIME ACTIVO
          </div>
        </div>

        {/* NAVEGACIÓN PESTAÑAS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={() => setActiveTab('global')} style={{ padding: '10px 22px', borderRadius: '6px', border: activeTab === 'global' ? '1px solid #0369a1' : '1px solid #64748b', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', background: activeTab === 'global' ? '#0284c7' : '#ffffff', color: activeTab === 'global' ? '#ffffff' : '#334155', textTransform: 'uppercase' }}>
            Registro Global ({events.length})
          </button>
          <button onClick={() => setActiveTab('runlive')} style={{ padding: '10px 22px', borderRadius: '6px', border: activeTab === 'runlive' ? '1px solid #0369a1' : '1px solid #64748b', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', background: activeTab === 'runlive' ? '#0284c7' : '#ffffff', color: activeTab === 'runlive' ? '#ffffff' : '#334155', textTransform: 'uppercase' }}>
            S.A.A.R.E. (RunLive)
          </button>
          <button onClick={() => setActiveTab('library')} style={{ padding: '10px 22px', borderRadius: '6px', border: activeTab === 'library' ? '1px solid #0369a1' : '1px solid #64748b', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', background: activeTab === 'library' ? '#0284c7' : '#ffffff', color: activeTab === 'library' ? '#ffffff' : '#334155', textTransform: 'uppercase' }}>
            Configuración ({scenarios.length + customRules.length})
          </button>
        </div>

        {/* PESTAÑA: CONFIGURACIÓN */}
        {activeTab === 'library' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1. SECCIÓN CONFIGURADOR DE BLOQUEOS PERSONALIZADOS */}
            <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '8px', border: '1px solid #64748b', boxShadow: '0 4px 8px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', color: '#0f172a' }}>
                    Configurador de Sintaxis y Filtros Personalizados
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                    Define palabras clave, frases confidenciales o expresiones regulares (/regex/i) para bloqueo en tiempo real.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '5px',
                    fontWeight: 900,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    letterSpacing: '0.3px',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 4px rgba(2,132,199,0.3)'
                  }}
                >
                  + Añadir Bloqueo
                </button>
              </div>

              {customRules.length === 0 ? (
                <div style={{ padding: '14px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                  No hay filtros personalizados activos. Las 4 directivas base de cumplimiento legal se mantienen en ejecución.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {customRules.map(rule => (
                    <div key={rule.id} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderLeft: '4px solid #0284c7', borderRadius: '4px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ overflow: 'hidden', paddingRight: '8px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a', textTransform: 'uppercase' }}>{rule.label}</div>
                        <div style={{ fontFamily: monoFont, fontSize: '0.78rem', color: '#0284c7', marginTop: '2px', wordBreak: 'break-all' }}>{rule.pattern}</div>
                      </div>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. LOS 4 ESCENARIOS BASE DE CUMPLIMIENTO LEGAL (CON SUS BOTONES Y LÓGICA DE TOGGLE) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              {scenarios.map(sc => {
                const isEnabled = sc.licensed;
                return (
                  <div key={sc.id} style={{
                    background: '#ffffff',
                    border: `2px solid ${isEnabled ? '#16a34a' : '#dc2626'}`,
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.08)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '3px', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                        {sc.badge}
                      </span>
                      <span style={{
                        background: isEnabled ? '#dcfce7' : '#fee2e2',
                        color: isEnabled ? '#15803d' : '#dc2626',
                        border: `1px solid ${isEnabled ? '#16a34a' : '#dc2626'}`,
                        padding: '3px 8px',
                        borderRadius: '3px',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        textTransform: 'uppercase'
                      }}>
                        {isEnabled ? 'HABILITADA' : 'SUSPENDIDA'}
                      </span>
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase' }}>{sc.title}</h3>
                    <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#475569', minHeight: '38px', fontWeight: 500 }}>{sc.desc}</p>
                    <button
                      onClick={() => handleButtonClick(sc)}
                      style={{
                        width: '100%',
                        padding: '11px',
                        background: isEnabled ? '#16a34a' : '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 900,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {isEnabled ? 'DESACTIVAR DIRECTIVA' : 'ACTIVAR DIRECTIVA'}
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* PESTAÑA: REGISTRO GLOBAL */}
        {activeTab === 'global' && (
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #64748b', boxShadow: '0 6px 14px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase' }}>
                  HISTORIAL DE EVIDENCIAS EN AUDITORIA (TIEMPO REAL)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  Cadena de custodia inmutable sellada con SHA-256 e ISO 42001
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', background: '#f0fdf4', color: '#15803d', border: '1px solid #16a34a', padding: '4px 10px', borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase' }}>
                Sincronizacion en Vivo Activa
              </span>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
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
                  <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Esperando capturas forenses...</td></tr>
                ) : (
                  events.map((ev, i) => (
                    <tr key={ev.evidenceId || i} style={{ borderBottom: '1px solid #e2e8f0', background: i === 0 ? '#f0fdf4' : 'transparent' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 900, color: '#0284c7', fontFamily: monoFont }}>
                        {ev.evidenceId} {i === 0 && <span style={{ fontSize: '0.65rem', background: '#16a34a', color: '#fff', padding: '2px 5px', borderRadius: '2px', marginLeft: '4px' }}>NUEVO</span>}
                      </td>
                      <td style={{ padding: '12px 10px', color: '#475569', fontFamily: monoFont }}>{ev.timestamp || 'N/D'}</td>
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: '#1e293b', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        "{ev.promptSummary}"
                      </td>
                      <td style={{ padding: '12px 10px', color: '#334155', fontWeight: 600 }}>{ev.scenario}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '3px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', background: ev.verdict === 'RECHAZADO' ? '#fee2e2' : '#dcfce7', color: ev.verdict === 'RECHAZADO' ? '#dc2626' : '#15803d', border: ev.verdict === 'RECHAZADO' ? '1px solid #f87171' : '1px solid #86efac' }}>
                          {ev.verdict}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        <button onClick={() => setSelectedEv(ev)} style={{ background: '#ffffff', border: '1px solid #64748b', padding: '5px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase' }}>
                          Ver JSON
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PESTAÑA: RUNLIVE */}
        {activeTab === 'runlive' && (
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #64748b' }}>
            <span style={{ background: '#e0f2fe', color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>MONITOREO EN TIEMPO REAL</span>
            <h3 style={{ margin: '8px 0 16px 0', fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase' }}>TELEMETRIA EN VIVO (ULTIMO HECHO)</h3>
            {events.length > 0 ? (
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '20px' }}>
                <p><strong>ID EVIDENCIA:</strong> <span style={{ fontFamily: monoFont }}>{events[0].evidenceId}</span></p>
                <p><strong>HORA:</strong> <span style={{ fontFamily: monoFont }}>{events[0].timestamp}</span></p>
                <blockquote style={{ padding: '12px', background: '#fff', borderLeft: '4px solid #0284c7', fontWeight: 700 }}>"{events[0].promptSummary}"</blockquote>
                <p><strong>DICTAMEN:</strong> <span style={{ color: events[0].verdict === 'RECHAZADO' ? '#dc2626' : '#15803d', fontWeight: 900 }}>{events[0].verdict}</span></p>
                <p style={{ fontSize: '0.8rem', fontFamily: monoFont, color: '#64748b' }}>FIRMA: {events[0].signature}</p>
              </div>
            ) : <p style={{ color: '#64748b' }}>Esperando intercepciones...</p>}
          </div>
        )}

      </main>

      {/* MODAL CONFIGURADOR: AÑADIR BLOQUEO */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#ffffff', borderRadius: '8px', padding: '24px', maxWidth: '500px', width: '90%', border: '2px solid #0284c7', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase' }}>
              Configurar Nuevo Bloqueo Perimetral
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 16px 0' }}>
              Introduce la sintaxis o expresión regular que deseas interceptar en origen antes del envío.
            </p>
            <form onSubmit={handleAddRule}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Nombre / Etiqueta de la Regla:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Bloqueo Proyecto Titan / Confidencial"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Sintaxis o Patrón a Bloquear (Texto o /Regex/):
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: ProyectoTitan o /\bPROY-\d{4}\b/i"
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: monoFont, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', textTransform: 'uppercase' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: 900, fontSize: '0.8rem', cursor: 'pointer', textTransform: 'uppercase' }}
                >
                  Confirmar y Guardar Filtro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADVERTENCIA DESACTIVAR BASE */}
      {scenarioToDisable && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#ffffff', borderRadius: '8px', padding: '24px', maxWidth: '480px', width: '90%', border: '2px solid #dc2626' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 900, color: '#991b1b', textTransform: 'uppercase' }}>
              ADVERTENCIA DE SEGURIDAD CISO
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 14px 0', fontWeight: 600 }}>
              Está a punto de desactivar la directiva de cumplimiento para:
              <br />
              <strong style={{ color: '#0f172a', display: 'block', marginTop: '6px' }}>
                "{scenarioToDisable.title}"
              </strong>
            </p>
            <div style={{ background: '#fef2f2', borderLeft: '4px solid #dc2626', padding: '8px 12px', fontSize: '0.78rem', color: '#991b1b', marginBottom: '18px', fontWeight: 600 }}>
              Al suspender esta regla, los prompts dejarán de ser bloqueados preventivamente en el origen.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setScenarioToDisable(null)}
                style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', textTransform: 'uppercase' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDisable}
                style={{ padding: '8px 16px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: 900, fontSize: '0.8rem', cursor: 'pointer', textTransform: 'uppercase' }}
              >
                Confirmar y Desactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL JSON */}
      {selectedEv && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#ffffff', borderRadius: '8px', padding: '24px', maxWidth: '600px', width: '90%', border: '1px solid #475569' }}>
            <h4 style={{ margin: '0 0 12px 0', textTransform: 'uppercase' }}>Recibo Pericial: {selectedEv.evidenceId}</h4>
            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '16px', borderRadius: '4px', fontSize: '0.8rem', fontFamily: monoFont, maxHeight: '350px', overflow: 'auto' }}>
              {JSON.stringify(selectedEv, null, 2)}
            </pre>
            <div style={{ textAlign: 'right', marginTop: '12px' }}>
              <button onClick={() => setSelectedEv(null)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


