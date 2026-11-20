// saare-console/src/components/ActivationGate.jsx
import React, { useState, useEffect } from 'react';
import SAARE_CONFIG from '../config/saareState';

export default function ActivationGate({
  onActivate,
  onCancel,
  userEmail = '',
  initialTenant = '',
  initialRole = ''
}) {
  const [email, setEmail] = useState(userEmail || '');
  const [tenant, setTenant] = useState(initialTenant || '');
  const [role, setRole] = useState(initialRole || 'CISO_ADMIN');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userEmail) setEmail(userEmail);
  }, [userEmail]);

  useEffect(() => {
    if (initialTenant) setTenant(initialTenant);
  }, [initialTenant]);

  useEffect(() => {
    if (initialRole) setRole(initialRole);
  }, [initialRole]);

  const handleActivation = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanTenant = tenant.trim().toUpperCase();
    if (!acceptedTerms || !cleanEmail || !cleanTenant) return;

    setLoading(true);

    const agnosticCommandPayload = {
      command: SAARE_CONFIG?.MODULE_5?.BOOTSTRAP_COMMAND,
      witnessTag: SAARE_CONFIG?.MODULE_5?.WITNESS_TAG,
      headers: SAARE_CONFIG?.ACTIVE_HEADERS,
      mode: 'AGNOSTIC_UNIVERSAL_LLM_ENFORCEMENT',
      operatorEmail: cleanEmail,
      tenantDomain: cleanTenant,
      role,
      timestamp: new Date().toISOString()
    };

    try {
      sessionStorage.setItem('saare_agnostic_active', 'true');
      sessionStorage.setItem('saare_user_email', cleanEmail);
      sessionStorage.setItem('saare_tenant_domain', cleanTenant);
      sessionStorage.setItem('saare_user_role', role);
    } catch {
      // Ignorar restricciones de almacenamiento en entornos aislados
    }

    setTimeout(() => {
      setLoading(false);
      if (typeof onActivate === 'function') {
        onActivate({
          email: cleanEmail,
          tenantName: cleanTenant,
          role,
          agnosticPayload: agnosticCommandPayload
        });
      }
    }, 300);
  };

  const handleCancel = () => {
    if (typeof onCancel === 'function') {
      onCancel();
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-8 shadow-2xl space-y-6">
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
          <h1 className="text-lg font-black text-amber-400 tracking-wider">
            Sistema de Alineamiento, Auditoría y Resiliencia Estructural
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">S.A.A.R.E. CONSOLE GRC</p>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-base font-extrabold uppercase text-slate-100 tracking-wide">
            ACTIVACIÓN DE NODO MULTITENANT Y BÓVEDA D1
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Confirma los datos del <strong className="text-sky-400">Tenant</strong> y del operador para inicializar la sesión aislada en la consola.
          </p>
        </div>

        <form onSubmit={handleActivation} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold text-sky-400 uppercase mb-1">
              CORREO CORPORATIVO / OPERADOR RESPONSABLE:
            </label>
            <input
              type="email"
              required
              placeholder="operador@organizacion.es"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold text-sky-400 uppercase mb-1">
                IDENTIFICADOR DE TENANT / ORGANISMO:
              </label>
              <input
                type="text"
                required
                placeholder="TENANT_ID"
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
                <option value="CISO_ADMIN">CISO ADMIN (L4)</option>
                <option value="CISO_SECOPS_LEVEL_3">SECOPS (L3)</option>
                <option value="DPO_GRC_LEVEL_2">DPO GRC (L2)</option>
                <option value="BOARD_EXECUTIVE_LEVEL_1">EXECUTIVE (L1)</option>
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
              Acepto los términos operativos del tenant y la trazabilidad de auditoría asociada a mi sesión.
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition uppercase tracking-wider cursor-pointer"
            >
              CANCELAR
            </button>

            <button
              type="submit"
              disabled={!acceptedTerms || loading || !email.trim() || !tenant.trim()}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black rounded-xl text-xs transition uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'ACTIVANDO SESIÓN...' : 'ACEPTAR Y ACTIVAR TENANT'}
            </button>
          </div>
        </form>

        {(SAARE_CONFIG?.TRUST_ANCHOR || SAARE_CONFIG?.SAFE_CREATIVE_ID) && (
          <div className="text-center text-[10px] font-mono text-slate-500 border-t border-slate-800/60 pt-3">
            {SAARE_CONFIG?.TRUST_ANCHOR ? `Trust Anchor: ${SAARE_CONFIG.TRUST_ANCHOR}` : ''}
            {SAARE_CONFIG?.TRUST_ANCHOR && SAARE_CONFIG?.SAFE_CREATIVE_ID ? ' | ' : ''}
            {SAARE_CONFIG?.SAFE_CREATIVE_ID ? `Registry ID: ${SAARE_CONFIG.SAFE_CREATIVE_ID}` : ''}
          </div>
        )}
      </div>
    </div>
  );
}