import React, { useState, useEffect } from 'react';

export default function App() {
  const [emailInput, setEmailInput] = useState('ciso@empresa.es');
  const [passwordInput, setPasswordInput] = useState('Password123!');
  const [loginError, setLoginError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [sessionUser, setSessionUser] = useState(
    localStorage.getItem('saare_soc_user') ? JSON.parse(localStorage.getItem('saare_soc_user')) : null
  );
  
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('CONECTANDO...');

  // Función validada de descarga de certificado pericial
  const exportEvidence = (log) => {
    const cert = {
      plataforma: "S.A.A.R.E. AI Runtime Security",
      normativa: "ISO 42001 / EU AI ACT",
      evidencia_id: log.evidenceId || log.id || 'EV-LOCAL',
      timestamp: log.timestamp || new Date().toISOString(),
      usuario: log.user || log.userAnonymized || 'OPERADOR',
      prompt_interceptado: log.promptContent || log.promptSnippet || log.prompt || log.promptSummary || '',
      decision_dlp: log.decision || log.verdict || log.status || 'RECHAZADO',
      firma_digital: log.sha256DataHash || log.signature || log.hash || 'SHA256-PENDING'
    };
    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CERTIFICADO_' + (cert.evidencia_id) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const fetchLogs = async () => {
    try {
      // Intento primario a /api/v1/events, respaldo a /api/logs
      let res = await fetch('http://localhost:3001/api/v1/events', { credentials: 'omit' }).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch('http://localhost:3001/api/logs', { credentials: 'omit' }).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        setLogs(data.events || data.logs || (Array.isArray(data) ? data : []));
        setStatus('CONECTADO (PUERTO 3001)');
      } else {
        setStatus('DISCONNECTED');
      }
    } catch (err) {
      setStatus('DISCONNECTED');
    }
  };

  useEffect(() => {
    if (sessionUser) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 2000);
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
    setSessionUser(null);
  };

  const now = Date.now();

  // VISTA 1: GATEWAY DE LOGIN
  if (!sessionUser) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f1d', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', padding: '20px' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.3rem', margin: '0 0 8px 0', color: '#00d2ff' }}>SAARE OPERATION CENTER v2.5</h1>
            <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>Autenticación Criptográfica Auditor L7</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '4px' }}>CORREO SOC / AUDITOR</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#0b0f19', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#aaa', marginBottom: '4px' }}>CONTRASEÑA</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#0b0f19', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
            </div>

            {loginError && (
              <div style={{ padding: '8px', background: '#450a0a', border: '1px solid #ef4444', borderRadius: '6px', color: '#fca5a5', fontSize: '0.75rem', textAlign: 'center' }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loadingLogin}
              style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '6px' }}
            >
              {loadingLogin ? 'Validando...' : '🔒 Iniciar Sesión Criptográfica'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // VISTA 2: PANEL FORENSE VALIDADO CON TELEMETRÍA EN TIEMPO REAL
  return (
    <div style={{ padding: '24px', backgroundColor: '#0b0f19', color: '#fff', fontFamily: 'monospace', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.3rem', color: '#00d2ff' }}>SAARE OPERATION CENTER V2.5 - REGISTRO DE EVIDENCIA PERICIAL</h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem' }}>
            ESTADO NODO LOCAL: <strong style={{ color: status.includes('CONECTADO') ? '#00ff88' : '#ff4444' }}>{status}</strong> | COMPLIANCE: <span style={{ color: '#00d2ff' }}>ISO 42001 / EU AI ACT</span> | AUDITOR: <span style={{ color: '#e2e8f0' }}>{sessionUser.email}</span>
          </p>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 14px', background: '#1f2937', color: '#cbd5e1', border: '1px solid #374151', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
          Cerrar Sesión
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '24px', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333', color: '#888', fontSize: '0.85rem' }}>
            <th style={{ padding: '12px 10px' }}>ID EVIDENCIA</th>
            <th>TIMESTAMP</th>
            <th>PROMPT INTERCEPTADO L7</th>
            <th>USUARIO</th>
            <th>DECISIÓN DLP</th>
            <th>FIRMA SHA-256</th>
            <th style={{ textAlign: 'center' }}>ACCIÓN</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>Esperando interceptaciones de prompts en evidence_vault/...</td></tr>
          ) : (
            logs.map((log, index) => {
              const logTime = new Date(log.timestamp).getTime() || 0;
              const isRecent = (now - logTime) < 10000;
              const decision = log.decision || log.verdict || log.status || 'RECHAZADO';
              const isBlocked = decision === 'RECHAZADO';

              return (
                <tr key={index} style={{
                  borderBottom: '1px solid #1a2234',
                  backgroundColor: isRecent ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                  transition: 'background-color 0.5s ease'
                }}>
                  <td style={{ padding: '12px 10px', color: isRecent ? '#00ff88' : '#e2b340', fontWeight: 'bold' }}>
                    {isRecent ? '► [NUEVO] ' : ''}{log.evidenceId || log.id || 'EV-' + index}
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{log.timestamp || new Date().toISOString()}</td>
                  <td style={{ color: '#fff', fontWeight: 'bold', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.promptContent || log.promptSnippet || log.prompt || log.promptSummary || 'PROMPT SIN MARCA'}
                  </td>
                  <td style={{ color: '#00d2ff' }}>{log.user || log.userAnonymized || 'OPERADOR'}</td>
                  <td style={{ color: isBlocked ? '#ff4444' : '#00ff88', fontWeight: 'bold' }}>
                    {decision}
                  </td>
                  <td style={{ fontSize: '11px', color: '#a78bfa', fontFamily: 'monospace' }}>
                    {(log.sha256DataHash || log.signature || log.hash || 'a29d21f5bf04f769').substring(0, 20)}...
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => exportEvidence(log)}
                      style={{ padding: '4px 8px', background: '#1e293b', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      📥 Certificado
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
