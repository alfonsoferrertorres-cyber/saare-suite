// saare-console/src/Login.jsx — Access & Activation Gate S.A.A.R.E. (SGP 1.0 / JWT + Sandbox 2 Asientos Perpetuo)
import React, { useState } from 'react';
import { api, API_BASE_URL } from './utils/api';

export default function Login({ onLoginSuccess, onBack, selectedPlan = 'SANDBOX_FREE' }) {
  const [authMode, setAuthMode] = useState('SANDBOX'); // 'SANDBOX' | 'LOGIN'
  const [email, setEmail] = useState(() => localStorage.getItem('saare_user_email') || '');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [tenant, setTenant] = useState(() => localStorage.getItem('saare_tenant_domain') || '');
  const [role, setRole] = useState(() => localStorage.getItem('saare_user_role') || 'CISO_ADMIN');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const persistSession = ({ token, userEmail, userRole, tenantDomain, planId, apiKey }) => {
    localStorage.setItem('saare_token', token);
    localStorage.setItem('saare_auth_token', token);
    localStorage.setItem('saare_user_email', userEmail);
    localStorage.setItem('saare_user_role', userRole);
    localStorage.setItem('saare_tenant_domain', tenantDomain);
    localStorage.setItem('saare_plan_id', planId);
    if (apiKey) localStorage.setItem('saare_api_key', apiKey);
    localStorage.setItem('saare_consent_accepted', 'true');
    localStorage.setItem('saare_agnostic_active', 'true');
  };

  const handleActivationSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setErrorMsg('Debe aceptar los términos de inspección ex-ante para continuar.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanTenant = tenant.trim();

    if (!cleanEmail || !password) {
      setErrorMsg('Por favor introduzca su correo de trabajo y contraseña de acceso.');
      return;
    }

    if (authMode === 'SANDBOX') {
      if (!cleanTenant) {
        setErrorMsg('Indique el nombre de su empresa u organismo para aislar su entorno Sandbox.');
        return;
      }
      if (password.trim().length < 6) {
        setErrorMsg('La contraseña de la Sandbox debe tener al menos 6 caracteres.');
        return;
      }
    }

    setLoading(true);
    setErrorMsg('');

    const normalizedTenantLogin = cleanTenant.toUpperCase() || 'ORGANISMO_DEFAULT';
    const agnosticCommandPayload = {
      command: 'INICIAR_CUMPLIMIENTO_EXANTE_SAARE',
      witnessTag: '[MS3V-COMPLIANCE-L7-OK]',
      mode: 'AGNOSTIC_UNIVERSAL_LLM_ENFORCEMENT',
      operatorEmail: cleanEmail,
      tenantDomain: normalizedTenantLogin,
      role: authMode === 'SANDBOX' ? 'CISO_ADMIN' : role,
      planType: authMode === 'SANDBOX' ? 'SANDBOX_FREE' : selectedPlan,
      timestamp: new Date().toISOString()
    };

    try {
      // MODO 1: ALTA INSTANTÁNEA EN SANDBOX GRATUITA PERPETUA DE 2 ASIENTOS (SIN TARJETA)
      if (authMode === 'SANDBOX') {
        const res = await fetch(`${API_BASE_URL}/api/v1/sandbox/provision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            companyName: cleanTenant,
            name: fullName.trim() || cleanEmail.split('@')[0],
            password: password.trim()
          })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || data.error || 'No se pudo aprovisionar la Sandbox.');
        }

        const provisionedTenant = data.user?.tenantId || normalizedTenantLogin;
        const provisionedRole = data.user?.role || 'CISO_ADMIN';

        persistSession({
          token: data.token,
          userEmail: cleanEmail,
          userRole: provisionedRole,
          tenantDomain: provisionedTenant,
          planId: 'SANDBOX_FREE',
          apiKey: data.user?.apiKey
        });

        setLoading(false);
        onLoginSuccess({
          token: data.token,
          email: cleanEmail,
          role: provisionedRole,
          tenantName: provisionedTenant,
          apiKey: data.user?.apiKey,
          plan: 'SANDBOX_FREE',
          maxSeats: data.maxSeats || 2,
          expiresAt: null,
          agnosticPayload: {
            ...agnosticCommandPayload,
            tenantDomain: provisionedTenant,
            planType: 'SANDBOX_FREE'
          }
        });
        return;
      }

      // MODO 2: AUTENTICACIÓN DE OPERADOR EXISTENTE (JWT)
      const authResponse = await api.login(cleanEmail, password, normalizedTenantLogin);

      const token = authResponse.token || localStorage.getItem('saare_token');
      const verifiedEmail = authResponse.user?.email || cleanEmail;
      const verifiedTenant = authResponse.user?.tenantId || normalizedTenantLogin;
      const verifiedRole = authResponse.user?.role || role;
      const verifiedPlan = authResponse.user?.planId || selectedPlan;

      persistSession({
        token,
        userEmail: verifiedEmail,
        userRole: verifiedRole,
        tenantDomain: verifiedTenant,
        planId: verifiedPlan,
        apiKey: authResponse.user?.apiKey
      });

      setLoading(false);
      onLoginSuccess({
        token,
        email: verifiedEmail,
        role: verifiedRole,
        tenantName: verifiedTenant,
        apiKey: authResponse.user?.apiKey,
        plan: verifiedPlan,
        agnosticPayload: {
          ...agnosticCommandPayload,
          tenantDomain: verifiedTenant,
          role: verifiedRole,
          planType: verifiedPlan
        }
      });
    } catch (err) {
      console.warn('[SAARE GATE] Verificación Backend:', err.message);

      if (authMode === 'SANDBOX') {
        setErrorMsg(err.message || 'Error al crear el entorno Sandbox gratuito.');
        setLoading(false);
        return;
      }

      if (err.message && !err.message.includes('offline') && !err.message.includes('conexión')) {
        setErrorMsg(err.message || 'Credenciales de acceso no válidas.');
        setLoading(false);
        return;
      }

      // Fallback de Resiliencia Local si el servidor es inalcanzable
      const localToken = `sk_saare_local_exante_${Date.now()}`;
      persistSession({
        token: localToken,
        userEmail: cleanEmail,
        userRole: role,
        tenantDomain: normalizedTenantLogin,
        planId: selectedPlan
      });

      setLoading(false);
      onLoginSuccess({
        token: localToken,
        email: cleanEmail,
        role,
        tenantName: normalizedTenantLogin,
        plan: selectedPlan,
        agnosticPayload: agnosticCommandPayload
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="bg-[#0b0f19] border border-[#1e293b] rounded-2xl max-w-xl w-full p-8 shadow-2xl space-y-6">

        <div className="p-4 bg-[#020617] border border-[#1e293b] rounded-xl text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-sky-500/10 border border-sky-500/30 rounded-lg mb-2">
            🧠
          </div>
          <h1 className="text-base font-black text-[#f59e0b] tracking-wider uppercase">
            Sistema de Alineamiento, Auditoría y Resiliencia Estructural
          </h1>
          <p className="text-[11px] text-slate-400 font-mono mt-1">S.A.A.R.E. CONSOLE GRC v12.5 / SGP 1.0</p>
        </div>

        {/* SELECTOR DE MODO: SANDBOX PERPETUA 2 ASIENTOS VS ACCESO EXISTENTE */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#020617] border border-[#1e293b] rounded-xl">
          <button
            type="button"
            onClick={() => { setAuthMode('SANDBOX'); setErrorMsg(''); }}
            className={`py-2.5 px-3 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
              authMode === 'SANDBOX'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🧪 Sandbox Gratis (2 Asientos)
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('LOGIN'); setErrorMsg(''); }}
            className={`py-2.5 px-3 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
              authMode === 'LOGIN'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔐 Acceso Operador
          </button>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-base font-extrabold uppercase text-slate-100 tracking-wide">
            {authMode === 'SANDBOX'
              ? 'ALTA INSTANTÁNEA SANDBOX PERPETUA (2 ASIENTOS · 0 €)'
              : 'ACTIVACIÓN DEL MÓDULO HÍBRIDO EX-ANTE Y BÓVEDA D1'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            {authMode === 'SANDBOX' ? (
              <>
                Despliegue inmediato y <strong className="text-emerald-400">sin límite de días ni tarjeta</strong> con <strong className="text-emerald-400">2 asientos CISO/DPO</strong>, <strong className="text-sky-400">1.000 veredictos L7/mes</strong> y acceso completo a GRC, Proxy L7 y Bóveda WORM.
              </>
            ) : (
              <>
                Al confirmar el acceso a la <strong className="text-sky-400">Consola GRC S.A.A.R.E. (SGP 1.0)</strong>, se validarán sus credenciales y se activará su perímetro <strong className="text-emerald-400">BLOCK LOGIC Ex-Ante D1</strong>.
              </>
            )}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg text-center font-mono">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleActivationSubmit} className="space-y-4">
          {authMode === 'SANDBOX' && (
            <div>
              <label className="block text-[11px] font-mono font-bold text-emerald-400 uppercase mb-1">
                NOMBRE DEL RESPONSABLE / CISO EVALUADOR:
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Ana García (CISO)"
                className="w-full bg-[#020617] border border-[#1e293b] rounded-lg px-3 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono font-bold text-sky-400 uppercase mb-1">
              CORREO DE TRABAJO / OPERADOR RESPONSABLE:
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@organizacion.es"
              className="w-full bg-[#020617] border border-[#1e293b] rounded-lg px-3 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-sky-400 uppercase mb-1">
              {authMode === 'SANDBOX'
                ? 'CREA TU CONTRASEÑA DE ACCESO (MÍN. 6 CARACTERES):'
                : 'CONTRASEÑA / CREDENCIAL DE ACCESO:'}
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
                {authMode === 'SANDBOX' ? 'EMPRESA / ORGANISMO:' : 'ORGANISMO / TENANT:'}
              </label>
              <input
                type="text"
                required={authMode === 'SANDBOX'}
                value={tenant}
                onChange={(e) => setTenant(e.target.value)}
                placeholder={authMode === 'SANDBOX' ? 'Ej. Acme Corp SL' : 'Opcional (se detecta por email)'}
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
                <option value="CISO_ADMIN">👑 CISO ADMIN (L4)</option>
                <option value="CISO_SECOPS_LEVEL_3">🛡️ SECOPS (L3)</option>
                <option value="DPO_GRC_LEVEL_2">⚖️ DPO GRC (L2)</option>
                <option value="BOARD_EXECUTIVE_LEVEL_1">📈 EXECUTIVE (L1)</option>
                <option value="OPERATIONAL_AGENT_USER">⚙️ AGENT (L0)</option>
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
            <label htmlFor="terms" className="text-[11px] text-slate-400 leading-snug cursor-pointer select-none">
              Acepto los términos de inspección ex-ante L7, sellado en Bóveda D1 y autorizo la inyección del comando semántico de seguridad.
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <button
              type="button"
              onClick={onBack || (() => { setEmail(''); setPassword(''); })}
              className="w-full py-3 bg-[#1e293b] hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition uppercase tracking-wider cursor-pointer"
            >
              {onBack ? 'VOLVER A CONSOLA' : 'LIMPIAR'}
            </button>

            <button
              type="submit"
              disabled={!acceptedTerms || loading}
              className="w-full py-3 bg-[#10b981] hover:bg-[#059669] disabled:bg-slate-800 text-slate-950 font-black rounded-xl text-xs transition uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading
                ? (authMode === 'SANDBOX' ? 'CREANDO SANDBOX...' : 'VERIFICANDO CREDENCIALES...')
                : (authMode === 'SANDBOX' ? '🚀 CREAR SANDBOX PERPETUA Y ENTRAR' : '🛡️ ACEPTAR, ACTIVAR NODO L7 Y ENTRAR')}
            </button>
          </div>
        </form>

        <div className="text-center text-[10px] font-mono text-slate-500 border-t border-[#1e293b] pt-3">
          Trust Anchor: https://vault.saare.es | Safe Creative ID: 2607076315021
        </div>

      </div>
    </div>
  );
}