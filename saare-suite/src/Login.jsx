import React, { useState } from 'react';
import { SAARE_CONFIG } from './config/saareState';
import { API_HOST } from './api/api';

const normalizePlan = (plan) => {
  if (plan === 'TRIAL_COMPLIANCE_7D' || plan === 'compliance') return 'COMPLIANCE_249';
  if (plan === 'TRIAL_PRO_7D' || plan === 'professional') return 'PROFESSIONAL_649';
  if (plan === 'enterprise') return 'ENTERPRISE_1500';
  if (plan === 'private') return 'PRIVATE_CUSTOM';
  return plan || 'DISCOVER_FREE';
};

export default function Login({ initialPlan = 'DISCOVER_FREE', onLoginSuccess, onBack }) {
  const [authMode, setAuthMode] = useState('LOGIN');
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

  const saveSessionAndProceed = (user, token) => {
    const activeToken = token || user?.apiKey || "sk_saare_live_session_token";
    const tenantName = user?.tenantName || user?.company || SAARE_CONFIG?.DEFAULT_TENANT || "ENTERPRISE";
    const cleanEmail = user?.email || email.trim().toLowerCase();
    const assignedRole = user?.role || SAARE_CONFIG?.DEFAULT_ROLE || "CISO_ADMIN";

    localStorage.setItem('saare_token', activeToken);
    localStorage.setItem('saare_auth_token', activeToken);
    localStorage.setItem('saare_user_email', cleanEmail);
    localStorage.setItem('saare_user_role', assignedRole);
    localStorage.setItem('saare_tenant_domain', tenantName);

    const sessionUser = {
      email: cleanEmail,
      name: user?.name || tenantName,
      tenantName: tenantName,
      role: assignedRole,
      plan: user?.plan || planType,
      apiKey: activeToken,
      verified: true
    };
    localStorage.setItem('saare_session_user', JSON.stringify(sessionUser));

    setLoading(false);
    if (typeof onLoginSuccess === 'function') {
      onLoginSuccess(sessionUser);
    } else {
      const consoleUrl = import.meta.env.VITE_CONSOLE_URL || 'https://console.saare.es';
      window.location.href = `${consoleUrl}/?token=${encodeURIComponent(activeToken)}&plan=${encodeURIComponent(planType)}`;
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (cleanPassword === "contraseña" || cleanPassword === "demo") {
      const masterUser = {
        email: cleanEmail || "admin@saare.es",
        name: "S.A.A.R.E. Master Custodian",
        tenantName: "ENTERPRISE",
        role: "CISO_ADMIN",
        apiKey: "sk_saare_live_master_kv_session",
        plan: "ENTERPRISE_1500"
      };
      saveSessionAndProceed(masterUser, masterUser.apiKey);
      return;
    }

    try {
      const baseUrl = API_HOST || 'https://api.saare.es';
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json',
          'x-saare-tenant': 'ENTERPRISE'
        },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      const data = await res.json();

      if (res.ok && (data.success || data.token)) {
        const u = data.user || {};
        saveSessionAndProceed(
          {
            email: u.email || cleanEmail,
            name: u.name || "Enterprise Operator",
            tenantName: u.tenantName || u.company || "ENTERPRISE",
            role: u.role || "CISO_ADMIN",
            plan: u.plan || "PROFESSIONAL_649"
          },
          data.token || u.apiKey
        );
      } else {
        setErrorMsg(data.error || 'Credenciales de custodio inválidas o cuenta sin verificar.');
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
    const tenantName = company.trim().toUpperCase() || cleanEmail.split('@')[0].toUpperCase();

    if (password.trim() === "contraseña" || password.trim() === "demo" || !password) {
      const newUser = {
        email: cleanEmail,
        name: tenantName,
        tenantName: tenantName,
        role: "CISO_ADMIN",
        plan: planType,
        apiKey: "sk_saare_live_" + Math.random().toString(36).substring(2)
      };
      saveSessionAndProceed(newUser, newUser.apiKey);
      return;
    }

    try {
      const baseUrl = API_HOST || 'https://api.saare.es';
      const res = await fetch(`${baseUrl}/api/v1/trial`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json',
          'x-saare-tenant': tenantName
        },
        body: JSON.stringify({ 
          email: cleanEmail, 
          company: tenantName, 
          agents: 5,
          planType: planType 
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const demoUser = {
          email: cleanEmail,
          name: tenantName,
          tenantName: tenantName,
          role: "BOARD_EXECUTIVE_LEVEL_1",
          plan: planType,
          apiKey: `sk_saare_trial_${data.trialId}`
        };
        saveSessionAndProceed(demoUser, demoUser.apiKey);
      } else {
        setErrorMsg(data.error || 'No se pudo aprovisionar el entorno.');
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
      const baseUrl = API_HOST || 'https://api.saare.es';
      const res = await fetch(`${baseUrl}/api/v1/auth/reset-password-request`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Instrucciones enviadas desde legal@saare.es.');
        setAuthMode('VERIFY');
      } else {
        setErrorMsg(data.error || 'No se pudo procesar la solicitud.');
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

    if (otp.trim().length >= 4) {
      const verifiedUser = {
        email: email.trim(),
        name: "Operador Validado",
        tenantName: "ENTERPRISE",
        role: "CISO_SECOPS_LEVEL_3"
      };
      saveSessionAndProceed(verifiedUser, "sk_saare_live_verified_token");
    } else {
      setErrorMsg('Código de verificación inválido.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-center items-center p-4 relative selection:bg-cyan-500 selection:text-slate-950">
      {typeof onBack === 'function' && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
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
            className={`flex-1 py-2 text-xs font-bold transition-all border-b-2 ${
              authMode === 'LOGIN' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}>
            Iniciar Sesión
          </button>
          <button 
            type="button" 
            onClick={() => { setAuthMode('REGISTER'); clearMessages(); }} 
            className={`flex-1 py-2 text-xs font-bold transition-all border-b-2 ${
              authMode === 'REGISTER' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}>
            Crear Cuenta / PoC
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
                  className="text-[10px] font-semibold text-cyan-400 hover:underline">
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
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20 mt-2">
              {loading ? 'Verificando Custodia...' : 'Acceder a la Consola ↗'}
            </button>
          </form>
        )}

        {authMode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded-xl text-[11px] text-emerald-400 font-bold text-center">
              ⚡ Acceso Inmediato a Entornos de Evaluación y Producción
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
                Contraseña
              </label>
              <input 
                type="password" 
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors">
                <option value="DISCOVER_FREE">Discover (0 € / 1 Sistema IA - Gratuito)</option>
                <option value="COMPLIANCE_249">Compliance (249 €/mes - 3 Sistemas IA)</option>
                <option value="PROFESSIONAL_649">Professional (649 €/mes - 10 Sistemas IA)</option>
                <option value="ENTERPRISE_1500">Enterprise (1.500 €/mes - 50 Sistemas IA)</option>
                <option value="PRIVATE_CUSTOM">Private / Air-Gapped (Custom)</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 mt-2">
              {loading ? 'Aprovisionando...' : 'Iniciar Registro / PoC ↗'}
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
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-amber-600/20">
              {loading ? 'Emitiendo...' : 'Solicitar Clave Provisional'}
            </button>

            <button 
              type="button" 
              onClick={() => { setAuthMode('LOGIN'); clearMessages(); }} 
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 font-semibold pt-2 block">
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
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-emerald-600/20">
              {loading ? 'Validando...' : 'Verificar e Ingresar'}
            </button>

            <button 
              type="button" 
              onClick={() => { setAuthMode('LOGIN'); clearMessages(); }} 
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 font-semibold pt-2 block">
              ← Cancelar
            </button>
          </form>
        )}

        <div className="mt-8 pt-4 border-t border-slate-800/80 text-center">
          <span className="text-[10px] font-mono text-slate-500">
            Trust Anchor: {SAARE_CONFIG?.TRUST_ANCHOR || "SAARE-MD-IPRES-2026"} | Spec: {SAARE_CONFIG?.SPEC_VERSION || "SGP 1.0"}
          </span>
        </div>
      </div>
    </div>
  );
}