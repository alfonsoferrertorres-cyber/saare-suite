import React, { useState, useEffect } from 'react';

const API_BASE = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1";

function resolveInitialUser() {
  if (typeof window === "undefined") return null;
  const consoleSaved = localStorage.getItem('saare_user');
  const suiteSaved = localStorage.getItem('saare_suite_user');

  if (consoleSaved) {
    try { return JSON.parse(consoleSaved); } catch {}
  }
  if (suiteSaved) {
    try {
      const parsed = JSON.parse(suiteSaved);
      localStorage.setItem('saare_user', JSON.stringify(parsed));
      return parsed;
    } catch {}
  }
  return null;
}

export default function App() {
  const [sessionUser, setSessionUser] = useState(resolveInitialUser);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [activeTab, setActiveTab] = useState('GLOBAL');
  const [events, setEvents] = useState([]);
  const [lastEvent, setLastEvent] = useState(null);
  const [connected, setConnected] = useState(false);
  const [selectedJson, setSelectedJson] = useState(null);

  const [customRules, setCustomRules] = useState([]);
  const [newRule, setNewRule] = useState({ label: '', pattern: '' });
  const [showAddModal, setShowAddModal] = useState(false);

  // Estado de directivas de cumplimiento
  const [directives, setDirectives] = useState({
    lopd: true,
    jailbreak: true,
    forensic: true,
    finops: true
  });

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, directiveKey: null });

  const directiveNames = {
    lopd: 'ESPAÑA - LOPDGDD & AEPD',
    jailbreak: 'TOP L7: JAILBREAK & PROMPT INJECTION GUARD',
    forensic: 'FACT-CHECKING FORENSE & FAKE DISPROVER',
    finops: 'OPTIMIZADOR DE TOKENS & COSTGUARD'
  };

  const activeDirectivesCount = Object.values(directives).filter(Boolean).length;
  const disabledDirectivesCount = 4 - activeDirectivesCount;

  // Consulta continua de telemetría filtrada por usuario autenticado
  const fetchTelemetry = async () => {
    if (!sessionUser?.email) return;

    try {
      const userParam = encodeURIComponent(sessionUser.email);
      const [resRuns, resRules] = await Promise.all([
        fetch(`${API_BASE}/runs?user=${userParam}`),
        fetch(`${API_BASE}/custom-rules?user=${userParam}`)
      ]);

      if (resRuns.ok) {
        const dataRuns = await resRuns.json();
        const runsList = Array.isArray(dataRuns) ? dataRuns : (dataRuns.events || dataRuns.logs || []);
        
        // Ordenar eventos de más reciente a más antiguo
        runsList.sort((a, b) => new Date(b.timestamp || b.created_at || 0) - new Date(a.timestamp || a.created_at || 0));
        
        setEvents(runsList);
        if (runsList.length > 0) setLastEvent(runsList[0]);
        setConnected(true);
      }

      if (resRules.ok) {
        const dataRules = await resRules.json();
        if (Array.isArray(dataRules)) setCustomRules(dataRules);
      }
    } catch {
      setConnected(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, [sessionUser?.email]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoadingLogin(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput, source: 'console' })
      });
      const data = await res.json();

      if (res.ok && data.status === 'SUCCESS') {
        const userObj = data.user;
        localStorage.setItem('saare_user', JSON.stringify(userObj));
        localStorage.setItem('saare_suite_user', JSON.stringify(userObj));
        setSessionUser(userObj);
      } else {
        setLoginError(data.error || "Credenciales corporativas incorrectas.");
      }
    } catch {
      setLoginError("Error de comunicación con Bóveda KV.");
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('saare_user');
    localStorage.removeItem('saare_suite_user');
    setSessionUser(null);
    setEvents([]);
    setLastEvent(null);
  };

  const addCustomRule = async () => {
    if (!newRule.pattern || !sessionUser?.email) return;
    const updated = [...customRules, newRule];
    setCustomRules(updated);
    setNewRule({ label: '', pattern: '' });
    setShowAddModal(false);
    try {
      await fetch(`${API_BASE}/custom-rules?user=${encodeURIComponent(sessionUser.email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch {}
  };

  const removeCustomRule = async (index) => {
    if (!sessionUser?.email) return;
    const updated = customRules.filter((_, i) => i !== index);
    setCustomRules(updated);
    try {
      await fetch(`${API_BASE}/custom-rules?user=${encodeURIComponent(sessionUser.email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch {}
  };

  const handleToggleDirective = (key) => {
    if (directives[key]) {
      setConfirmModal({ isOpen: true, directiveKey: key });
    } else {
      setDirectives({ ...directives, [key]: true });
    }
  };

  const confirmDeactivation = () => {
    if (confirmModal.directiveKey) {
      setDirectives({ ...directives, [confirmModal.directiveKey]: false });
    }
    setConfirmModal({ isOpen: false, directiveKey: null });
  };

  if (!sessionUser) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1d', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '48px', height: '48px', background: '#1e3a8a', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '12px' }}>🛡️</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px 0' }}>S.A.A.R.E. CONSOLE GATEWAY</h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Acceso a Consola Forense GRC & Auditoría L7</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="Correo Corporativo (CISO / Auditor)" style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
            <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Contraseña de Acceso" style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
            {loginError && <div style={{ padding: '12px', background: '#450a0a', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', textAlign: 'center', fontSize: '0.85rem' }}>{loginError}</div>}
            <button type="submit" disabled={loadingLogin} style={{ padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: loadingLogin ? 'not-allowed' : 'pointer' }}>
              {loadingLogin ? 'Autenticando...' : '🔒 Iniciar Sesión en Bóveda'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#7b92a8', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b' }}>
      
      {/* CABECERA CORPORATIVA */}
      <header style={{ background: '#ffffff', borderBottom: '2px solid #94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <img src="/Cabecera saare-console.jfif" alt="SAARE" style={{ width: '100%', maxWidth: '1440px', height: 'auto', maxHeight: '180px', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
      </header>

      <main style={{ maxWidth: '1440px', margin: '24px auto', padding: '0 24px' }}>
        
        {/* PANEL INFORMATIVO DEL TENANT */}
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px 28px', border: '1px solid #cbd5e1', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.2px', textTransform: 'uppercase' }}>
              PANEL DE CONTROL GRC & CUMPLIMIENTO CORPORATIVO IA V2.5
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', textTransform: 'uppercase' }}>
              ORGANIZACION: <strong style={{ color: '#0f172a' }}>{sessionUser.tenantName || 'ENTORNO AISLADO'}</strong> | USUARIO: <strong style={{ color: '#0284c7' }}>{sessionUser.email}</strong> | DIRECTIVAS BASE: <strong style={{ color: '#16a34a' }}>{activeDirectivesCount} Activas</strong> | <strong style={{ color: '#dc2626' }}>{disabledDirectivesCount} Deshabilitadas</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: `2px solid ${connected ? '#16a34a' : '#ef4444'}`, color: connected ? '#15803d' : '#dc2626', padding: '8px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? '#16a34a' : '#ef4444' }}></span>
              {connected ? 'BÓVEDA KV EN LINEA' : 'DESCONECTADO'}
            </div>
            <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#fee2e2', border: '1px solid #ef4444', color: '#dc2626', borderRadius: '8px', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}>
              SALIR
            </button>
          </div>
        </div>

        {/* SELECTOR DE PESTAÑAS */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setActiveTab('GLOBAL')} style={{ padding: '14px 32px', borderRadius: '8px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', border: 'none', background: activeTab === 'GLOBAL' ? '#0284c7' : '#ffffff', color: activeTab === 'GLOBAL' ? '#ffffff' : '#334155', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            REGISTRO GLOBAL ({events.length})
          </button>
          <button onClick={() => setActiveTab('RUNLIVE')} style={{ padding: '14px 32px', borderRadius: '8px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', border: 'none', background: activeTab === 'RUNLIVE' ? '#0284c7' : '#ffffff', color: activeTab === 'RUNLIVE' ? '#ffffff' : '#334155', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            S.A.A.R.E. (RUNLIVE)
          </button>
          <button onClick={() => setActiveTab('CONFIG')} style={{ padding: '14px 32px', borderRadius: '8px', fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', border: 'none', background: activeTab === 'CONFIG' ? '#0284c7' : '#ffffff', color: activeTab === 'CONFIG' ? '#ffffff' : '#334155', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            CONFIGURACIÓN ({activeDirectivesCount})
          </button>
        </div>

        {/* TAB 1: REGISTRO GLOBAL DE EVIDENCIAS */}
        {activeTab === 'GLOBAL' && (
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', textTransform: 'uppercase' }}>HISTORIAL DE EVIDENCIAS FORENSES EN AUDITORÍA</h3>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total filtradas por {sessionUser.email}: <strong>{events.length}</strong></span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '14px 20px' }}>TIMESTAMP</th>
                    <th style={{ padding: '14px 20px' }}>ID EVIDENCIA</th>
                    <th style={{ padding: '14px 20px' }}>CATEGORÍA / NORMA</th>
                    <th style={{ padding: '14px 20px' }}>PROMPT INTERCEPTADO</th>
                    <th style={{ padding: '14px 20px' }}>DICTAMEN</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center' }}>AUDITORÍA</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No hay evidencias registradas para esta cuenta. Realiza una prueba en Gemini o ChatGPT para observar la captura perimetral.
                      </td>
                    </tr>
                  ) : (
                    events.map((ev, i) => {
                      const id = ev.runId || ev.evidenceId || `EV-L7-${i + 1}`;
                      const timestamp = ev.timestamp ? new Date(ev.timestamp).toLocaleString() : 'En vivo';
                      const category = ev.violationDetails?.category || ev.category || 'PII_DETECTED';
                      const norma = ev.violationDetails?.norma || ev.norma || 'LOPDGDD / AI Act';
                      const promptText = ev.promptInput || ev.promptSummary || ev.payload || "Sin contenido";
                      const verdict = ev.verdict || 'RECHAZADO';

                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                          <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{timestamp}</td>
                          <td style={{ padding: '14px 20px', fontWeight: '800', color: '#0284c7', fontFamily: 'monospace' }}>{id}</td>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>{category}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{norma}</div>
                          </td>
                          <td style={{ padding: '14px 20px', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            "{promptText}"
                          </td>
                          <td style={{ padding: '14px 20px', fontWeight: '900', color: verdict === 'RECHAZADO' || verdict === 'BLOQUEADO' ? '#dc2626' : '#16a34a' }}>
                            {verdict}
                          </td>
                          <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                            <button onClick={() => setSelectedJson(ev)} style={{ padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>
                              Ver JSON
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: RUNLIVE (ÚLTIMO EVENTO FORENSE EN TIEMPO REAL) */}
        {activeTab === 'RUNLIVE' && (
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '32px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900' }}>TELEMETRÍA EN VIVO (RAM HOOK L7)</h3>
              <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '6px', fontWeight: '800', fontSize: '0.8rem' }}>
                MONITORIZACIÓN DETERMINISTA
              </span>
            </div>
            {lastEvent ? (
              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '18px', fontSize: '0.85rem' }}>
                  <div>ID EVIDENCIA: <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{lastEvent.runId || lastEvent.evidenceId}</strong></div>
                  <div>USUARIO AUDITADO: <strong>{lastEvent.user || sessionUser.email}</strong></div>
                  <div>TIMESTAMP: <strong>{new Date(lastEvent.timestamp || Date.now()).toLocaleString()}</strong></div>
                  <div>DICTAMEN: <strong style={{ color: lastEvent.verdict === 'RECHAZADO' ? '#dc2626' : '#16a34a' }}>{lastEvent.verdict || 'RECHAZADO'}</strong></div>
                </div>

                <div style={{ background: '#ffffff', padding: '18px', borderLeft: '5px solid #dc2626', borderRadius: '4px', marginBottom: '18px', fontSize: '0.95rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>CARGA RECEPTADA EN MEMORIA VOLÁTIL:</div>
                  "{lastEvent.promptInput || lastEvent.promptSummary || lastEvent.payload}"
                </div>

                <div style={{ background: '#090d16', padding: '16px', borderRadius: '8px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.8rem', overflowX: 'auto' }}>
                  {JSON.stringify(lastEvent, null, 2)}
                </div>
              </div>
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📡</div>
                <strong>Esperando intercepciones en caliente...</strong>
                <p style={{ fontSize: '0.85rem', margin: '6px 0 0 0' }}>Escribe un DNI o IBAN en Gemini o ChatGPT para visualizar el despiece forense.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONFIGURACIÓN DE DIRECTIVAS */}
        {activeTab === 'CONFIG' && (
          <div>
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>
                    CONFIGURADOR DE SINTAXIS Y FILTROS PERSONALIZADOS
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b' }}>
                    Define palabras clave corporativas o expresiones regulares para bloqueo perimetral.
                  </p>
                </div>
                <button onClick={() => setShowAddModal(true)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 2px 6px rgba(2,132,199,0.3)' }}>
                  + AÑADIR BLOQUEO
                </button>
              </div>

              {customRules.length === 0 ? (
                <div style={{ border: '1px dashed #94a3b8', borderRadius: '8px', padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.95rem', background: '#f8fafc' }}>
                  No hay filtros personalizados activos. Las 4 directivas base de cumplimiento legal se mantienen en ejecución.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {customRules.map((rule, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div>
                        <strong style={{ color: '#0f172a', marginRight: '16px' }}>{rule.label}</strong>
                        <code style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{rule.pattern}</code>
                      </div>
                      <button onClick={() => removeCustomRule(idx)} style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '0.75rem' }}>Eliminar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
              
              <div style={{ background: '#ffffff', padding: '28px', borderRadius: '12px', border: `2px solid ${directives.lopd ? '#16a34a' : '#cbd5e1'}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>PRIVACIDAD ES</span>
                    <span style={{ border: `1px solid ${directives.lopd ? '#22c55e' : '#ef4444'}`, color: directives.lopd ? '#16a34a' : '#dc2626', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>
                      {directives.lopd ? 'HABILITADA' : 'DESHABILITADA'}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>ESPAÑA - LOPDGDD & AEPD</h4>
                  <p style={{ fontSize: '0.95rem', color: '#334155', margin: '0 0 28px 0' }}>Detección y bloqueo perimetral de DNI, NIE, IBAN, nóminas y fuga de PII.</p>
                </div>
                <button onClick={() => handleToggleDirective('lopd')} style={{ width: '100%', padding: '16px', background: directives.lopd ? '#16a34a' : '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.95rem' }}>
                  {directives.lopd ? 'DESACTIVAR DIRECTIVA' : 'ACTIVAR DIRECTIVA'}
                </button>
              </div>

              <div style={{ background: '#ffffff', padding: '28px', borderRadius: '12px', border: `2px solid ${directives.jailbreak ? '#16a34a' : '#cbd5e1'}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>CIBERSEGURIDAD</span>
                    <span style={{ border: `1px solid ${directives.jailbreak ? '#22c55e' : '#ef4444'}`, color: directives.jailbreak ? '#16a34a' : '#dc2626', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>
                      {directives.jailbreak ? 'HABILITADA' : 'DESHABILITADA'}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>TOP L7: JAILBREAK & PROMPT INJECTION GUARD</h4>
                  <p style={{ fontSize: '0.95rem', color: '#334155', margin: '0 0 28px 0' }}>Mitigación de ataques adversarios, modo DAN y anulación de directivas.</p>
                </div>
                <button onClick={() => handleToggleDirective('jailbreak')} style={{ width: '100%', padding: '16px', background: directives.jailbreak ? '#16a34a' : '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.95rem' }}>
                  {directives.jailbreak ? 'DESACTIVAR DIRECTIVA' : 'ACTIVAR DIRECTIVA'}
                </button>
              </div>

              <div style={{ background: '#ffffff', padding: '28px', borderRadius: '12px', border: `2px solid ${directives.forensic ? '#16a34a' : '#cbd5e1'}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>TRAZABILIDAD</span>
                    <span style={{ border: `1px solid ${directives.forensic ? '#22c55e' : '#ef4444'}`, color: directives.forensic ? '#16a34a' : '#dc2626', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>
                      {directives.forensic ? 'HABILITADA' : 'DESHABILITADA'}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>FACT-CHECKING FORENSE & FAKE DISPROVER</h4>
                  <p style={{ fontSize: '0.95rem', color: '#334155', margin: '0 0 28px 0' }}>Trazabilidad y sellado criptográfico SHA-256 de consistencia documental e ISO 42001.</p>
                </div>
                <button onClick={() => handleToggleDirective('forensic')} style={{ width: '100%', padding: '16px', background: directives.forensic ? '#16a34a' : '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.95rem' }}>
                  {directives.forensic ? 'DESACTIVAR DIRECTIVA' : 'ACTIVAR DIRECTIVA'}
                </button>
              </div>

              <div style={{ background: '#ffffff', padding: '28px', borderRadius: '12px', border: `2px solid ${directives.finops ? '#16a34a' : '#cbd5e1'}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>FINOPS IT</span>
                    <span style={{ border: `1px solid ${directives.finops ? '#22c55e' : '#ef4444'}`, color: directives.finops ? '#16a34a' : '#dc2626', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>
                      {directives.finops ? 'HABILITADA' : 'DESHABILITADA'}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>OPTIMIZADOR DE TOKENS & COSTGUARD</h4>
                  <p style={{ fontSize: '0.95rem', color: '#334155', margin: '0 0 28px 0' }}>Reducción de consumo de tokens (20-40%) y modo bypass para auditoría.</p>
                </div>
                <button onClick={() => handleToggleDirective('finops')} style={{ width: '100%', padding: '16px', background: directives.finops ? '#16a34a' : '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.95rem' }}>
                  {directives.finops ? 'DESACTIVAR DIRECTIVA' : 'ACTIVAR DIRECTIVA'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* MODAL VISUALIZADOR DE JSON FORENSE */}
        {selectedJson && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setSelectedJson(null)}>
            <div style={{ background: '#090d16', border: '1px solid #334155', borderRadius: '12px', padding: '24px', maxWidth: '720px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem' }}>EVIDENCIA FORENSE CRIPTOGRÁFICA (SHA-256)</h3>
                <button onClick={() => setSelectedJson(null)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
              <pre style={{ flex: 1, overflowY: 'auto', background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', color: '#34d399', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                {JSON.stringify(selectedJson, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* MODAL PARA AÑADIR FILTROS */}
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '28px', maxWidth: '480px', width: '90%' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: '900' }}>Añadir Filtro Personalizado</h3>
              <input type="text" placeholder="Etiqueta (ej: Secreto Industrial)" value={newRule.label} onChange={(e) => setNewRule({...newRule, label: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <input type="text" placeholder="Patrón / Regex (ej: /confidencial/i)" value={newRule.pattern} onChange={(e) => setNewRule({...newRule, pattern: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setShowAddModal(false)} style={{ padding: '10px 18px', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={addCustomRule} style={{ padding: '10px 18px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>Guardar</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE ADVERTENCIA AL DESACTIVAR DIRECTIVAS */}
        {confirmModal.isOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '36px', maxWidth: '480px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #fca5a5' }}>
              <div style={{ width: '72px', height: '72px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '32px' }}>
                ⚠️
              </div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>
                Advertencia de Seguridad
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#475569', margin: '0 0 28px 0', lineHeight: '1.6' }}>
                Estás a punto de desactivar la directiva:<br/>
                <strong style={{ color: '#dc2626', display: 'block', marginTop: '10px', fontSize: '1.05rem' }}>
                  {directiveNames[confirmModal.directiveKey]}
                </strong>
                <br/>
                Esto detendrá la intercepción en vivo de los eventos relacionados. ¿Deseas continuar?
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button 
                  onClick={() => setConfirmModal({ isOpen: false, directiveKey: null })} 
                  style={{ padding: '12px 24px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '0.95rem' }}>
                  Cancelar
                </button>
                <button 
                  onClick={confirmDeactivation} 
                  style={{ padding: '12px 24px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '0.95rem', boxShadow: '0 4px 6px rgba(220,38,38,0.3)' }}>
                  Sí, desactivar
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}