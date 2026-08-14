import React, { useState, useEffect } from 'react';

export default function App() {
  const [emailInput, setEmailInput] = useState('ciso@empresa.es');
  const [passwordInput, setPasswordInput] = useState('Password123!');
  const [loginError, setLoginError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [sessionUser, setSessionUser] = useState(localStorage.getItem('saare_soc_user') ? JSON.parse(localStorage.getItem('saare_soc_user')) : null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('saare_soc_token') || '');
  
  const [activeTab, setActiveTab] = useState('logs');
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);

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
        <div style={{ maxWidth: '440px', width: '100%', background: '#111827', border: '1px solid #1f2937', borderRadius: '16px', padding: '36px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '48px', height: '48px', background: '#1e3a8a', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '12px' }}>🛡️</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.025em', margin: '0 0 6px 0' }}>S.A.A.R.E. CONSOLE SOC</h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>Autenticação Criptográfica Auditor L7</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: '500' }}>CORREO SOC / AUDITOR</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
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
            <span style={{ fontSize: '0.75rem', color: '#10b981' }}>● Auditor: {sessionUser.email} | Org: {sessionUser.tenantName}</span>
          </div>
        </div>
        <button onClick={handleLogout} style={{ padding: '6px 12px', background: '#374151', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </header>

      <main style={{ padding: '24px' }}>
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Bóveda Local de Evidencias Selladas</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total eventos sincronizados: {events.length}</p>
        </div>
      </main>
    </div>
  );
}
