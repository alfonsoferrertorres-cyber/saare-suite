import React, { useState } from 'react';

export default function SubsidiesHub() {
  const [selectedPlan, setSelectedPlan] = useState('ENTERPRISE_NODE');

  const calculateNodeEstimate = () => {
    if (selectedPlan === 'PYME_NODE') return { basePrice: 290, title: 'Nodo PYME / Kit Digital', seats: 'Ilimitados por CIF' };
    if (selectedPlan === 'ENTERPRISE_NODE') return { basePrice: 3500, title: 'Nodo Corporativo HSM / Custom PKI', seats: 'Ilimitados por Organización' };
    return { basePrice: 149, title: 'Developer SDK Node', seats: 'Hasta 10 Nodos Edge' };
  };

  const planInfo = calculateNodeEstimate();

  return (
    <div className="bg-saare-surface border border-saare-line rounded-xl p-6 shadow-xl space-y-8">
      {/* Cabecera Módulo Subvenciones */}
      <div className="border-b border-saare-line pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-emerald-400 font-bold tracking-wider uppercase">05 / MODELO DE NODO & SUBVENCIONES EU</span>
          <h2 className="text-2xl font-black text-white mt-1">Estrategia de Venta de Nodo Corporativo</h2>
          <p className="text-xs text-slate-400 mt-1">
            Justificación del 100% de la inversión a través de fondos Kit Digital, Kit Consulting y líneas INCIBE/DORA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            FINANCIABLE HASTA EL 100%
          </span>
        </div>
      </div>

      {/* Selector de Modelo de Nodo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setSelectedPlan('PYME_NODE')}
          className={`p-5 rounded-xl border text-left transition ${selectedPlan === 'PYME_NODE' ? 'bg-emerald-950/20 border-emerald-500 ring-1 ring-emerald-500' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'}`}
        >
          <span className="text-xs font-mono text-emerald-400 font-bold block mb-1">KIT DIGITAL / CONSULTING</span>
          <h3 className="text-lg font-extrabold text-white">Nodo PYME Soberano</h3>
          <div className="text-2xl font-black text-emerald-400 my-2">290 € <span className="text-xs text-slate-400 font-normal">/ mes</span></div>
          <p className="text-xs text-slate-400 mb-3">Asientos ilimitados por Entidad Jurídica (CIF). Cubre ciberseguridad y FRIA Art. 27.</p>
          <span className="text-[11px] font-mono text-emerald-300 font-semibold bg-emerald-900/40 px-2 py-1 rounded">✓ Justificante DNSH + ISO 27037</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedPlan('ENTERPRISE_NODE')}
          className={`p-5 rounded-xl border text-left transition ${selectedPlan === 'ENTERPRISE_NODE' ? 'bg-blue-950/20 border-saare-cyan ring-1 ring-saare-cyan' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'}`}
        >
          <span className="text-xs font-mono text-saare-cyan font-bold block mb-1">DORA / NIS2 / ENTERPRISE</span>
          <h3 className="text-lg font-extrabold text-white">Nodo Corporativo PKI</h3>
          <div className="text-2xl font-black text-saare-cyan my-2">3.500 € <span className="text-xs text-slate-400 font-normal">/ mes</span></div>
          <p className="text-xs text-slate-400 mb-3">Despliegue privado Air-Gapped, integración HSM/PKI propia y auditoría multicliente.</p>
          <span className="text-[11px] font-mono text-blue-300 font-semibold bg-blue-900/40 px-2 py-1 rounded">✓ Firma Ed25519 + D1 Dedicated</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedPlan('DEV_SDK')}
          className={`p-5 rounded-xl border text-left transition ${selectedPlan === 'DEV_SDK' ? 'bg-purple-950/20 border-purple-500 ring-1 ring-purple-500' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'}`}
        >
          <span className="text-xs font-mono text-purple-400 font-bold block mb-1">PRO / DEVELOPER</span>
          <h3 className="text-lg font-extrabold text-white">Nodo SDK Edge</h3>
          <div className="text-2xl font-black text-purple-400 my-2">149 € <span className="text-xs text-slate-400 font-normal">/ mes</span></div>
          <p className="text-xs text-slate-400 mb-3">Sensor L7 + LabEngine SDK con Token Binding X.509 para hasta 10 endpoints.</p>
          <span className="text-[11px] font-mono text-purple-300 font-semibold bg-purple-900/40 px-2 py-1 rounded">✓ Telemetría L7 Pre-transmit</span>
        </button>
      </div>

      {/* Rangos de Responsabilidad en la Empresa (Asientos Ilimitados) */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-base font-extrabold text-white">Rangos de Responsabilidad Asignables por Nodo</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            El nodo gestiona el acceso mediante RBAC dinámico sin sobrecoste por la adición de puestos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg">
            <span className="text-[11px] font-mono text-saare-cyan font-bold block">ROL CISO / GLOBAL ADMIN</span>
            <div className="text-lg font-bold text-white mt-1">Nivel 4 — Custodio</div>
            <p className="text-[11px] text-slate-400 mt-1">Control total de Bóveda D1, llaves Ed25519 e inyección de reglas DLP.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg">
            <span className="text-[11px] font-mono text-emerald-400 font-bold block">ROL SECOPS / SOC</span>
            <div className="text-lg font-bold text-white mt-1">Nivel 3 — Operador</div>
            <p className="text-[11px] text-slate-400 mt-1">Monitorización de trazas RAM en caliente y gestión de alertas DORA.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg">
            <span className="text-[11px] font-mono text-amber-400 font-bold block">ROL AUDITOR GRC</span>
            <div className="text-lg font-bold text-white mt-1">Nivel 2 — Perito</div>
            <p className="text-[11px] text-slate-400 mt-1">Emisión de dictámenes ISO 42001 y expedientes para subvenciones EU.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg">
            <span className="text-[11px] font-mono text-purple-400 font-bold block">ROL BOARD / C-LEVEL</span>
            <div className="text-lg font-bold text-white mt-1">Nivel 1 — Directivo</div>
            <p className="text-[11px] text-slate-400 mt-1">Visor ejecutivo de métricas de resiliencia y pasaportes de cumplimiento.</p>
          </div>
        </div>

        {/* Resumen del Plan Seleccionado y Descargas */}
        <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 font-mono">Plan Seleccionado:</span>
            <div className="text-sm font-bold text-white">{planInfo.title} — Capacidad: <span className="text-emerald-400">{planInfo.seats}</span></div>
          </div>
          <div className="flex gap-3">
            <a
              href="/docs/Manual_Operativo_SAARE_v4.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              📄 Manual v4 (Justificación)
            </a>
            <a
              href="https://console.saare.es"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-lg text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg transition"
            >
              Desplegar en Console ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}