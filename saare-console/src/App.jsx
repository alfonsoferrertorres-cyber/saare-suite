import React, { useState, useEffect } from 'react';

export default function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('registro');

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

  // 1. Pantalla de Acceso Obligatorio
  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: '#090d16', color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>
              <span>&#128737;</span>
            </div>
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
                placeholder="pmaiquess@gmail.com / alfonsosb1@gmail.com"
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
                placeholder="SAARE-PRO-2026-1167-TEST"
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

  // 2. Cabecera y Consola Autenticada Dinámicamente
  return (
    <div style={{ minHeight: '100vh', background: '#0b1120', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      
      {/* CABECERA DINÁMICA CON DATOS REALES DE SESIÓN */}
      <div style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>&#128737;</span> PANEL DE CONTROL GRC & AUDITORÍA FORENSE S.A.A.R.E.
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              USUARIO: <strong style={{ color: '#f1f5f9' }}>{session.user}</strong> &nbsp;|&nbsp; 
              ROL: <strong style={{ color: '#38bdf8' }}>{session.role}</strong> &nbsp;|&nbsp; 
              TIER: <strong style={{ color: '#a7f3d0' }}>{session.tier}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', color: '#34d399', fontWeight: 'bold', fontFamily: 'monospace' }}>
              LICENCIA: {session.license}
            </div>
            <button 
              onClick={handleLogout}
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* TABS Y CONTENIDO PRINCIPAL */}
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setActiveTab('registro')}
            style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #334155', background: activeTab === 'registro' ? '#0284c7' : '#0f172a', color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
          >
            REGISTRO GLOBAL (EVIDENCIAS)
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #334155', background: activeTab === 'config' ? '#0284c7' : '#0f172a', color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
          >
            DIRECTIVAS BASE (4 ACTIVAS)
          </button>
        </div>

        {activeTab === 'registro' && (
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#38bdf8' }}>EVIDENCIAS DE INTERCEPCIÓN VINCULADAS AL TENANT</h3>
            <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '12px' }}>
              <div style={{ color: '#34d399', marginBottom: '6px' }}>✔ CUSTODIA FORENSE ACTIVA — SIN ALMACENAMIENTO EN DISCO</div>
              <div style={{ color: '#94a3b8' }}>ID Nodo: 2607076315021 | Huella Canónica: 128fa8c937f946a0...9a07</div>
              <div style={{ color: '#64748b', marginTop: '6px' }}>Sello de Tiempo RFC 3161: {session.rfc3161_timestamp}</div>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px' }}>
              <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>ESPAÑA - LOPDGDD & AEPD</div>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>Detección perimetral en RAM de DNI, NIE y datos personales.</p>
              <div style={{ marginTop: '12px', color: '#34d399', fontSize: '11px', fontWeight: 'bold' }}>● HABILITADA PERMANENTE</div>
            </div>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '18px' }}>
              <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '13px', marginBottom: '6px' }}>RGPD BANCARIO & FINANCIERO</div>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>Intercepción estricta de cuentas IBAN y números de tarjeta.</p>
              <div style={{ marginTop: '12px', color: '#34d399', fontSize: '11px', fontWeight: 'bold' }}>● HABILITADA PERMANENTE</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
