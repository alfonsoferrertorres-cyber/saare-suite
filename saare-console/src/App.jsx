import React, { useState, useEffect } from 'react';

export default function App() {
  const [tokenInput, setTokenInput] = useState('');
  const [sessionToken, setSessionToken] = useState(localStorage.getItem('saare_auth_token') || '');
  const [sessionUser, setSessionUser] = useState(localStorage.getItem('saare_auth_user') || '');
  const [activeTab, setActiveTab] = useState('global');
  const [events, setEvents] = useState([]);
  const [scenarios, setScenarios] = useState([
    { id: 'ES_CUMPLIMIENTO_ESPANA', title: 'España - LOPDGDD & AEPD', category: 'ENS-ALTO', licensed: true, desc: 'Anonimización en tiempo real de DNI, NIE, IBAN y nóminas en suelo español.' },
    { id: 'TOP_PROMPT_INJECTION', title: 'Jailbreak & Prompt Injection Guard', category: 'EU-AI-ACT', licensed: true, desc: 'Detección proactiva de inyecciones de código y bypass de reglas (DAN mode).' },
    { id: 'STAR_FACT_CHECKER', title: 'Fact-Checking Forense & Fake Disprover', category: 'ANALÍTICO', licensed: true, desc: 'Análisis de artefactos en capturas y desensamblaje de deepfakes.' },
    { id: 'STAR_TOKEN_OPTIMIZER', title: 'Optimizador de Tokens & CostGuard', category: 'ESTRELLA', licensed: true, desc: 'Reducción de coste computacional y desinfección de prompts redundantes.' }
  ]);

  const loadEvents = async () => {
    if (!sessionToken) return;
    try {
      const res = await fetch(`http://localhost:3001/api/v1/events?token=${encodeURIComponent(sessionToken)}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || data.logs || []);
      }
    } catch (e) {
      // Offline fallback si se navega sin el backend levantado
    }
  };

  useEffect(() => {
    if (sessionToken) {
      loadEvents();
      const interval = setInterval(loadEvents, 1500);
      return () => clearInterval(interval);
    }
  }, [sessionToken]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    const token = tokenInput.trim();
    const user = 'Alfonso Ferrer (Auditor SOC)';
    localStorage.setItem('saare_auth_token', token);
    localStorage.setItem('saare_auth_user', user);
    setSessionToken(token);
    setSessionUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('saare_auth_token');
    localStorage.removeItem('saare_auth_user');
    setSessionToken('');
    setSessionUser('');
    setEvents([]);
  };

  const toggleLicense = async (id) => {
    try {
      const res = await fetch('http://localhost:3001/api/toggle-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        setScenarios(data.scenarios);
      }
    } catch (e) {
      setScenarios(scenarios.map(s => s.id === id ? { ...s, licensed: !s.licensed } : s));
    }
  };

  // PANTALLA 1: GATEKEEPER LOGIN
  if (!sessionToken) {
    return (
      <div style={{ minHeight: '100vh', background: '#0b1120', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '36px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', textAlign: 'center' }}>
          <div style={{ background: '#f1f5f9', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '28px' }}>
            🛡️
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>SAARE OPERATION CENTER</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 24px 0' }}>Validación de Token de Acceso ISV / Auditor</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="text"
              placeholder="Introduce tu Token ISV"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', color: '#0f172a' }}
              required
            />
            <button
              type="submit"
              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              🔒 VALIDAR TOKEN Y ENTRAR
            </button>
          </form>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#94a3b8' }}>
            Token asignado: <code onClick={() => setTokenInput('SAARE-TOKEN-ENT-M57TOVV')} style={{ color: '#0284c7', background: '#f8fafc', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}>SAARE-TOKEN-ENT-M57TOVV</code>
          </div>
        </div>
      </div>
    );
  }

  // PANTALLA 2: CONSOLA OFICIAL
  const activeCount = scenarios.filter(s => s.licensed).length;
  const disabledCount = scenarios.length - activeCount;

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
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>SAARE OPERATION CENTER v2.5</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              ORGANIZACIÓN: <strong>ACME Corporation</strong> | SESIÓN: <strong style={{ color: '#0284c7' }}>{sessionUser}</strong> | TOKEN: <code>{sessionToken}</code>
              <span style={{ marginLeft: '12px', color: '#16a34a', fontWeight: 700 }}>● {activeCount} Habilitados</span>
              <span style={{ marginLeft: '6px', color: '#dc2626', fontWeight: 700 }}>| {disabledCount} Deshabilitados</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '6px 14px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800 }}>
              MASTER PASS RUNTIME ACTIVO ({activeCount} REGLAS)
            </span>
            <button onClick={handleLogout} style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
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

        {/* TAB 1: HISTORIAL DE EVIDENCIAS */}
        {activeTab === 'global' && (
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
              HISTORIAL DE EVIDENCIAS EN AUDITORÍA
            </h4>
            
            {events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                  🔒 Sesión vinculada al Token <strong style={{ color: '#0284c7' }}>{sessionToken}</strong>
                </p>
                <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                  Esperando intercepciones en tiempo real desde Gemini... Escribe un prompt sensible para auditarlo en vivo.
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>ID EVIDENCIA</th>
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
                      <td style={{ padding: '12px', color: '#1e293b', fontWeight: 600 }}>{ev.promptSummary || ev.prompt}</td>
                      <td style={{ padding: '12px', color: '#475569' }}>{ev.scenarioApplied || ev.scene}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '0.7rem', background: ev.verdict === 'RECHAZADO' ? '#fee2e2' : '#dcfce7', color: ev.verdict === 'RECHAZADO' ? '#b91c1c' : '#15803d' }}>
                          {ev.verdict}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                          PDF Sellado
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 2: BIBLIOTECA DE ESCENARIOS */}
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
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 700 }}>{s.title}</h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: '#64748b', minHeight: '38px' }}>{s.desc}</p>
                <button
                  onClick={() => toggleLicense(s.id)}
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
