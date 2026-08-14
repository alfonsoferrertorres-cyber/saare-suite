import React, { useState, useEffect } from 'react';

export default function App() {
  const [emailInput, setEmailInput] = useState('ciso@empresa.es');
  const [passwordInput, setPasswordInput] = useState('Password123!');
  const [loginError, setLoginError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [sessionUser, setSessionUser] = useState(localStorage.getItem('saare_soc_user') ? JSON.parse(localStorage.getItem('saare_soc_user')) : null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('saare_soc_token') || '');
  
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);

  // Sondeo al endpoint /api/v1/events en el puerto 3001
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
        localStorage.setItem('saare_soc_token', data.token);
        localStorage.setItem('saare_soc_user', JSON.stringify(data.user));
        setAuthToken(data.token);
        setSessionUser(data.user);
      } else {
        setLoginError(data.error || 'Credenciales no válidas');
      }
    } catch (err) {
      setLoginError('Error al conectar con Control-Plane (:3001)');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('saare_soc_token');
    localStorage.removeItem('saare_soc_user');
    setAuthToken('');
    setSessionUser(null);
  };

  if (!sessionUser) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1d', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '48px', height: '48px', background: '#1e3a8a', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '12px' }}>🛡️</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0 0 6px 0' }}>S.A.A.R.E. CONSOLE SOC</h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Autenticación Criptográfica Auditor L7</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px' }}>CORREO SOC / AUDITOR</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px' }}>CONTRASEÑA</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{ width: '100%', padding: '12px', background: '#0b0f19', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', boxSizing: 'border-box' }}
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
              style={{ width: '100%', padding: '14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}
            >
              {loadingLogin ? 'Validando...' : '🔒 Acceder a Consola SOC'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ borderBottom: '1px solid #1f2937', background: '#111827', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🧠</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>SAARE OPERATION CENTER v2.5</h1>
            <span style={{ fontSize: '0.75rem', color: connected ? '#10b981' : '#ef4444' }}>
              ● Auditor: {sessionUser.email} | Org: {sessionUser.tenantName} ({connected ? 'ENLACE L7 ACTIVO' : 'DESCONECTADO'})
            </span>
          </div>
        </div>
        <button onClick={handleLogout} style={{ padding: '6px 12px', background: '#374151', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </header>

      <main style={{ padding: '24px' }}>
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Registro Pericial de Evidencias Selladas (Control-Plane / Vault)</h2>
            <span style={{ fontSize: '0.8rem', background: '#1e293b', padding: '4px 10px', borderRadius: '6px', color: '#38bdf8' }}>
              {events.length} Evidencias en Bóveda
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead style={{ background: '#0b0f19', color: '#94a3b8' }}>
                <tr>
                  <th style={{ padding: '12px 16px' }}>ID EVIDENCIA</th>
                  <th style={{ padding: '12px 16px' }}>HORA</th>
                  <th style={{ padding: '12px 16px' }}>USUARIO / ACTOR</th>
                  <th style={{ padding: '12px 16px' }}>PROMPT INTERCEPTADO L7</th>
                  <th style={{ padding: '12px 16px' }}>ESCENARIO / NORMATIVA</th>
                  <th style={{ padding: '12px 16px' }}>DICTAMEN</th>
                  <th style={{ padding: '12px 16px' }}>FIRMA CRIPTOGRÁFICA</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                      No hay evidencias registradas en evidence_vault/
                    </td>
                  </tr>
                ) : (
                  events.map((ev, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1f2937' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#38bdf8' }}>{ev.evidenceId}</td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{ev.timestamp}</td>
                      <td style={{ padding: '12px 16px' }}>{ev.user}</td>
                      <td style={{ padding: '12px 16px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.promptSummary}</td>
                      <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>{ev.scenario || 'General L7 Guard'}</td>
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
      </main>
    </div>
  );
}
