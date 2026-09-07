import React, { useState } from 'react';

const API_BASE = "https://api.saare.es/api/v1";
const CONSOLE_URL = "https://console.saare.es";

export default function ProvisionModal({ isOpen, onClose }) {
  // Pestañas: 'login' | 'register' | 'forgot'
  const [tab, setTab] = useState('login');

  // Estados de formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [planType, setPlanType] = useState('TRIAL_7D'); // 'TRIAL_7D' o 'AUDITOR_SEAT'

  // Flujo de validación previa de correo
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Estados UI
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Paso 1: Enviar OTP al correo corporativo
  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Introduce una dirección de correo válida.');
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
      if (!res.ok) throw new Error(data.error || 'Fallo al enviar correo de validación.');

      setIsEmailSent(true);
      setMessage(data.otpPreview 
        ? `Código enviado. (Modo prueba: ${data.otpPreview})` 
        : 'Código de validación enviado a su bandeja de entrada.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Verificar el código OTP
  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setErrorMsg('Introduce el código de 6 dígitos recibido.');
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
      if (!res.ok) throw new Error(data.error || 'Código incorrecto.');

      setIsEmailVerified(true);
      setMessage('Correo validado. Ya puedes definir tu contraseña y registrarte.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Paso 3A: Envío de Registro Final
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isEmailVerified) {
      setErrorMsg('Debes validar tu dirección de correo antes de completar el registro.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe contener al menos 6 caracteres.');
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
      if (!res.ok) throw new Error(data.error || 'Error al consolidar registro en Bóveda KL.');

      // Guardar credenciales de sesión local
      localStorage.setItem('saare_session_user', JSON.stringify(data.user));
      localStorage.setItem('saare_auth_token', data.token);

      window.location.href = data.redirectUrl || `${CONSOLE_URL}/?user=${encodeURIComponent(data.user.email)}&token=${encodeURIComponent(data.token)}&tenant=${encodeURIComponent(data.user.tenantName)}&status=ACTIVE`;
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Paso 3B: Iniciar Sesión (Usuario + Contraseña)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciales no autorizadas.');

      localStorage.setItem('saare_session_user', JSON.stringify(data.user));
      localStorage.setItem('saare_auth_token', data.token);

      window.location.href = data.redirectUrl || `${CONSOLE_URL}/?user=${encodeURIComponent(data.user.email)}&token=${encodeURIComponent(data.token)}&tenant=${encodeURIComponent(data.user.tenantName)}&status=ACTIVE`;
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Paso 3C: Recuperar Contraseña
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Introduce el correo con el que te registraste.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo procesar la solicitud.');

      setMessage(data.tempPasswordPreview 
        ? `Contraseña provisional emitida: ${data.tempPasswordPreview}` 
        : 'Se ha enviado una nueva contraseña provisional a su correo.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(3, 7, 18, 0.88)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, padding: '20px'
    }} onClick={onClose}>
      <div style={{
        maxWidth: '460px', width: '100%', backgroundColor: '#0b1120',
        borderRadius: '16px', border: '1px solid #1e293b', padding: '32px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9)', color: '#f8fafc',
        fontFamily: '"Inter", system-ui, sans-serif'
      }} onClick={(e) => e.stopPropagation()}>

        {/* SELECTOR DE PESTAÑAS (ENTRAR / REGISTRAR) */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMsg(''); setMessage(''); }}
            style={{
              flex: 1, padding: '10px', background: 'none', border: 'none',
              borderBottom: tab === 'login' ? '2px solid #0284c7' : 'none',
              color: tab === 'login' ? '#38bdf8' : '#94a3b8', fontWeight: 'bold',
              cursor: 'pointer', fontSize: '13px'
            }}
          >
            Entrar a SAARE
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMsg(''); setMessage(''); }}
            style={{
              flex: 1, padding: '10px', background: 'none', border: 'none',
              borderBottom: tab === 'register' ? '2px solid #0284c7' : 'none',
              color: tab === 'register' ? '#38bdf8' : '#94a3b8', fontWeight: 'bold',
              cursor: 'pointer', fontSize: '13px'
            }}
          >
            Registrar Nuevo Usuario
          </button>
        </div>

        {/* ======================================================== */}
        {/* PESTAÑA 1: INICIAR SESIÓN */}
        {/* ======================================================== */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                CORREO CORPORATIVO (USUARIO SAARE)
              </label>
              <input
                type="email"
                required
                placeholder="usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                CONTRASEÑA
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => { setTab('forgot'); setErrorMsg(''); setMessage(''); }}
                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: loading ? 'default' : 'pointer' }}
            >
              {loading ? 'Verificando en Bóveda KL...' : 'Iniciar Sesión ↗'}
            </button>
          </form>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 2: REGISTRO CON VALIDACIÓN PREVIA DE EMAIL */}
        {/* ======================================================== */}
        {tab === 'register' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Paso 1: Introducir y Validar Email */}
            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                1. VALIDACIÓN PREVIA DE CORREO CORPORATIVO
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  disabled={isEmailVerified}
                  placeholder="responsable@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ flex: 1, padding: '10px 12px', background: '#030712', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                />
                {!isEmailVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    style={{ padding: '10px 12px', background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Enviar Código
                  </button>
                )}
              </div>
            </div>

            {isEmailSent && !isEmailVerified && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Código OTP (6 dígitos)"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  style={{ flex: 1, padding: '10px 12px', background: '#030712', border: '1px solid #0284c7', borderRadius: '6px', color: '#fff', fontSize: '13px', textAlign: 'center', letterSpacing: '4px' }}
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  style={{ padding: '10px 16px', background: '#10b981', color: '#000', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Confirmar Correo
                </button>
              </div>
            )}

            {/* Paso 2: Datos de acceso una vez validado */}
            {isEmailVerified && (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #1e293b', paddingTop: '12px' }}>
                <span style={{ color: '#34d399', fontSize: '11.5px', fontWeight: 'bold' }}>
                  ✓ Correo validado: {email}
                </span>

                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                    NOMBRE DE LA EMPRESA / ORGANIZACIÓN
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Empresa S.L."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                    DEFINIR CONTRASEÑA DE ACCESO
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                    MODALIDAD DE REGISTRO
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <label style={{ flex: 1, padding: '10px', background: planType === 'TRIAL_7D' ? '#0f172a' : '#030712', border: `1px solid ${planType === 'TRIAL_7D' ? '#0284c7' : '#1e293b'}`, borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
                      <input
                        type="radio"
                        name="plan"
                        value="TRIAL_7D"
                        checked={planType === 'TRIAL_7D'}
                        onChange={() => setPlanType('TRIAL_7D')}
                        style={{ marginRight: '6px' }}
                      />
                      <strong>Prueba 7 Días</strong> (Aviso ex-ante en Bóveda KL)
                    </label>

                    <label style={{ flex: 1, padding: '10px', background: planType === 'AUDITOR_SEAT' ? '#0f172a' : '#030712', border: `1px solid ${planType === 'AUDITOR_SEAT' ? '#10b981' : '#1e293b'}`, borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
                      <input
                        type="radio"
                        name="plan"
                        value="AUDITOR_SEAT"
                        checked={planType === 'AUDITOR_SEAT'}
                        onChange={() => setPlanType('AUDITOR_SEAT')}
                        style={{ marginRight: '6px' }}
                      />
                      <strong>Asiento Auditor (1 Año)</strong> (Control Dual-Vault)
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', padding: '12px', background: planType === 'AUDITOR_SEAT' ? '#10b981' : '#0284c7', color: planType === 'AUDITOR_SEAT' ? '#000' : '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: loading ? 'default' : 'pointer', marginTop: '4px' }}
                >
                  {loading ? 'Aprovisionando...' : 'Completar Registro y Acceder ↗'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 3: RECUPERAR CONTRASEÑA */}
        {/* ======================================================== */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              Introduce tu correo validado y el Control Plane te emitirá una nueva clave provisional cifrada en Bóveda KL.
            </p>

            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                CORREO REGISTRADO
              </label>
              <input
                type="email"
                required
                placeholder="usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', background: '#030712', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', background: '#eab308', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: loading ? 'default' : 'pointer' }}
            >
              {loading ? 'Generando credencial provisional...' : 'Enviar Nueva Contraseña al Correo'}
            </button>

            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMsg(''); setMessage(''); }}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer' }}
            >
              ← Volver al inicio de sesión
            </button>
          </form>
        )}

        {/* MENSAJES Y ERRORES */}
        {message && (
          <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(52,211,153,0.1)', border: '1px solid #10b981', color: '#34d399', borderRadius: '6px', fontSize: '12px', textAlign: 'center' }}>
            {message}
          </div>
        )}
        {errorMsg && (
          <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '6px', fontSize: '12px', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{ width: '100%', background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', marginTop: '14px' }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}