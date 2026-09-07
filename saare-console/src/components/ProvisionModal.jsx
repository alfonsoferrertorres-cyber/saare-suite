import React, { useState } from 'react';

const API_BASE = "https://api.saare.es/api/v1";
const CONSOLE_URL = "https://console.saare.es";

export default function ProvisionModal({ isOpen, onClose, allowClose = false }) {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [planType, setPlanType] = useState('TRIAL_7D');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Introduce un correo corporativo válido.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar el código de verificación.');
      setIsEmailSent(true);
      setMessage('Código de verificación enviado a tu correo.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setErrorMsg('Introduce el código OTP.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: otpCode.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Código de verificación incorrecto.');
      setIsEmailVerified(true);
      setMessage('Correo verificado exitosamente.');
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/register-validated`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          company: company.trim() || email.split('@')[1].split('.')[0].toUpperCase(),
          planType
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en el proceso de registro.');
      
      localStorage.setItem('saare_session_user', JSON.stringify(data.user));
      localStorage.setItem('saare_auth_token', data.token);
      
      if (onClose) onClose();
      
      const targetUrl = data.redirectUrl || `${CONSOLE_URL}/?user=${encodeURIComponent(data.user.email)}&token=${encodeURIComponent(data.token)}`;
      window.location.href = targetUrl;
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciales inválidas.');
      
      localStorage.setItem('saare_session_user', JSON.stringify(data.user));
      localStorage.setItem('saare_auth_token', data.token);
      
      if (onClose) onClose();
      
      const targetUrl = data.redirectUrl || `${CONSOLE_URL}/?user=${encodeURIComponent(data.user.email)}&token=${encodeURIComponent(data.token)}`;
      window.location.href = targetUrl;
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(3,7,18,0.9)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, padding: '20px' }} onClick={() => allowClose && onClose && onClose()}>
      <div style={{ maxWidth: '440px', width: '100%', backgroundColor: '#0b1120', border: '1px solid #1e293b', borderRadius: '16px', padding: '28px', color: '#fff', boxShadow: '0 25px 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', margin: '0 0 6px 0' }}>SAARE-SUITE ACCESS</h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Identifícate o regístrate para acceder a la Demo L7 y servicios.</p>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', marginBottom: '20px' }}>
          <button type="button" onClick={() => { setTab('login'); setErrorMsg(''); setMessage(''); }} style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: tab === 'login' ? '2px solid #0284c7' : 'none', color: tab === 'login' ? '#38bdf8' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer' }}>
            Entrar
          </button>
          <button type="button" onClick={() => { setTab('register'); setErrorMsg(''); setMessage(''); }} style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: tab === 'register' ? '2px solid #0284c7' : 'none', color: tab === 'register' ? '#38bdf8' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer' }}>
            Registro / Demo L7
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>CORREO CORPORATIVO</label>
              <input type="email" required placeholder="usuario@empresa.com" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid #334155', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>CONTRASEÑA</label>
              <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid #334155', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '6px' }}>
              {loading ? 'Accediendo...' : 'Entrar a SAARE-Suite ↗'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>1. VALIDACIÓN PREVIA DE CORREO</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input type="email" disabled={isEmailVerified} placeholder="usuario@empresa.com" value={email} onChange={e => setEmail(e.target.value)} style={{ flex: 1, padding: '10px', background: '#030712', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} />
                {!isEmailVerified && (
                  <button type="button" onClick={handleSendOtp} disabled={loading} style={{ padding: '10px', background: '#1e293b', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                    Enviar OTP
                  </button>
                )}
              </div>
            </div>

            {isEmailSent && !isEmailVerified && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <input type="text" maxLength={6} placeholder="Código OTP de 6 dígitos" value={otpCode} onChange={e => setOtpCode(e.target.value)} style={{ flex: '1', padding: '10px', background: '#030712', border: '1px solid #0284c7', borderRadius: '6px', color: '#fff', textAlign: 'center', letterSpacing: '4px' }} />
                <button type="button" onClick={handleVerifyOtp} disabled={loading} style={{ padding: '10px 14px', background: '#10b981', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', color: '#000', fontSize: '11px' }}>
                  Confirmar
                </button>
              </div>
            )}

            {isEmailVerified && (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
                <input type="text" required placeholder="Nombre de Empresa" value={company} onChange={e => setCompany(e.target.value)} style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid #334155', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                <input type="password" required placeholder="Definir Contraseña (Mín. 8 caracteres)" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', background: '#030712', border: '1px solid #334155', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }} />
                
                <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                  <label style={{ flex: 1, padding: '8px', background: planType === 'TRIAL_7D' ? '#0f172a' : '#030712', border: `1px solid ${planType === 'TRIAL_7D' ? '#0284c7' : '#1e293b'}`, borderRadius: '6px', cursor: 'pointer' }}>
                    <input type="radio" name="plan" checked={planType === 'TRIAL_7D'} onChange={() => setPlanType('TRIAL_7D')} /> Demo L7 (7D)
                  </label>
                  <label style={{ flex: 1, padding: '8px', background: planType === 'AUDITOR_SEAT' ? '#0f172a' : '#030712', border: `1px solid ${planType === 'AUDITOR_SEAT' ? '#10b981' : '#1e293b'}`, borderRadius: '6px', cursor: 'pointer' }}>
                    <input type="radio" name="plan" checked={planType === 'AUDITOR_SEAT'} onChange={() => setPlanType('AUDITOR_SEAT')} /> Suscripción
                  </label>
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#10b981', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {loading ? 'Aprovisionando...' : 'Completar y Entrar ↗'}
                </button>
              </form>
            )}
          </div>
        )}

        {message && <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(52,211,153,0.1)', color: '#34d399', borderRadius: '6px', fontSize: '11px', textAlign: 'center' }}>{message}</div>}
        {errorMsg && <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: '6px', fontSize: '11px', textAlign: 'center' }}>{errorMsg}</div>}

        {allowClose && (
          <button type="button" onClick={onClose} style={{ width: '100%', background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', marginTop: '12px' }}>
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}