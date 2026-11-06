// saare-console/src/components/ActivationGate.jsx — Gate de Activación con Despliegue Agnóstico Ex-Ante
import React, { useState } from 'react';
import SAARE_CONFIG from '../config/saareState';

export default function ActivationGate({ onActivate, userEmail = '', initialTenant = '', initialRole = 'CISO_ADMIN' }) {
  const [email, setEmail] = useState(userEmail || localStorage.getItem('saare_user_email') || 'alfonsoferrertorres@gmail.com');
  const [tenant, setTenant] = useState(initialTenant || localStorage.getItem('saare_tenant_domain') || 'TESTEOOOOORROOR');
  const [role, setRole] = useState(initialRole || 'CISO_SECOPS_LEVEL_3');
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleActivation = (e) => {
    e.preventDefault();
    if (!acceptedTerms) return;

    setLoading(true);

    // INYECCIÓN SINTÁCTICA DEL DESPLIEGUE AGNÓSTICO PARA CUALQUIER LLM
    const agnosticCommandPayload = {
      command: SAARE_CONFIG.MODULE_5.BOOTSTRAP_COMMAND, // "Iniciar_cumplimiento_exante_saare --route-vault=D1"
      witnessTag: SAARE_CONFIG.MODULE_5.WITNESS_TAG,     // "[MS3V-COMPLIANCE-L7-OK]"
      headers: SAARE_CONFIG.ACTIVE_HEADERS,
      mode: "AGNOSTIC_UNIVERSAL_LLM_ENFORCEMENT",
      operatorEmail: email.trim().toLowerCase(),
      tenantDomain: tenant.trim().toUpperCase(),
      role: role,
      timestamp: new Date().toISOString()
    };

    // Persistencia del estado agnóstico de intercepción
    localStorage.setItem('saare_agnostic_active', 'true');
    localStorage.setItem('saare_user_email', agnosticCommandPayload.operatorEmail);
    localStorage.setItem('saare_tenant_domain', agnosticCommandPayload.tenantDomain);
    localStorage.setItem('saare_user_role', role);

    setTimeout(() => {
      setLoading(false);
      onActivate({
        token: `sk_saare_agnostic_${Date.now()}`,
        email: agnosticCommandPayload.operatorEmail,
        tenantName: agnosticCommandPayload.tenantDomain,
        role: role,
        agnosticPayload: agnosticCommandPayload
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-8 shadow-2xl space-y-6">
        
        {/* Banner S.A.A.R.E. */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
          <h1 className="text-lg font-black text-amber-400 tracking-wider">Sistema de Alineamiento, Auditoría y Resiliencia Estructural</h1>
          <p className="text-xs text-slate-400 font-mono mt-1">S.A.A.R.E. CONSOLE GRC v10.0 / SGP 1.0</p>
        </div>

        {/* Encabezado del Gate */}
        <div className="text-center space-y-2">
          <h2 className="text-base font-extrabold uppercase text-slate-100 tracking-wide">
            ACTIVACIÓN DEL MÓDULO HÍBRIDO EX-ANTE Y BÓVEDA D1
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Al confirmar el acceso a la <strong className="text-sky-400">Consola GRC S.A.A.R.E. (SGP 1.0)</strong>, se ejecutará el <span className="text-emerald-400 font-bold">Despliegue Agnóstico L7 en la entrada</span> inyectando el comando semántico del <strong>Módulo 5 (Notario Digital Ex-Ante D1)</strong> compatible con cualquier LLM y la Matriz de Directivas Persistentes.
          </p>
        </div>

        {/* Formulario de Activación */}
        <form onSubmit={handleActivation} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold text-sky-400 uppercase mb-1">
              CORREO DE TRABAJO / OPERADOR RESPONSABLE:
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold text-sky-400 uppercase mb-1">
                ORGANISMO / TENANT:
              </label>
              <input 
                type="text" 
                required
                value={tenant}
                onChange={(e) => setTenant(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-sky-400 uppercase mb-1">
                ROL DE OPERADOR:
              </label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-sky-500"
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
              className="mt-1 accent-emerald-500 cursor-pointer"
            />
            <label htmlFor="terms" className="text-[11px] text-slate-400 leading-snug cursor-pointer">
              Acepto los términos de inspección ex-ante L7, sellado en Bóveda D1 y autorizo la inyección del comando semántico de seguridad agnóstico para cualquier LLM.
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <button 
              type="button" 
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition uppercase tracking-wider"
            >
              CANCELAR
            </button>

            <button 
              type="submit" 
              disabled={!acceptedTerms || loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-black rounded-xl text-xs transition uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {loading ? 'INYECTANDO COMANDO AGNÓSTICO...' : '🛡️ ACEPTAR, ACTIVAR NODO L7 Y ENTRAR'}
            </button>
          </div>
        </form>

        <div className="text-center text-[10px] font-mono text-slate-500 border-t border-slate-800/60 pt-3">
          Trust Anchor: {SAARE_CONFIG.TRUST_ANCHOR} | Safe Creative ID: {SAARE_CONFIG.SAFE_CREATIVE_ID}
        </div>

      </div>
    </div>
  );
}