import React, { useState, useEffect } from 'react';


export default function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados originales del panel
  const [activeTab, setActiveTab] = useState('config'); // 'registro', 'runlive', 'config'
  const [runs, setRuns] = useState([]);
  const [customRules, setCustomRules] = useState([]);
  const [newRule, setNewRule] = useState('');
  const [showAddRule, setShowAddRule] = useState(false);

  // Directivas base originales
  const [directives, setDirectives] = useState({
    lopd: true,
    jailbreak: true,
    trazabilidad: true,
    finops: true
  });

  useEffect(() => {
    const saved = localStorage.getItem('saare_session');
    if (saved) {
      try {
        setSession(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('saare_session');
      }
    }
  }, []);

  // Polling de evidencias vinculadas al usuario
  useEffect(() => {
    if (!session) return;
    const fetchRuns = async () => {
      try {
        const res = await fetch('https://saare-api.alfonsoferrertorres.workers.dev/api/v1/runs?user=' + encodeURIComponent(session.user));
        const data = await res.json();
        if (data && data.runs) {
          setRuns(data.runs);
        }
      } catch (e) {}
    };

    fetchRuns();
    const interval = setInterval(fetchRuns, 5000);
    return () => clearInterval(interval);
  }, [session]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('https://saare-api.alfonsoferrertorres.workers.dev/api/v1/auth/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: email.trim(), licenseKey: licenseKey.trim() })
      });

      const data = await res.json();

      if (data.valid) {
        localStorage.setItem('saare_session', JSON.stringify(data));
        setSession(data);
      } else {
        setErrorMsg(data.error || 'Credenciales no autorizadas en la Bóveda Forense.');
      }
    } catch (err) {
      setErrorMsg('Error de enlace con el Gateway perimetral.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('saare_session');
    setSession(null);
  };

  const toggleDirective = (key) => {
    setDirectives(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    if (!newRule.trim()) return;
    setCustomRules(prev => [...prev, newRule.trim()]);
    setNewRule('');
    setShowAddRule(false);
  };

  // 1. PANTALLA DE ACCESO OBLIGATORIO (LOGIN FORENSE)
  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: '#090d16', color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: '20px' }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>🛡️</div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#38bdf8', margin: '0 0 6px 0' }}>S.A.A.R.E. CONSOLE</h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Autenticación en Bóveda Forense L7</p>
          </div>

          {errorMsg && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Correo Registrado</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tudireccion@tudominio.es"
                style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clave de Licencia L7</label>
              <input 
                type="text" 
                required
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="SAARE-XXXX-XXXX-XXXX"
                style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#38bdf8', fontFamily: 'monospace', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', background: 'linear-gradient(to right, #0ea5e9, #0284c7)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'VALIDANDO EN BÓVEDA...' : 'ENTRAR A SAARE CONSOLE'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '11px', color: '#475569' }}>
            Nodo Canónico: 2607076315021 | Dual-Vault RFC 3161
          </div>
        </div>
      </div>
    );
  }

  // 2. ASPECTO EXACTO ORIGINAL DE LA CONSOLA (CON DATOS REALES DE BÓVEDA)
  const activeCount = Object.values(directives).filter(Boolean).length;
  const disabledCount = Object.values(directives).filter(v => !v).length;

  return (
    <div style={{ minHeight: '100vh', background: '#cbd5e1', color: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* 1. CABECERA CON EL CEREBRO ORIGINAL */}
      <div style={{ width: '100%', background: '#e2e8f0', borderBottom: '2px solid #94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img 
          src="/CABECERA WEB.jfif" onError={(e) => { e.target.style.display = "none"; }} 
          alt="Tecnología de IA - Control Perimetral y Peritaje Forense" 
          style={{ width: '100%', maxHeight: '180px', objectFit: 'cover' }}
        />
      </div>

      {/* 2. CONTENIDO Y PANELES */}
      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
        
        {/* PANEL SUPERIOR DE ESTADO GRC CON CREDENCIALES DEL USUARIO */}
        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px 20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>
              PANEL DE CONTROL GRC & CUMPLIMIENTO CORPORATIVO IA V2.5
            </h2>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
              USUARIO: <strong style={{ color: '#0284c7' }}>{session.user}</strong> &nbsp;|&nbsp; 
              ROL: <strong style={{ color: '#16a34a' }}>{session.role}</strong> &nbsp;|&nbsp; 
              DIRECTIVAS BASE: <strong style={{ color: '#16a34a' }}>{activeCount} Activas</strong> &nbsp;|&nbsp; 
              <strong style={{ color: '#dc2626' }}>{disabledCount} Deshabilitadas</strong> &nbsp;|&nbsp; 
              REGLAS PERSONALIZADAS: <strong style={{ color: '#0284c7' }}>{customRules.length} Filtros</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ border: '1px solid #86efac', background: '#f0fdf4', color: '#16a34a', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
              LICENCIA: {session.license}
            </div>
            <button 
              onClick={handleLogout}
              style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* LOS 3 BOTONES DE PESTAÑAS ORIGINALES */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button 
            onClick={() => setActiveTab('registro')}
            style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #94a3b8', background: activeTab === 'registro' ? '#0284c7' : '#fff', color: activeTab === 'registro' ? '#fff' : '#0f172a', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
          >
            REGISTRO GLOBAL ({runs.length})
          </button>
          <button 
            onClick={() => setActiveTab('runlive')}
            style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #94a3b8', background: activeTab === 'runlive' ? '#0284c7' : '#fff', color: activeTab === 'runlive' ? '#fff' : '#0f172a', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
          >
            S.A.A.R.E. (RUNLIVE)
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #94a3b8', background: activeTab === 'config' ? '#0284c7' : '#fff', color: activeTab === 'config' ? '#fff' : '#0f172a', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
          >
            CONFIGURACIÓN ({activeCount})
          </button>
        </div>

        {/* SECCIÓN 1: CONFIGURACIÓN Y DIRECTIVAS */}
        {activeTab === 'config' && (
          <div>
            {/* Configurador de Sintaxis y Filtros */}
            <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px 20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>CONFIGURADOR DE SINTAXIS Y FILTROS PERSONALIZADOS</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Define palabras clave, frases confidenciales o expresiones regulares (/regex/i) para bloqueo en tiempo real.</p>
                </div>
                <button 
                  onClick={() => setShowAddRule(!showAddRule)}
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  + AÑADIR BLOQUEO
                </button>
              </div>

              {showAddRule && (
                <form onSubmit={handleAddRule} style={{ display: 'flex', gap: '8px', marginBottom: '12px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <input 
                    type="text" 
                    placeholder="Ej: confidencial, proyecto_secreto, /token_[a-z0-9]+/i" 
                    value={newRule} 
                    onChange={(e) => setNewRule(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Regla</button>
                </form>
              )}

              {customRules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', fontSize: '12px', color: '#64748b' }}>
                  No hay filtros personalizados activos. Las 4 directivas base de cumplimiento legal se mantienen en ejecución.
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {customRules.map((rule, idx) => (
                    <span key={idx} style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      Bloqueo: {rule}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* LAS 4 DIRECTIVAS BASE ORIGINALES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
              
              {/* Directiva 1: España LOPD */}
              <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#0284c7' }}>PRIVACIDAD ES</span>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: directives.lopd ? '#16a34a' : '#dc2626', background: directives.lopd ? '#f0fdf4' : '#fee2e2', border: directives.lopd ? '1px solid #86efac' : '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>
                    {directives.lopd ? 'HABILITADA' : 'DESHABILITADA'}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>ESPAÑA - LOPDGDD & AEPD</h4>
                <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>Detección y bloqueo perimetral de DNI, NIE, IBAN, nóminas y fuga de PII.</p>
                <button 
                  onClick={() => toggleDirective('lopd')}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', background: directives.lopd ? '#16a34a' : '#94a3b8', color: '#fff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                >
                  {directives.lopd ? 'DESACTIVAR DIRECTIVA' : 'ACTIVAR DIRECTIVA'}
                </button>
              </div>

              {/* Directiva 2: Jailbreak */}
              <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#0284c7' }}>CIBERSEGURIDAD</span>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: directives.jailbreak ? '#16a34a' : '#dc2626', background: directives.jailbreak ? '#f0fdf4' : '#fee2e2', border: directives.jailbreak ? '1px solid #86efac' : '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>
                    {directives.jailbreak ? 'HABILITADA' : 'DESHABILITADA'}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>TOP L7: JAILBREAK & PROMPT INJECTION GUARD</h4>
                <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>Mitigación de ataques adversarios, modo DAN y anulación de directivas.</p>
                <button 
                  onClick={() => toggleDirective('jailbreak')}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', background: directives.jailbreak ? '#16a34a' : '#94a3b8', color: '#fff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                >
                  {directives.jailbreak ? 'DESACTIVAR DIRECTIVA' : 'ACTIVAR DIRECTIVA'}
                </button>
              </div>

              {/* Directiva 3: Trazabilidad */}
              <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#0284c7' }}>TRAZABILIDAD FORENSE</span>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: directives.trazabilidad ? '#16a34a' : '#dc2626', background: directives.trazabilidad ? '#f0fdf4' : '#fee2e2', border: directives.trazabilidad ? '1px solid #86efac' : '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>
                    {directives.trazabilidad ? 'HABILITADA' : 'DESHABILITADA'}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>SELLO DE TIEMPO RFC 3161 & HASH CANÓNICO</h4>
                <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>Indexación criptográfica Ed25519 en Bóveda Forense sin almacenamiento en disco.</p>
                <button 
                  onClick={() => toggleDirective('trazabilidad')}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', background: directives.trazabilidad ? '#16a34a' : '#94a3b8', color: '#fff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                >
                  {directives.trazabilidad ? 'DESACTIVAR DIRECTIVA' : 'ACTIVAR DIRECTIVA'}
                </button>
              </div>

              {/* Directiva 4: FinOps */}
              <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#0284c7' }}>FINOPS IT</span>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: directives.finops ? '#16a34a' : '#dc2626', background: directives.finops ? '#f0fdf4' : '#fee2e2', border: directives.finops ? '1px solid #86efac' : '1px solid #fca5a5', padding: '2px 8px', borderRadius: '4px' }}>
                    {directives.finops ? 'HABILITADA' : 'DESHABILITADA'}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>CONTROL DE COSTES Y CUOTA DE LLM</h4>
                <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>Limitación de gasto en tokens e inferencias masivas descontroladas.</p>
                <button 
                  onClick={() => toggleDirective('finops')}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', background: directives.finops ? '#16a34a' : '#94a3b8', color: '#fff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                >
                  {directives.finops ? 'DESACTIVAR DIRECTIVA' : 'ACTIVAR DIRECTIVA'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* SECCIÓN 2: REGISTRO GLOBAL DE EVIDENCIAS */}
        {activeTab === 'registro' && (
          <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
              EVIDENCIAS FORENSES REGISTRADAS ({session.user})
            </h3>
            {runs.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px', background: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                No hay interceptaciones registradas para este tenant en la sesión actual.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '10px' }}>ID EVIDENCIA</th>
                      <th style={{ padding: '10px' }}>FECHA / HORA</th>
                      <th style={{ padding: '10px' }}>VEREDICTO</th>
                      <th style={{ padding: '10px' }}>MOTIVO / NORMATIVA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px', fontFamily: 'monospace', color: '#0284c7', fontWeight: 'bold' }}>{r.evidenceId}</td>
                        <td style={{ padding: '10px', color: '#64748b' }}>{r.timestamp}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ background: r.verdict === 'RECHAZADO' ? '#fee2e2' : '#dcfce7', color: r.verdict === 'RECHAZADO' ? '#b91c1c' : '#16a34a', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                            {r.verdict}
                          </span>
                        </td>
                        <td style={{ padding: '10px' }}>{r.violationDetails?.reason || 'Validación de directiva'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SECCIÓN 3: RUNLIVE */}
        {activeTab === 'runlive' && (
          <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>MONITORIZACIÓN EN TIEMPO REAL (RUNLIVE)</h3>
            <div style={{ background: '#090d16', color: '#38bdf8', padding: '16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.6 }}>
              <div>[STATUS] SAARE Edge Runtime v2.7.0 Conectado</div>
              <div>[NODE] ID: 2607076315021 | Memoria RAM Aislada: ACTIVA</div>
              <div>[HASH] Firma Canónica: 128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07</div>
              <div>[TENANT] {session.user} ({session.license})</div>
              <div style={{ color: '#34d399', marginTop: '8px' }}>● ESCANEANDO PETICIONES ENTRANTES EN CAPA 7...</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

