import React, { useState } from 'react';
import { API_BASE_URL } from './utils/api';

export default function Login({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('LOGIN'); // 'LOGIN' | 'REGISTER' | 'RECOVER'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const saveSessionAndProceed = (user, token) => {
    localStorage.setItem('saare_token', token);
    localStorage.setItem('saare_auth_token', token);
    localStorage.setItem('saare_user_email', user.email);
    localStorage.setItem('saare_tenant_domain', user.tenantName || 'ENTERPRISE');
    localStorage.setItem('saare_session_user', JSON.stringify(user));
    setLoading(false);
    onLoginSuccess(user);
  };

  // 1. Inicio de Sesión
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        saveSessionAndProceed(data.user, data.token || data.user.apiKey);
      } else {
        setErrorMsg(data.error || 'Credenciales de custodio inválidas o cuenta pendiente de verificación.');
      }
    } catch (err) {
      setErrorMsg('Error de conexión con el Control Plane de SAARE.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Registro de Usuario (Verificación por correo en 15 minutos)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail;
    const tenantName = company.trim() || (cleanEmail.includes('@') ? cleanEmail.split('@')[1].split('.')[0].toUpperCase() : 'ENTERPRISE');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: cleanEmail, 
          password: password.trim(), 
          name: cleanName,
          company: tenantName 
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message || '📩 Registro recibido. Se ha enviado un correo desde legal@saare.es para verificar la cuenta (validez 15 minutos).');
      } else {
        setErrorMsg(data.error || 'No se pudo aprovisionar la cuenta en el sistema.');
      }
    } catch (err) {
      setErrorMsg('Fallo de red al registrar la organización en el Control Plane.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Solicitud de Recuperación
  const handleRecoverSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password-request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg('Si el correo está registrado, se han enviado las instrucciones desde legal@saare.es.');
      } else {
        setErrorMsg(data.error || 'No se pudo procesar la solicitud.');
      }
    } catch (err) {
      setErrorMsg('Error de red al conectar con el servicio de correo legal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '16px' }}>
      <div style={{ background: '#0b0f19', border: '1px solid #1e293b', borderRadius: '16px', width: '100%', maxWidth: '440px', padding: '36px', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
        
        {/* Cabecera */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '52px', height: '52px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #0284c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', color: '#38bdf8', fontSize: '1.4rem' }}>
            🛡️
          </div>
          <h2 style={{ margin: '0 0 6px 0', color: '#f8fafc', fontSize: '1.3rem', fontWeight: '900', letterSpacing: '0.02em' }}>
            S.A.A.R.E. ACCESS GATE
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.78rem', fontWeight: '600' }}>
            Infraestructura Soberana de Autorización y GRC
          </p>
        </div>

        {/* Navegación de Modos */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', marginBottom: '20px' }}>
          <button 
            type="button" 
            onClick={() => { setAuthMode('LOGIN'); clearMessages(); }} 
            style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: authMode === 'LOGIN' ? '2px solid #0284c7' : 'none', color: authMode === 'LOGIN' ? '#38bdf8' : '#94a3b8', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer' }}
          >
            Iniciar Sesión
          </button>
          <button 
            type="button" 
            onClick={() => { setAuthMode('REGISTER'); clearMessages(); }} 
            style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: authMode === 'REGISTER' ? '2px solid #10b981' : 'none', color: authMode === 'REGISTER' ? '#34d399' : '#94a3b8', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer' }}
          >
            Nuevo Usuario (Demo)
          </button>
        </div>

        {/* Alertas */}
        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', padding: '10px 14px', borderRadius: '6px', fontSize: '0.78rem', marginBottom: '16px', fontWeight: '700' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '10px 14px', borderRadius: '6px', fontSize: '0.78rem', marginBottom: '16px', fontWeight: '700', lineHeight: 1.4 }}>
            ✅ {successMsg}
          </div>
        )}

        {/* LOGIN */}
        {authMode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Correo Corporativo</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operador@empresa.com" style={{ width: '100%', background: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '10px 12px', color: '#f8fafc', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Contraseña</label>
                <button type="button" onClick={() => { setAuthMode('RECOVER'); clearMessages(); }} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer', padding: 0 }}>¿Olvidó su contraseña?</button>
              </div>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', background: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '10px 12px', color: '#f8fafc', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', marginTop: '6px', boxShadow: '0 4px 12px rgba(2,132,199,0.3)' }}>
              {loading ? 'Verificando Custodia...' : 'Iniciar Sesión SOC ↗'}
            </button>
          </form>
        )}

        {/* REGISTRO */}
        {authMode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid #10b981', padding: '8px', borderRadius: '6px', fontSize: '11px', color: '#34d399', textAlign: 'center', fontWeight: 'bold' }}>
              ⚡ Alta de Organización y Verificación por Correo (15 min)
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Nombre Completo</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Operador CISO" style={{ width: '100%', background: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '10px 12px', color: '#f8fafc', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Correo Corporativo</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@empresa.com" style={{ width: '100%', background: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '10px 12px', color: '#f8fafc', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Organización / Tenant ID</label>
              <input type="text" required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="ACME Corporation" style={{ width: '100%', background: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '10px 12px', color: '#f8fafc', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Contraseña</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', background: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '10px 12px', color: '#f8fafc', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#10b981', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', marginTop: '6px' }}>
              {loading ? 'Aprovisionando...' : 'Solicitar Verificación por Correo ↗'}
            </button>
          </form>
        )}

        {/* RECUPERACIÓN */}
        {authMode === 'RECOVER' && (
          <form onSubmit={handleRecoverSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4' }}>
              Introduce tu correo electrónico corporativo registrado para recibir instrucciones desde <code>legal@saare.es</code>.
            </p>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Correo Electrónico</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operador@empresa.com" style={{ width: '100%', background: '#020617', border: '1px solid #334155', borderRadius: '6px', padding: '10px 12px', color: '#f8fafc', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', marginTop: '6px' }}>
              {loading ? 'Emitiendo...' : 'Solicitar Restablecimiento'}
            </button>

            <button type="button" onClick={() => { setAuthMode('LOGIN'); clearMessages(); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', textAlign: 'center' }}>
              ← Volver al inicio de sesión
            </button>
          </form>
        )}

        {/* Pie */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #1e293b', paddingTop: '12px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#64748b' }}>
            Trust Anchor Node: SAARE-MD-IPRES-2026
          </span>
        </div>

      </div>
    </div>
  );
}