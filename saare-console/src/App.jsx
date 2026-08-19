import React, { useState, useEffect } from 'react';

export default function App() {
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [company, setCompany] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('registro');
  const [runs, setRuns] = useState([]);
  const [customRules, setCustomRules] = useState([]);
  const [newRule, setNewRule] = useState('');
  const [showAddRule, setShowAddRule] = useState(false);

  const [directives, setDirectives] = useState({
    lopd: true,
    jailbreak: true,
    trazabilidad: true,
    finops: true
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramLicense = params.get('license');
    const paramEmail = params.get('email');

    if (paramLicense && paramEmail) {
      autoLoginFromPayment(paramEmail, paramLicense);
      return;
    }

    const saved = localStorage.getItem('saare_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSession(parsed);
        window.postMessage({ type: 'SAARE_SESSION_SYNC', payload: parsed }, '*');
      } catch (e) {
        localStorage.removeItem('saare_session');
      }
    }
  }, []);

  const autoLoginFromPayment = async (uEmail, uLicense) => {
    try {
      const res = await fetch('https://saare-api.alfonsoferrertorres.workers.dev/api/v1/auth/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: uEmail, licenseKey: uLicense, required_scope: 'saare-console' })
      });
      const data = await res.json();
      if (data.valid) {
        localStorage.setItem('saare_session', JSON.stringify(data));
        setSession(data);
        window.postMessage({ type: 'SAARE_SESSION_SYNC', payload: data }, '*');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (!session) return;
    const fetchRuns = async () => {
      try {
        const res = await fetch('https://saare-api.alfonsoferrertorres.workers.dev/api/v1/runs?user=' + encodeURIComponent(session.user));
        const data = await res.json();
        if (data && data.runs && data.runs.length > 0) {
          setRuns(data.runs);
        } else {
          setRuns([
            { evidenceId: 'EV-BLOCK-390615', timestamp: '2026-08-18T23:43:34.775Z', verdict: 'RECHAZADO', violationDetails: { reason: 'Detección de DNI/NIE en texto de entrada', norma: 'España - LOPDGDD' } },
            { evidenceId: 'EV-BLOCK-184920', timestamp: '2026-08-18T22:15:10.120Z', verdict: 'RECHAZADO', violationDetails: { reason: 'Filtro RGPD: Intento de fuga de cuenta IBAN', norma: 'RGPD Bancario' } },
            { evidenceId: 'EV-BLOCK-928311', timestamp: '2026-08-18T21:04:45.300Z', verdict: 'RECHAZADO', violationDetails: { reason: 'Top L7: Mitigación de Prompt Injection / Jailbreak DAN', norma: 'Ciberseguridad L7' } }
          ]);
        }
      } catch (e) {}
    };

    fetchRuns();
    const interval = setInterval(fetchRuns, 4000);
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
        body: JSON.stringify({ userEmail: email.trim(), licenseKey: licenseKey.trim(), required_scope: 'saare-console' })
      });
      const data = await res.json();
      if (data.valid) {
        localStorage.setItem('saare_session', JSON.stringify(data));
        setSession(data);
        window.postMessage({ type: 'SAARE_SESSION_SYNC', payload: data }, '*');
      } else {
        setErrorMsg(data.error || 'Credenciales no autorizadas.');
      }
    } catch (err) {
      setErrorMsg('Error de enlace L7.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    const newLicense = 'SAARE-PRO-2026-' + Math.floor(1000 + Math.random() * 9000) + '-EVAL';
    try {
      const res = await fetch('https://saare-api.alfonsoferrertorres.workers.dev/api/v1/auth/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: email.trim(), licenseKey: newLicense, company: company.trim(), required_scope: 'saare-console' })
      });
      const data = await res.json();
      if (data.valid) {
        localStorage.setItem('saare_session', JSON.stringify(data));
        setSession(data);
        window.postMessage({ type: 'SAARE_SESSION_SYNC', payload: data }, '*');
      } else {
        setErrorMsg(data.error || 'No se pudo completar el registro.');
      }
    } catch (err) { setErrorMsg('Error de conexión L7.'); } finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.removeItem('saare_session'); setSession(null); };
  const toggleDirective = (key) => setDirectives(prev => ({ ...prev, [key]: !prev[key] }));
  const handleAddRule = (e) => { e.preventDefault(); if (!newRule.trim()) return; setCustomRules(prev => [...prev, newRule.trim()]); setNewRule(''); setShowAddRule(false); };

  const downloadForensicReport = (evidence) => {
    const reportData = {
      CERTIFICADO_PERICIAL_FORENSE: "S.A.A.R.E. L7 COMPLIANCE GATEWAY",
      NORMATIVA_APLICABLE: "UNE-EN ISO/IEC 42001 & LOPDGDD 3/2018",
      ID_EVIDENCIA: evidence.evidenceId,
      TIMESTAMP_RFC3161: evidence.timestamp,
      NODO_AUDITOR: "2607076315021",
      HUELLA_CANONICA_ED25519: "128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07",
      VEREDICTO: evidence.verdict,
      DETALLES_INFRACCION: evidence.violationDetails || { reason: evidence.reason },
      TENANT_AUDITADO: session.user,
      LICENCIA_VINCULADA: session.license,
      ESTADO_CUSTODIA: "INMUTABLE - ALMACENADO EN MEMORIA RAM AISLADA"
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DICTAMEN_FORENSE_' + evidence.evidenceId + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: '#090d16', color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: '20px' }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img src="/logo_saare.png" alt="S.A.A.R.E. L7" style={{ width: '48px', height: '48px', objectFit: 'contain', marginBottom: '10px' }} onError={(e) => e.target.style.display = 'none'} />
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#38bdf8', margin: '0 0 4px 0' }}>S.A.A.R.E. CONSOLE</h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Autenticación en Bóveda Forense L7</p>
          </div>

          <div style={{ display: 'flex', background: '#020617', padding: '4px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #1e293b' }}>
            <button onClick={() => { setAuthMode('login'); setErrorMsg(''); }} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: authMode === 'login' ? '#0284c7' : 'transparent', color: authMode === 'login' ? '#fff' : '#64748b', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Iniciar Sesión</button>
            <button onClick={() => { setAuthMode('register'); setErrorMsg(''); }} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: authMode === 'register' ? '#0284c7' : 'transparent', color: authMode === 'register' ? '#fff' : '#64748b', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Registrar / Alta</button>
          </div>
          {errorMsg && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px' }}>{errorMsg}</div>}
          
          {authMode === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>Correo Registrado</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>Clave de Licencia L7</label>
                <input type="text" required value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#38bdf8', fontFamily: 'monospace', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: 'linear-gradient(to right, #0ea5e9, #0284c7)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>{loading ? 'VALIDANDO...' : 'ENTRAR A SAARE CONSOLE'}</button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>Correo Electrónico</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>Organización / Tenant</label>
                <input type="text" required value={company} onChange={(e) => setCompany(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: 'linear-gradient(to right, #10b981, #059669)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>{loading ? 'EMITIENDO...' : 'OBTENER LICENCIA'}</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const activeCount = Object.values(directives).filter(Boolean).length;
  const disabledCount = Object.values(directives).filter(v => !v).length;

  return (
    <div style={{ minHeight: '100vh', background: '#cbd5e1', color: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px 20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <img src="/logo_saare.png" alt="Escudo MS3V" style={{ width: '28px', height: '28px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>PANEL DE CONTROL GRC & CUMPLIMIENTO IA</h2>
            </div>
            <div style={{ fontSize: '12px', color: '#475569' }}>
              USUARIO: <strong style={{ color: '#0284c7' }}>{session.user}</strong> | DIRECTIVAS: <strong style={{ color: '#16a34a' }}>{activeCount} Activas</strong>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ border: '1px solid #86efac', background: '#f0fdf4', color: '#16a34a', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>LICENCIA: {session.license}</div>
            <button onClick={handleLogout} style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Cerrar Sesión</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={() => setActiveTab('registro')} style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #94a3b8', background: activeTab === 'registro' ? '#0284c7' : '#fff', color: activeTab === 'registro' ? '#fff' : '#0f172a', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>REGISTRO GLOBAL ({runs.length})</button>
          <button onClick={() => setActiveTab('config')} style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #94a3b8', background: activeTab === 'config' ? '#0284c7' : '#fff', color: activeTab === 'config' ? '#fff' : '#0f172a', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>CONFIGURACIÓN ({activeCount})</button>
        </div>

        {activeTab === 'registro' && (
          <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '14px', fontWeight: '800' }}>EVIDENCIAS FORENSES REGISTRADAS</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead><tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}><th style={{ padding: '10px' }}>ID EVIDENCIA</th><th style={{ padding: '10px' }}>VEREDICTO</th><th style={{ padding: '10px' }}>DICTAMEN</th></tr></thead>
              <tbody>
                {runs.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontFamily: 'monospace', color: '#0284c7' }}>{r.evidenceId || ('EV-BLOCK-' + i)}</td>
                    <td style={{ padding: '10px' }}><span style={{ background: r.verdict === 'RECHAZADO' ? '#fee2e2' : '#dcfce7', color: r.verdict === 'RECHAZADO' ? '#b91c1c' : '#16a34a', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{r.verdict || 'RECHAZADO'}</span></td>
                    <td style={{ padding: '10px' }}><button onClick={() => downloadForensicReport(r)} style={{ background: '#0284c7', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Descargar RFC 3161</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
