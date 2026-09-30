import React, { useState } from 'react';

export default function SubsidiesHub() {
  const [selectedPlan, setSelectedPlan] = useState('KIT_DIGITAL_SOFTWARE');

  const calculateNodeEstimate = () => {
    if (selectedPlan === 'KIT_DIGITAL_SOFTWARE') {
      return { 
        basePrice: 'Subvencionado 100%', 
        title: 'Software & Ciberseguridad IA (Kit Digital)', 
        grant: 'Hasta 12.000 € (Categorías Ciberseguridad y Gestión de Procesos)',
        seats: 'CIF Ilimitado' 
      };
    }
    if (selectedPlan === 'KIT_CONSULTING_GRC') {
      return { 
        basePrice: 'Bono Asesoramiento', 
        title: 'Servicio de Asesoramiento en IA & FRIA (Kit Consulting)', 
        grant: 'Bono de hasta 24.000 € para Auditoría y Gobernanza',
        seats: 'Asesores + Equipo GRC' 
      };
    }
    if (selectedPlan === 'ENTERPRISE_NODE') {
      return { 
        basePrice: '3.500 € / mes', 
        title: 'Nodo Corporativo HSM / Custom PKI (DORA & NIS2)', 
        grant: 'Financiable mediante líneas CDTI / INCIBE',
        seats: 'Organización Multicloud' 
      };
    }
    return { 
      basePrice: '149 € / mes', 
      title: 'Developer SDK Edge Node', 
      grant: 'Cubre entornos PoC',
      seats: 'Hasta 10 Nodos Edge' 
    };
  };

  const planInfo = calculateNodeEstimate();

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-8 font-sans text-slate-100">
      {/* Cabecera Módulo Subvenciones */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-emerald-400 font-bold tracking-wider uppercase bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
            05 / SUBVENCIONES PÚBLICAS & FONDOS UE 2026
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-3">
            Financiación Oficial de Software y Gobernanza
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Financia la implantación de la Suite S.A.A.R.E. a través del <strong>Kit Digital (Software y Ciberseguridad)</strong> y <strong>Kit Consulting (Gobernanza IA)</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            FINANCIABLE HASTA EL 100%
          </span>
        </div>
      </div>

      {/* Tarjetas de Selección de Programa */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KIT DIGITAL - SOFTWARE */}
        <button
          type="button"
          onClick={() => setSelectedPlan('KIT_DIGITAL_SOFTWARE')}
          className={`p-5 rounded-2xl border text-left transition-all relative ${
            selectedPlan === 'KIT_DIGITAL_SOFTWARE'
              ? 'bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/50'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[10px] font-mono text-emerald-400 font-bold block mb-1 uppercase">
            PROGRAMA KIT DIGITAL
          </span>
          <h3 className="text-base font-bold text-white">Software & Ciberseguridad</h3>
          <div className="text-2xl font-black text-emerald-400 my-2">
            0 € <span className="text-xs text-slate-400 font-normal">(100% Subvencionado)</span>
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Cubre la licencia de software, intercepción L7, sanitización de PII y módulo de cumplimiento.
          </p>
          <span className="text-[10px] font-mono text-emerald-300 font-semibold bg-emerald-900/50 px-2 py-1 rounded border border-emerald-500/30 block text-center">
            ✓ Bono Kit Digital hasta 12.000€
          </span>
        </button>

        {/* KIT CONSULTING - ASESORAMIENTO */}
        <button
          type="button"
          onClick={() => setSelectedPlan('KIT_CONSULTING_GRC')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedPlan === 'KIT_CONSULTING_GRC'
              ? 'bg-cyan-950/30 border-cyan-500 ring-2 ring-cyan-500/50'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1 uppercase">
            KIT CONSULTING
          </span>
          <h3 className="text-base font-bold text-white">Asesoramiento IA & FRIA</h3>
          <div className="text-2xl font-black text-cyan-400 my-2">
            Bono GRC <span className="text-xs text-slate-400 font-normal">/ Asesoría</span>
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Servicio de auditoría inicial, análisis de riesgos (FRIA Art. 27) y alineación con EU AI Act.
          </p>
          <span className="text-[10px] font-mono text-cyan-300 font-semibold bg-cyan-900/50 px-2 py-1 rounded border border-cyan-500/30 block text-center">
            ✓ Bono Asesoramiento hasta 24.000€
          </span>
        </button>

        {/* NODO CORPORATIVO ENTERPRISE */}
        <button
          type="button"
          onClick={() => setSelectedPlan('ENTERPRISE_NODE')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedPlan === 'ENTERPRISE_NODE'
              ? 'bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/50'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[10px] font-mono text-blue-400 font-bold block mb-1 uppercase">
            DORA / NIS2 / ENTERPRISE
          </span>
          <h3 className="text-base font-bold text-white">Nodo Corporativo HSM</h3>
          <div className="text-2xl font-black text-blue-400 my-2">
            3.500 € <span className="text-xs text-slate-400 font-normal">/ mes</span>
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Despliegue privado Air-Gapped con custodia en llaves HSM/PKI y auditoría multicloud.
          </p>
          <span className="text-[10px] font-mono text-blue-300 font-semibold bg-blue-900/50 px-2 py-1 rounded border border-blue-500/30 block text-center">
            ✓ Líneas CDTI / INCIBE DORA
          </span>
        </button>

        {/* NODO DEVELOPER SDK */}
        <button
          type="button"
          onClick={() => setSelectedPlan('DEV_SDK')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            selectedPlan === 'DEV_SDK'
              ? 'bg-purple-950/30 border-purple-500 ring-2 ring-purple-500/50'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-[10px] font-mono text-purple-400 font-bold block mb-1 uppercase">
            PRO / DEVELOPER
          </span>
          <h3 className="text-base font-bold text-white">Nodo SDK Edge</h3>
          <div className="text-2xl font-black text-purple-400 my-2">
            149 € <span className="text-xs text-slate-400 font-normal">/ mes</span>
          </div>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">
            Sensor L7 e integración con SDK nativa para hasta 10 endpoints de desarrollo.
          </p>
          <span className="text-[10px] font-mono text-purple-300 font-semibold bg-purple-900/50 px-2 py-1 rounded border border-purple-500/30 block text-center">
            ✓ Telemetría L7 Pre-transmit
          </span>
        </button>
      </div>

      {/* Roles de Responsabilidad Asignables */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-white">
            Estructura de Responsabilidad y Roles Integrados
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de permisos RBAC asignables a la organización sin coste adicional por licencia de usuario.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase">
              CISO / GLOBAL ADMIN
            </span>
            <div className="text-sm font-bold text-white mt-1">Nivel 4 — Custodio</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Gestión de Bóveda D1, claves Ed25519 e inyección de políticas DLP.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] font-mono text-emerald-400 font-bold block uppercase">
              SECOPS / SOC
            </span>
            <div className="text-sm font-bold text-white mt-1">Nivel 3 — Operador</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Monitoreo en tiempo real de trazas en memoria y gestión de alertas DORA.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] font-mono text-amber-400 font-bold block uppercase">
              AUDITOR GRC / DPO
            </span>
            <div className="text-sm font-bold text-white mt-1">Nivel 2 — Perito</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Emisión de dictámenes ISO 42001 e informes justificativos para la administración.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] font-mono text-purple-400 font-bold block uppercase">
              BOARD / C-LEVEL
            </span>
            <div className="text-sm font-bold text-white mt-1">Nivel 1 — Directivo</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Consola ejecutiva de visualización de resiliencia y pasaportes de cumplimiento.
            </p>
          </div>
        </div>

        {/* Resumen y Enlaces a Documentación */}
        <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-mono">Modalidad Seleccionada:</span>
            <div className="text-sm font-bold text-white mt-0.5">
              {planInfo.title} — <span className="text-emerald-400">{planInfo.grant}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <a
              href="/docs/Guia_Justificacion_Kit_Digital_SAARE.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              📄 Guía Kit Digital (PDF)
            </a>
            <a
              href="https://console.saare.es"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all"
            >
              Solicitar Bono Kit Digital ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}