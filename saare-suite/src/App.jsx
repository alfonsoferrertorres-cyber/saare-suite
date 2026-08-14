import React, { useState, useEffect } from 'react';

export default function App() {
  const [emailInput, setEmailInput] = useState('ciso@empresa.es');
  const [passwordInput, setPasswordInput] = useState('Password123!');
  const [loginError, setLoginError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [sessionUser, setSessionUser] = useState(localStorage.getItem('saare_user') ? JSON.parse(localStorage.getItem('saare_user')) : null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('saare_auth_token') || '');
  
  const [activeTab, setActiveTab] = useState('logs');
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [simPrompts, setSimPrompts] = useState(150000);
  const [deployLoading, setDeployLoading] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(null);

  // Sincronizar logs desde el Control-Plane
  const fetchTelemetry = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/events', { credentials: 'omit' });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || data.logs || []);
        setConnected(true);
        return;
      }
    } catch (err) {
      setConnected(false);
    }
  };

  useEffect(() => {
    if (sessionUser) {
      fetchTelemetry();
      const interval = setInterval(fetchTelemetry, 2500);
      return () => clearInterval(interval);
    }
  }, [sessionUser]);

  // Manejador del Login Corporativo (Correo + Password)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoadingLogin(true);

    try {
      const res = await fetch('http://localhost:3001/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });

      const data = await res.json();

      if (res.ok && data.status === 'SUCCESS') {
        localStorage.setItem('saare_auth_token', data.token);
        localStorage.setItem('saare_user', JSON.stringify(data.user));
        setAuthToken(data.token);
        setSessionUser(data.user);
      } else {
        setLoginError(data.error || 'Credenciales no válidas');
      }
    } catch (err) {
      setLoginError('Error al conectar con Control-Plane (Puerto 3001)');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('saare_auth_token');
    localStorage.removeItem('saare_user');
    setAuthToken('');
    setSessionUser(null);
  };

  // VISTA 1: FORMULARIO DE ACCESO CORPORATIVO (Si no hay sesión)
  if (!sessionUser) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1d', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '48px', height: '48px', background: '#1e3a8a', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '12px' }}>🛡️</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.025em', margin: '0 0 6px 0' }}>S.A.A.R.E. ENTERPRISE GATEWAY</h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Autenticación Criptográfica Zero-Trust L7</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '500' }}>CORREO CORPORATIVO / AUDITOR</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="ej: ciso@empresa.es"
                style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '500' }}>CONTRASEÑA</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {loginError && (
              <div style={{ padding: '10px', background: '#450a0a', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', fontSize: '0.8rem', textAlign: 'center' }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loadingLogin}
              style={{ width: '100%', padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.95rem', cursor: loadingLogin ? 'not-allowed' : 'pointer', marginTop: '8px' }}
            >
              {loadingLogin ? 'Validando con Control-Plane...' : '🔒 Iniciar Sesión Criptográfica'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid #1f2937', paddingTop: '16px' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
              Token OIDC/JWT emitido y custodiado por <strong style={{ color: '#94a3b8' }}>Control-Plane (:3001)</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // VISTA 2: PANEL DE GOBERNANZA / TELEMETRÍA (Sesión activa)
  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ borderBottom: '1px solid #1f2937', background: '#111827', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛡️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>SAARE PLATFORM | The AI Runtime</h1>
            <span style={{ fontSize: '0.75rem', color: '#10b981' }}>● {sessionUser.tenantName || 'SAARE Enterprise'} | Rol: {sessionUser.role || 'CISO'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{sessionUser.email}</span>
          <button onClick={handleLogout} style={{ padding: '6px 12px', background: '#374151', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '8px', padding: '16px 24px', borderBottom: '1px solid #1f2937' }}>
        <button onClick={() => setActiveTab('logs')} style={{ padding: '8px 16px', background: activeTab === 'logs' ? '#2563eb' : '#1f2937', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
          📊 Telemetría en Vivo ({events.length})
        </button>
        <button onClick={() => setActiveTab('calculator')} style={{ padding: '8px 16px', background: activeTab === 'calculator' ? '#2563eb' : '#1f2937', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
          🧮 Calculadora FinOps
        </button>
      </div>

      <main style={{ padding: '24px' }}>
        {activeTab === 'logs' && (
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Bóveda de Evidencias Selladas (Control-Plane L7)</h2>
              <span style={{ fontSize: '0.75rem', color: connected ? '#10b981' : '#ef4444' }}>
                ● {connected ? 'Sincronizado en tiempo real (:3001)' : 'Desconectado'}
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead style={{ background: '#0b0f19', color: '#94a3b8' }}>
                  <tr>
                    <th style={{ padding: '12px 16px' }}>ID EVIDENCIA</th>
                    <th style={{ padding: '12px 16px' }}>HORA</th>
                    <th style={{ padding: '12px 16px' }}>USUARIO / AGENTE</th>
                    <th style={{ padding: '12px 16px' }}>PROMPT INTERCEPTADO</th>
                    <th style={{ padding: '12px 16px' }}>DICTAMEN L7</th>
                    <th style={{ padding: '12px 16px' }}>FIRMA CRIPTOGRÁFICA</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                        No hay intercepciones registradas aún en evidence_vault/
                      </td>
                    </tr>
                  ) : (
                    events.map((ev, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #1f2937' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '600', color: '#38bdf8' }}>{ev.evidenceId}</td>
                        <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{ev.timestamp}</td>
                        <td style={{ padding: '12px 16px' }}>{ev.user}</td>
                        <td style={{ padding: '12px 16px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.promptSummary}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', background: ev.verdict === 'RECHAZADO' ? '#450a0a' : '#064e3b', color: ev.verdict === 'RECHAZADO' ? '#f87171' : '#34d399' }}>
                            {ev.verdict}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#a78bfa', fontSize: '0.75rem' }}>{ev.signature}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div style={{ maxWidth: '600px', background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Simulador de Ahorro FinOps & Deducciones</h3>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '8px' }}>
              Prompts Mensuales Estimados: <strong>{simPrompts.toLocaleString()}</strong>
            </label>
            <input
              type="range"
              min="10000"
              max="1000000"
              step="10000"
              value={simPrompts}
              onChange={(e) => setSimPrompts(Number(e.target.value))}
              style={{ width: '100%', marginBottom: '20px' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Ahorro Directo Tokens (38%):</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}>
                  {((simPrompts * 450 / 1000) * 0.002 * 0.38).toFixed(2)} €/mes
                </p>
              </div>
              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Deducción Fiscal Estimada:</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>
                  {(Math.min(3000, (simPrompts * 450 / 1000) * 0.002 * 0.25)).toFixed(2)} €
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
