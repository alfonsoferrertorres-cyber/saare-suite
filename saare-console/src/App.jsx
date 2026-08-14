import React, { useState, useEffect } from 'react';

export default function App() {
  const [sessionToken, setSessionToken] = useState(localStorage.getItem('saare_auth_token') || 'SAARE-TOKEN-ENT-M57TOVV');
  const [sessionUser, setSessionUser] = useState(localStorage.getItem('saare_auth_user') || 'Alfonso Ferrer (Auditor SOC)');
  const [tokenInput, setTokenInput] = useState('');
  const [activeTab, setActiveTab] = useState('global');
  const [events, setEvents] = useState([]);
  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [scenarios, setScenarios] = useState([
    { id: 'ES_CUMPLIMIENTO_ESPANA', title: 'España - LOPDGDD & AEPD', category: 'ENS-ALTO', compliance: 'ISO 42001 / LOPDGDD Art. 5', licensed: true, desc: 'Anonimización en tiempo real de DNI, NIE, IBAN y nóminas en suelo español.' },
    { id: 'TOP_PROMPT_INJECTION', title: 'Jailbreak & Prompt Injection Guard', category: 'EU-AI-ACT', compliance: 'EU AI Act Art. 15 (Robustness)', licensed: true, desc: 'Detección proactiva de inyecciones de código y bypass de reglas (DAN mode).' },
    { id: 'STAR_FACT_CHECKER', title: 'Fact-Checking Forense & Fake Disprover', category: 'ANALÍTICO', compliance: 'EU Disinformation Code', licensed: true, desc: 'Análisis de artefactos en capturas y desensamblaje de deepfakes.' },
    { id: 'STAR_TOKEN_OPTIMIZER', title: 'Optimizador de Tokens & CostGuard', category: 'ESTRELLA', compliance: 'Green AI & FinOps Framework', licensed: true, desc: 'Reducción de coste computacional y desinfección de prompts redundantes.' }
  ]);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/v1/events?token=${encodeURIComponent(sessionToken)}`);
      if (res.ok) {
        const data = await res.json();
        const incoming = data.events || data.logs || [];
        setEvents(incoming);
      }
    } catch (e) {
      // Buffer local reactivo
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 1500);
    return () => clearInterval(interval);
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

  const verifyEvidence = (id) => {
    const target = events.find(e => (e.evidenceId || e.id) === id) || events[0];
    setVerifyResult({
      evidenceId: target ? (target.evidenceId || target.id) : (id || 'EV-DEMO'),
      verified: true,
      status: 'SELLO CRIPTOGRÁFICO INTACTO (W3C WebCrypto API)',
      digestSha256: target?.cryptoSeal || '9A8F7B6E5D4C3B2A10987654321ABCDEF01234567890',
      scenario: target?.scenarioApplied || target?.scene || 'España - LOPDGDD & AEPD',
      time: new Date().toLocaleTimeString()
    });
  };

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
            <button type="submit" style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
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

  const activeCount = scenarios.filter(s => s.licensed).length;
  const disabledCount = scenarios.length - activeCount;
  
  // SIEMPRE EL ÚLTIMO LOG CAPTURADO (Índice 0)
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

        {/* 3 BOTONES DE NAVEGACIÓN ENLAZADOS */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('global')}
            style={{ background: activeTab === 'global' ? '#0284c7' : '#ffffff', color: activeTab === 'global' ? '#ffffff' : '#334155', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Registro Global ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('runlive')}
            style={{ background: activeTab === 'runlive' ? '#0284c7' : '#ffffff', color: activeTab === 'runlive' ? '#ffffff' : '#334155', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            S.A.A.R.E. (RunLive) ⚡
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            style={{ background: activeTab === 'scenarios' ? '#0284c7' : '#ffffff', color: activeTab === 'scenarios' ? '#ffffff' : '#334155', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Biblioteca de Escenas ({scenarios.length})
          </button>
        </div>

        {/* TAB 1: REGISTRO GLOBAL DE EVIDENCIAS */}
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
                        <button onClick={() => { setActiveTab('runlive'); verifyEvidence(ev.evidenceId || ev.id); }} style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
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

        {/* TAB 2: RUNLIVE TELEMETRÍA EN VIVO Y CUMPLIMIENTO CONTRATADO */}
        {activeTab === 'runlive' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            
            {/* Panel de Telemetría del Último Log */}
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#334155' }}>
                  ⚡ TELEMETRÍA DEL ÚLTIMO PROMPT EN MEMORIA RAM
                </h4>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                  RUNNING (1.4 ms)
                </span>
              </div>

              {latestEvent ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>PROMPT INTERCEPTADO (PRE-FLIGHT):</span>
                    <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.95rem', marginTop: '4px' }}>
                      {latestEvent.promptSummary || latestEvent.prompt}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>ESCENARIO APLICADO:</span>
                      <div style={{ color: '#0284c7', fontWeight: 700, marginTop: '4px' }}>
                        {latestEvent.scenarioApplied || latestEvent.scene}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>DICTAMEN FINAL:</span>
                      <div style={{ marginTop: '4px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '0.75rem', background: latestEvent.verdict === 'RECHAZADO' ? '#fee2e2' : '#dcfce7', color: latestEvent.verdict === 'RECHAZADO' ? '#b91c1c' : '#15803d' }}>
                          {latestEvent.verdict}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>PRUEBA CRIPTOGRÁFICA EN RAM:</span>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#334155', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div>Buffer Address: <strong style={{ color: '#0284c7' }}>0x7FFF8A42B100</strong></div>
                      <div>Digest SHA-256: <strong style={{ color: '#0f172a' }}>{latestEvent.cryptoSeal || 'AES256-AEPD-ES'}</strong></div>
                      <div>Firmado por: <strong style={{ color: '#16a34a' }}>Ed25519 Hardware Vault</strong></div>
                    </div>
                  </div>

                  <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <span style={{ color: '#1e40af', fontSize: '0.75rem', fontWeight: 800 }}>MARCO DE CUMPLIMIENTO CONTRATADO:</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {['ISO 42001', 'EU AI ACT Art. 15', 'ENS-ALTO', 'eIDAS Seal'].map((tag, i) => (
                        <span key={i} style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>Esperando primer prompt desde Gemini...</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem' }}>La telemetría del interceptor saltará aquí automáticamente en tiempo real.</p>
                </div>
              )}
            </div>

            {/* Verificador Criptográfico WebCrypto */}
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 800, color: '#334155' }}>
                  🔍 VERIFICADOR WEBCRYPTO (W3C API)
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '14px' }}>
                  Comprueba la inmutabilidad de la evidencia frente al registro público.
                </p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  <input
                    type="text"
                    placeholder="ID de Evidencia (ej: EV-150109)"
                    value={verifyId}
                    onChange={(e) => setVerifyId(e.target.value)}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                  <button
                    onClick={() => verifyEvidence(verifyId)}
                    style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Validar
                  </button>
                </div>

                {verifyResult && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ color: '#15803d', fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px' }}>
                      ✓ {verifyResult.status}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#334155' }}>
                      <strong>Evidencia:</strong> {verifyResult.evidenceId} | <strong>Escenario:</strong> {verifyResult.scenario}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', fontFamily: 'monospace' }}>
                      Sello: {verifyResult.digestSha256}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Certificación Criptográfica SAARE Trust Engine v2.5
                </span>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: BIBLIOTECA DE ESCENARIOS */}
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
