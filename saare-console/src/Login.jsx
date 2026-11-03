// saare-console/src/Login.jsx — Access & Activation Gate S.A.A.R.E. (SGP 1.0)
import React, { useState } from 'react';
import { API_BASE_URL } from './utils/api';

export default function Login({ onLoginSuccess, onBack, selectedPlan = 'DISCOVER_FREE' }) {
  const [email, setEmail] = useState(() => localStorage.getItem('saare_user_email') || 'ciso@saare.es');
  const [tenant, setTenant] = useState(() => localStorage.getItem('saare_tenant_domain') || 'ENTERPRISE');
  const [role, setRole] = useState(() => localStorage.getItem('saare_user_role') || 'CISO_ADMIN');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleActivationSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setErrorMsg('Debe aceptar los términos de inspección ex-ante para continuar.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase() || 'ciso@saare.es';
    const cleanTenant = tenant.trim().toUpperCase() || 'ENTERPRISE';

    const agnosticCommandPayload = {
      command: 'Iniciar_cumplimiento_exante_saare --route-vault=D1',
      witnessTag: '[MS3V-COMPLIANCE-L7-OK]',
      mode: 'AGNOSTIC_UNIVERSAL_LLM_ENFORCEMENT',
      operatorEmail: cleanEmail,
      tenantDomain: cleanTenant,
      role: role,
      planType: selectedPlan,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-saare-cmd': agnosticCommandPayload.command
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password || 'demo',
          tenant: cleanTenant,
          role: role,
          plan: selectedPlan,
          agnosticPayload: agnosticCommandPayload
        })
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        const token = data.token || `sk_saare_agnostic_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        
        localStorage.setItem('saare_token', token);
        localStorage.setItem('saare_user_email', cleanEmail);
        localStorage.setItem('saare_user_role', role);
        localStorage.setItem('saare_tenant_domain', cleanTenant);
        localStorage.setItem('saare_agnostic_active', 'true');

        onLoginSuccess({
          token,
          email: cleanEmail,
          role,
          tenantName: cleanTenant,
          plan: selectedPlan,
          agnosticPayload: agnosticCommandPayload
        });
        return;
      }
    } catch (err) {
      console.warn("[SAARE GATE] Operando en Modo Autónomo Local / Resilience Gate:", err);
    }

    const localToken = `sk_saare_local_exante_${Date.now()}`;
    localStorage.setItem('saare_token', localToken);
    localStorage.setItem('saare_user_email', cleanEmail);
    localStorage.setItem('saare_user_role', role);
    localStorage.setItem('saare_tenant_domain', cleanTenant);
    localStorage.setItem('saare_agnostic_active', 'true');

    setLoading(false);
    onLoginSuccess({
      token: localToken,
      email: cleanEmail,
      role: role,
      tenantName: cleanTenant,
      plan: selectedPlan,
      agnosticPayload: agnosticCommandPayload
    });
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
          <p className="text-[11px] text-slate-400 font-mono mt-1">S.A.A.R.E. CONSOLE GRC v10.0 / SGP 1.0</p>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-base font-extrabold uppercase text-slate-100 tracking-wide">
            ACTIVACIÓN DEL MÓDULO HÍBRIDO EX-ANTE Y BÓVEDA D1
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Al confirmar el acceso a la <strong className="text-sky-400">Consola GRC S.A.A.R.E. (SGP 1.0)</strong>, se inyectará el comando semántico del <strong className="text-emerald-400">Módulo 5 (Notario Digital Ex-Ante D1)</strong> y la Matriz de Directivas Persistentes para la intercepción agnóstica universal.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg text-center font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleActivationSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold text-sky-400 uppercase mb-1">
              CORREO DE TRABAJO / OPERADOR RESPONSABLE:
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ciso@saare.es"
              className="w-full bg-[#020617] border border-[#1e293b] rounded-lg px-3 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold text-sky-400 uppercase mb-1">
                ORGANISMO / TENANT:
              </label>
              <input 
                type="text" 
                required
                value={tenant}
                onChange={(e) => setTenant(e.target.value)}
                placeholder="ENTERPRISE"
                className="w-full bg-[#020617] border border-[#1e293b] rounded-lg px-3 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-sky-400 uppercase mb-1">
                ROL DE OPERADOR:
              </label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#020617] border border-[#1e293b] rounded-lg px-3 py-2.5 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="CISO_ADMIN">👑 CISO ADMIN (L4)</option>
                <option value="CISO_SECOPS_LEVEL_3">🛡️ SECOPS (L3)</option>
                <option value="DPO_GRC_LEVEL_2">⚖️ DPO GRC (L2)</option>
                <option value="BOARD_EXECUTIVE_LEVEL_1">📈 EXECUTIVE (L1)</option>
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
              onClick={onBack || (() => setEmail(''))}
              className="w-full py-3 bg-[#1e293b] hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition uppercase tracking-wider"
            >
              CANCELAR
            </button>

            <button 
              type="submit" 
              disabled={!acceptedTerms || loading}
              className="w-full py-3 bg-[#10b981] hover:bg-[#059669] disabled:bg-slate-800 text-slate-950 font-black rounded-xl text-xs transition uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'ACTIVANDO NODO L7...' : '🛡️ ACEPTAR, ACTIVAR NODO L7 Y ENTRAR'}
            </button>
          </div>
        </form>

        <div className="text-center text-[10px] font-mono text-slate-500 border-t border-[#1e293b] pt-3">
          Trust Anchor: https://vault.saare.es | Safe Creative ID: RPI-2607076315021
        </div>

      </div>
    </div>
  );
}