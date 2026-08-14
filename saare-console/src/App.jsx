import React, { useState, useEffect } from 'react';

export default function App() {
  const [user, setUser] = useState(localStorage.getItem('saare_user') || '');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [emailInput, setEmailInput] = useState('alfonsosb1@gmail.com');
  const [passInput, setPassInput] = useState('Password123!');
  const [authMsg, setAuthMsg] = useState('');

  const [activeTab, setActiveTab] = useState('library');
  const [events, setEvents] = useState([]);
  const [scenarios, setScenarios] = useState([]);

  const fetchData = async () => {
    try {
      const [rScen, rEv] = await Promise.all([
        fetch('http://localhost:3001/api/v1/scenarios').catch(() => null),
        fetch('http://localhost:3001/api/v1/events').catch(() => null)
      ]);
      if (rScen && rScen.ok) setScenarios(await rScen.json());
      if (rEv && rEv.ok) {
        const d = await rEv.json();
        setEvents(d.events || []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1500);
    return () => clearInterval(interval);
  }, [user]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthMsg('');
    const endpoint = isRegisterMode ? '/api/v1/auth/register' : '/api/v1/auth/login';

    try {
      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passInput })
      });
      const data = await res.json();

      if (res.ok) {
        if (isRegisterMode) {
          setAuthMsg('✓ Registrado. Se ha notificado a legal@saare.es. Revisa el enlace de activación en la consola del backend.');
        } else {
          localStorage.setItem('saare_user', data.user.email);
          setUser(data.user.email);
        }
      } else {
        setAuthMsg('⚠ ' + (data.error || 'Error en la solicitud'));
      }
    } catch (err) {
      setAuthMsg('Error al conectar con Control-Plane :3001');
    }
  };

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
  const lastIntercepted = events.length > 0 ? events[0] : null;

  // 1. VISTA DE AUTENTICACIÓN / REGISTRO
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <form onSubmit={handleAuth} style={{ background: '#fff', padding: '36px', borderRadius: '16px', border: '1px solid #e2e8f0', width: '100%', maxWidth: '420px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '42px', marginBottom: '8px' }}>🧠</div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#92400e' }}>SAARE Control</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              {isRegisterMode ? 'Crear nueva cuenta corporativa' : 'Acceso autorizado al SOC'}
            </p>
          </div>

          {authMsg && (
            <div style={{ background: authMsg.startsWith('✓') ? '#dcfce7' : '#fee2e2', color: authMsg.startsWith('✓') ? '#15803d' : '#dc2626', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '16px' }}>
              {authMsg}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>CORREO ELECTRÓNICO</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>CONTRASEÑA</label>
            <input
              type="password"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' }}>
            {isRegisterMode ? 'REGISTRARME (VALIDACIÓN 24H)' : 'INICIAR SESIÓN'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => { setIsRegisterMode(!isRegisterMode); setAuthMsg(''); }}
              style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {isRegisterMode ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate aquí'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 2. VISTA SOC PRINCIPAL
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
      
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '18px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ fontSize: '38px' }}>🧠</div>
          <div style={{ borderLeft: '2px solid #cbd5e1', paddingLeft: '16px' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#92400e' }}>Tecnología de IA</h1>
            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#b45309' }}>Segura y Certificada</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>👤 {user}</span>
          <button onClick={() => { localStorage.removeItem('saare_user'); setUser(''); }} style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1240px', margin: '24px auto', padding: '0 24px' }}>
        
        {/* BANNER ESTADO */}
        <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>SAARE OPERATION CENTER v2.5</h2>
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

        {/* PESTAÑA 3: BIBLIOTECA EXACTA CAPTURA 8713 */}
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
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: isEnabled ? '#16a34a' : '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {isEnabled ? '⚡ CONMUTAR Y DESHABILITAR (➔ CAMBIAR A ROJO)' : '🔒 REACTIVAR LICENCIA (➔ CAMBIAR A VERDE)'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* PESTAÑA 1: REGISTRO GLOBAL */}
        {activeTab === 'global' && (
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800 }}>HISTORIAL DE EVIDENCIAS EN AUDITORÍA (TIEMPO REAL)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '10px' }}>ID EVIDENCIA</th>
                  <th style={{ padding: '10px' }}>PROMPT INTERCEPTADO</th>
                  <th style={{ padding: '10px' }}>ESCENARIO APLICADO</th>
                  <th style={{ padding: '10px' }}>DICTAMEN</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: 800, color: '#0284c7' }}>{ev.evidenceId}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>"{ev.promptSummary}"</td>
                    <td style={{ padding: '10px', color: '#475569' }}>{ev.scenario}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, background: ev.verdict === 'RECHAZADO' ? '#fee2e2' : '#dcfce7', color: ev.verdict === 'RECHAZADO' ? '#dc2626' : '#15803d' }}>
                        {ev.verdict}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PESTAÑA 2: RUNLIVE */}
        {activeTab === 'runlive' && (
          <div style={{ background: '#ffffff', padding: '28px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <span style={{ background: '#e0f2fe', color: '#0284c7', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '6px' }}>MONITOREO EN TIEMPO REAL</span>
            <h3 style={{ margin: '8px 0 16px 0', fontSize: '1.3rem', fontWeight: 800 }}>TELEMETRÍA EN VIVO (ÚLTIMO HECHO INTERCEPTADO)</h3>
            {lastIntercepted ? (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                <p><strong>Evidencia:</strong> {lastIntercepted.evidenceId}</p>
                <blockquote style={{ margin: '10px 0', padding: '10px', background: '#fff', borderLeft: '4px solid #0284c7' }}>
                  "{lastIntercepted.promptSummary}"
                </blockquote>
                <p><strong>Dictamen:</strong> <span style={{ color: lastIntercepted.verdict === 'RECHAZADO' ? '#dc2626' : '#15803d', fontWeight: 'bold' }}>{lastIntercepted.verdict}</span></p>
              </div>
            ) : (
              <p style={{ color: '#64748b' }}>Esperando intercepciones...</p>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
