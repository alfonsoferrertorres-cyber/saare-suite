// saare-suite/src/Login.jsx
import React, { useState } from 'react';
import { SAARE_CONFIG } from './config/saareState';
import { API_HOST } from './api/api';

const normalizePlan = (plan) => {
  if (plan === 'DISCOVER_FREE' || plan === 'sandbox') return 'SANDBOX_FREE';
  if (plan === 'TRIAL_COMPLIANCE_7D' || plan === 'COMPLIANCE_249' || plan === 'starter') return 'STARTER_199';
  if (plan === 'TRIAL_PRO_7D' || plan === 'professional') return 'PROFESSIONAL_649';
  if (plan === 'ENTERPRISE_1500' || plan === 'enterprise') return 'ENTERPRISE_1990';
  return plan || 'SANDBOX_FREE';
};

export default function Login({ initialPlan = 'SANDBOX_FREE', onLoginSuccess, onBack }) {
  const [authMode, setAuthMode] = useState(
    initialPlan === 'SANDBOX_FREE' || initialPlan === 'DISCOVER_FREE' ? 'REGISTER' : 'LOGIN'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [planType, setPlanType] = useState(() => normalizePlan(initialPlan));
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const getCleanBaseUrl = () => {
    const raw = String(API_HOST || 'https://api.saare.es').trim().replace(/\/+$/, '');
    return raw.replace(/\/api\/v1$/i, '').replace(/\/v1$/i, '');
  };

  const saveSessionAndProceed = (user, token) => {
    const activeToken = token || user?.apiKey || '';
    const tenantName = user?.tenantName || user?.tenantId || user?.company || SAARE_CONFIG?.DEFAULT_TENANT || 'ENTERPRISE';
    const cleanEmail = user?.email || email.trim().toLowerCase();
    const assignedRole = user?.role || SAARE_CONFIG?.DEFAULT_ROLE || 'CISO_ADMIN';

    localStorage.setItem('saare_token', activeToken);
    localStorage.setItem('saare_auth_token', activeToken);
    localStorage.setItem('saare_user_email', cleanEmail);
    localStorage.setItem('saare_user_role', assignedRole);
    localStorage.setItem('saare_tenant_domain', tenantName);

    const sessionUser = {
      email: cleanEmail,
      name: user?.name || tenantName,
      tenantName: tenantName,
      tenantId: tenantName,
      role: assignedRole,
      plan: user?.plan || planType,
      apiKey: user?.apiKey || activeToken,
      verified: true
    };
    localStorage.setItem('saare_session_user', JSON.stringify(sessionUser));

    setLoading(false);
    if (typeof onLoginSuccess === 'function') {
      onLoginSuccess(sessionUser);
    } else {
      const consoleUrl = (import.meta.env.VITE_CONSOLE_URL || 'https://console.saare.es').replace(/\/$/, '');
      window.location.href = `${consoleUrl}/?token=${encodeURIComponent(activeToken)}&plan=${encodeURIComponent(sessionUser.plan)}`;
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const baseUrl = getCleanBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json'
        },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      const data = await res.json();

      if (res.ok && (data.success || data.token)) {
        const u = data.user || {};
        saveSessionAndProceed(
          {
            email: u.email || cleanEmail,
            name: u.name || 'Enterprise Operator',
            tenantName: u.tenantId || u.tenantName || u.company || 'ENTERPRISE',
            role: u.role || 'CISO_ADMIN',
            plan: u.plan || 'PROFESSIONAL_649',
            apiKey: u.apiKey || data.token
          },
          data.token || u.apiKey
        );
      } else {
        setErrorMsg(data.message || data.error || 'Credenciales inválidas o cuenta sin verificar.');
      }
    } catch (err) {
      setErrorMsg('Error de conexión con el Control Plane de S.A.A.R.E.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    const cleanEmail = email.trim().toLowerCase();
    const tenantName = company.trim() || cleanEmail.split('@')[0];

    if (!password || password.trim().length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const baseUrl = getCleanBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/sandbox/provision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          companyName: tenantName,
          name: cleanEmail.split('@')[0],
          password: password.trim()
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const provisionedUser = {
          email: cleanEmail,
          name: data.user?.name || tenantName,
          tenantName: data.user?.tenantId || tenantName,
          role: data.user?.role || 'CISO_ADMIN',
          plan: 'SANDBOX_FREE',
          apiKey: data.user?.apiKey || data.token
        };
        saveSessionAndProceed(provisionedUser, data.token);
      } else {
        setErrorMsg(data.message || data.error || 'No se pudo aprovisionar el entorno Sandbox.');
      }
    } catch (err) {
      setErrorMsg('Fallo de red al registrar la organización en el Control Plane.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const baseUrl = getCleanBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/auth/reset-password-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json'
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Instrucciones enviadas desde legal@saare.es.');
        setAuthMode('VERIFY');
      } else {
        setErrorMsg(data.message || data.error || 'No se pudo procesar la solicitud.');
      }
    } catch (err) {
      setErrorMsg('Error de conexión con el servicio de correo legal.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const baseUrl = getCleanBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json'
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() })
      });
      const data = await res.json();

      if (res.ok && (data.success || data.token)) {
        saveSessionAndProceed(
          data.user || {
            email: email.trim().toLowerCase(),
            name: 'Operador Validado',
            tenantName: 'ENTERPRISE',
            role: 'CISO_ADMIN'
          },
          data.token
        );
      } else {
        setErrorMsg(data.message || data.error || 'Código de verificación inválido o expirado.');
      }
    } catch (err) {
      setErrorMsg('Error al validar el código con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-center items-center p-4 relative selection:bg-cyan-500 selection:text-slate-950">
      {typeof onBack === 'function' && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer"
        >
          <span>←</span> Volver a la Web Principal
        </button>
      )}

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center mx-auto mb-3 text-cyan-400 text-xl font-bold shadow-lg shadow-cyan-500/20">
            🛡️
          </div>
          <h2 className="text-lg font-black tracking-wider text-white uppercase">
            S.A.A.R.E. ACCESS GATE
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Infraestructura Soberana de Autorización & Bóveda Criptográfica
          </p>
        </div>

        <div className="flex border-b border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setAuthMode('LOGIN'); clearMessages(); }}
            className={`flex-1 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              authMode === 'LOGIN' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('REGISTER'); clearMessages(); }}
            className={`flex-1 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              authMode === 'REGISTER' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sandbox Gratis (2 Asientos)
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-950/60 border border-red-800/80 text-red-400 p-3 rounded-xl text-xs font-medium mb-4 flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 p-3 rounded-xl text-xs font-medium mb-4 flex items-center gap-2">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {authMode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Correo Corporativo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ciso@empresa.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => { setAuthMode('RECOVER'); clearMessages(); }}
                  className="text-[10px] font-semibold text-cyan-400 hover:underline cursor-pointer"
                >
                  ¿Olvidó su clave?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20 mt-2 cursor-pointer"
            >
              {loading ? 'Verificando Custodia...' : 'Acceder a la Consola ↗'}
            </button>
          </form>
        )}

        {authMode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded-xl text-[11px] text-emerald-400 font-bold text-center">
              ⚡ Aprovisionamiento Instantáneo · 2 Asientos · 14 Días Sin Tarjeta
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Correo Corporativo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@empresa.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Organización / Tenant ID
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="ACME Corporation"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Contraseña (mín. 6 caracteres)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Tier de Licencia Seleccionado
              </label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="SANDBOX_FREE">Sandbox Gratuita (2 Asientos · 14 Días)</option>
                <option value="STARTER_199">Starter (199 €/mes · 10 Asientos)</option>
                <option value="PROFESSIONAL_649">Professional (649 €/mes · 50 Asientos)</option>
                <option value="ENTERPRISE_1990">Enterprise (1.990 €/mes · 250 Asientos)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 mt-2 cursor-pointer"
            >
              {loading ? 'Aprovisionando Entorno...' : 'Activar Sandbox Gratuita (2 Asientos) ↗'}
            </button>
          </form>
        )}

        {authMode === 'RECOVER' && (
          <form onSubmit={handleRecoverSubmit} className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Introduce tu correo corporativo para emitir una clave de acceso provisional.
            </p>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operador@empresa.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-amber-600/20 cursor-pointer"
            >
              {loading ? 'Emitiendo...' : 'Solicitar Clave Provisional'}
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('LOGIN'); clearMessages(); }}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 font-semibold pt-2 block cursor-pointer"
            >
              ← Volver al inicio de sesión
            </button>
          </form>
        )}

        {authMode === 'VERIFY' && (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
            <p className="text-xs text-emerald-400 leading-relaxed">
              Introduce el código enviado a <strong>{email}</strong> desde <code className="text-white bg-slate-950 px-1 py-0.5 rounded">legal@saare.es</code>.
            </p>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Código / Token
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-base text-cyan-400 font-mono tracking-widest text-center focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              {loading ? 'Validando...' : 'Verificar e Ingresar'}
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('LOGIN'); clearMessages(); }}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 font-semibold pt-2 block cursor-pointer"
            >
              ← Cancelar
            </button>
          </form>
        )}

        <div className="mt-8 pt-4 border-t border-slate-800/80 text-center">
          <span className="text-[10px] font-mono text-slate-500">
            Trust Anchor: {SAARE_CONFIG?.TRUST_ANCHOR || 'SAARE-MD-IPRES-2026'} | Spec: {SAARE_CONFIG?.SPEC_VERSION || 'SGP 1.0'}
          </span>
        </div>
      </div>
    </div>
  );
}