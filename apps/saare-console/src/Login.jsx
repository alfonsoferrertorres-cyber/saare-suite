import React, { useState } from 'react';
import { api, API_HOST } from './utils/api';
import { SAARE_CONFIG } from './config/saareState';

const setDualStorage = (key, value) => {
  if (!key) return;
  try {
    if (value) {
      window.localStorage?.setItem(key, value);
      window.sessionStorage?.setItem(key, value);
    } else {
      window.localStorage?.removeItem(key);
      window.sessionStorage?.removeItem(key);
    }
  } catch {
    // Ignorar restricciones de almacenamiento
  }
};

const getDualStorage = (key) => {
  if (!key) return '';
  try {
    return window.sessionStorage?.getItem(key) || window.localStorage?.getItem(key) || '';
  } catch {
    return '';
  }
};

const parseJsonSafely = async (response) => {
  const rawText = await response.text();
  if (!rawText) return {};
  try {
    return JSON.parse(rawText);
  } catch {
    return { message: rawText };
  }
};

export default function Login({ onLoginSuccess, onBack, selectedPlan = '' }) {
  const [authMode, setAuthMode] = useState('SANDBOX');
  const [email, setEmail] = useState(() => getDualStorage('saare_user_email') || '');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [tenant, setTenant] = useState(() => getDualStorage('saare_tenant_domain') || '');
  const [role, setRole] = useState(() => getDualStorage('saare_user_role') || 'CISO_ADMIN');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const persistSession = ({ token, userEmail, userRole, tenantDomain, planId, apiKey }) => {
    const cleanToken = String(token || '').replace(/^Bearer\s+/i, '').trim();
    if (cleanToken) {
      setDualStorage('saare_token', cleanToken);
      setDualStorage('saare_auth_token', cleanToken);
    }
    if (userEmail) setDualStorage('saare_user_email', userEmail);
    if (userRole) setDualStorage('saare_user_role', userRole);
    if (tenantDomain) {
      setDualStorage('saare_tenant_domain', tenantDomain);
      setDualStorage('saare_tenant', tenantDomain);
    }
    if (planId) setDualStorage('saare_plan_id', planId);
    if (apiKey) setDualStorage('saare_api_key', apiKey);
    setDualStorage('saare_consent_accepted', 'true');
  };

  const handleActivationSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setErrorMsg('Debe aceptar los términos de operación para continuar.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanTenant = tenant.trim();

    if (!cleanEmail || !password) {
      setErrorMsg('Introduzca su correo corporativo y contraseña.');
      return;
    }

    if (authMode === 'SANDBOX') {
      if (!cleanTenant) {
        setErrorMsg('Indique el nombre de la empresa u organismo.');
        return;
      }
      if (password.trim().length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
    }

    setLoading(true);
    setErrorMsg('');

    const baseUrl = String(SAARE_CONFIG?.CONTROL_PLANE_URL || API_HOST || '')
      .trim()
      .replace(/\/+$/, '');

    try {
      if (authMode === 'SANDBOX') {
        const res = await fetch(`${baseUrl}/api/v1/sandbox/provision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            companyName: cleanTenant,
            name: fullName.trim() || cleanEmail.split('@')[0],
            password: password.trim()
          })
        });

        const data = await parseJsonSafely(res);
        if (!res.ok || !data.success || !data.token) {
          throw new Error(data.message || data.error || `Error ${res.status} al aprovisionar el entorno.`);
        }

        const provisionedTenant = data.user?.tenantId || cleanTenant;
        const provisionedRole = data.user?.role || 'CISO_ADMIN';

        persistSession({
          token: data.token,
          userEmail: cleanEmail,
          userRole: provisionedRole,
          tenantDomain: provisionedTenant,
          planId: data.user?.planId || selectedPlan,
          apiKey: data.user?.apiKey
        });

        setLoading(false);
        onLoginSuccess({
          token: data.token,
          email: cleanEmail,
          role: provisionedRole,
          tenantName: provisionedTenant,
          apiKey: data.user?.apiKey,
          plan: data.user?.planId || selectedPlan,
          maxSeats: data.maxSeats
        });
        return;
      }

      const authResponse = await api.login(cleanEmail, password, cleanTenant);
      const token = authResponse?.token || getDualStorage('saare_token') || '';
      if (!token) {
        throw new Error('La respuesta de autenticación no incluyó un token válido.');
      }

      const verifiedEmail = authResponse?.user?.email || cleanEmail;
      const verifiedTenant = authResponse?.user?.tenantId || cleanTenant;
      const verifiedRole = authResponse?.user?.role || role;
      const verifiedPlan = authResponse?.user?.planId || selectedPlan;

      persistSession({
        token,
        userEmail: verifiedEmail,
        userRole: verifiedRole,
        tenantDomain: verifiedTenant,
        planId: verifiedPlan,
        apiKey: authResponse?.user?.apiKey
      });

      setLoading(false);
      onLoginSuccess({
        token,
        email: verifiedEmail,
        role: verifiedRole,
        tenantName: verifiedTenant,
        apiKey: authResponse?.user?.apiKey,
        plan: verifiedPlan
      });
    } catch (err) {
      const rawMessage = String(err?.message || '');
      const friendlyMessage =
        rawMessage.includes('401') || rawMessage.toLowerCase().includes('unauthorized')
          ? 'Credenciales inválidas o sesión no autorizada para el tenant indicado (HTTP 401).'
          : rawMessage || 'Error en el proceso de autenticación.';
      setErrorMsg(friendlyMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="bg-[#0b0f19] border border-[#1e293b] rounded-2xl max-w-xl w-full p-8 shadow-2xl space-y-6">
        <div className="p-4 bg-[#020617] border border-[#1e293b] rounded-xl text-center">
          <h1 className="text-base font-black text-[#f59e0b] tracking-wider uppercase">
            Sistema de Alineamiento, Auditoría y Resiliencia Estructural
          </h1>
          <p className="text-[11px] text-slate-400 font-mono mt-1">S.A.A.R.E. CONSOLE GRC</p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 bg-[#020617] border border-[#1e293b] rounded-xl">
          <button
            type="button"
            onClick={() => {
              setAuthMode('SANDBOX');
              setErrorMsg('');
            }}
            className={`py-2.5 px-3 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
              authMode === 'SANDBOX'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Alta Sandbox
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('LOGIN');
              setErrorMsg('');
            }}
            className={`py-2.5 px-3 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
              authMode === 'LOGIN'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Acceso Operador
          </button>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-base font-extrabold uppercase text-slate-100 tracking-wide">
            {authMode === 'SANDBOX'
              ? 'ALTA DE ENTORNO SANDBOX MULTITENANT'
              : 'ACCESO A NODO MULTITENANT Y BÓVEDA D1'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Configura tu sesión aislada por tenant para operar en la consola GRC.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg text-center font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleActivationSubmit} className="space-y-4">
          {authMode === 'SANDBOX' && (
            <div>
              <label className="block text-[11px] font-mono font-bold text-emerald-400 uppercase mb-1">
                NOMBRE DEL RESPONSABLE:
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nombre y apellidos"
                className="w-full bg-[#020617] border border-[#1e293b] rounded-lg px-3 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono font-bold text-sky-400 uppercase mb-1">
              CORREO CORPORATIVO:
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operador@organizacion.es"
              className="w-full bg-[#020617] border border-[#1e293b] rounded-lg px-3 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-sky-400 uppercase mb-1">
              CONTRASEÑA:
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#020617] border border-[#1e293b] rounded-lg px-3 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold text-sky-400 uppercase mb-1">
                EMPRESA / TENANT:
              </label>
              <input
                type="text"
                required={authMode === 'SANDBOX'}
                value={tenant}
                onChange={(e) => setTenant(e.target.value)}
                placeholder="Identificador de tenant"
                className="w-full bg-[#020617] border border-[#1e293b] rounded-lg px-3 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-sky-400 uppercase mb-1">
                ROL DE OPERADOR:
              </label>
              <select
                value={authMode === 'SANDBOX' ? 'CISO_ADMIN' : role}
                disabled={authMode === 'SANDBOX'}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] rounded-lg px-3 py-2.5 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-sky-500 cursor-pointer disabled:opacity-80"
              >
                <option value="CISO_ADMIN">CISO ADMIN (L4)</option>
                <option value="CISO_SECOPS_LEVEL_3">SECOPS (L3)</option>
                <option value="DPO_GRC_LEVEL_2">DPO GRC (L2)</option>
                <option value="BOARD_EXECUTIVE_LEVEL_1">EXECUTIVE (L1)</option>
                <option value="OPERATIONAL_AGENT_USER">AGENT (L0)</option>
              </select>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 accent-emerald-500 cursor-pointer w-4 h-4"
            />
            <label
              htmlFor="terms"
              className="text-[11px] text-slate-400 leading-snug cursor-pointer select-none"
            >
              Acepto los términos operativos del tenant y la trazabilidad de auditoría asociada a mi sesión.
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <button
              type="button"
              onClick={
                onBack ||
                (() => {
                  setEmail('');
                  setPassword('');
                  setTenant('');
                })
              }
              className="w-full py-3 bg-[#1e293b] hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition uppercase tracking-wider cursor-pointer"
            >
              {onBack ? 'VOLVER' : 'LIMPIAR'}
            </button>

            <button
              type="submit"
              disabled={!acceptedTerms || loading}
              className="w-full py-3 bg-[#10b981] hover:bg-[#059669] disabled:bg-slate-800 text-slate-950 font-black rounded-xl text-xs transition uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading
                ? 'PROCESANDO...'
                : authMode === 'SANDBOX'
                  ? 'CREAR ENTORNO Y ENTRAR'
                  : 'ACTIVAR SESIÓN Y ENTRAR'}
            </button>
          </div>
        </form>

        {SAARE_CONFIG?.TRUST_ANCHOR && (
          <div className="text-center text-[10px] font-mono text-slate-500 border-t border-[#1e293b] pt-3">
            Trust Anchor: {SAARE_CONFIG.TRUST_ANCHOR}
          </div>
        )}
      </div>
    </div>
  );
}