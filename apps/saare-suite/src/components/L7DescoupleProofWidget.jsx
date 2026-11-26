import React from 'react';

export default function L7DescoupleProofWidget() {
  const proofDetails = {
    runtimeMode: 'Evaluación en memoria sin retención en disco',
    routingTopology: 'Control preventivo previo al envío a inferencia',
    integrityVerification: 'Trazas y comprobación criptográfica de integridad',
    governanceAlignment: 'Apoyo técnico a procesos de gobernanza y seguridad',
    timestamp: new Date().toISOString()
  };

  return (
    <div className="my-10 rounded-2xl border border-cyan-500/40 bg-[#0A101E] p-6 sm:p-8 font-mono text-xs shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-cyan-500/10 text-cyan-400 px-4 py-1 text-[9px] font-bold uppercase tracking-widest border-l border-b border-cyan-500/30 rounded-bl-xl">
        Control Perimetral
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
          Estado de Control y Verificación Ex Ante
        </h3>
      </div>

      <p className="text-slate-400 text-xs mb-6 leading-relaxed font-sans">
        Este módulo ilustra cómo se evalúan las solicitudes antes de su envío hacia los modelos de IA y cómo se estructuran las evidencias de integridad asociadas a cada operación.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">Modo de Evaluación:</span>
          <span className="text-cyan-300 font-bold">{proofDetails.runtimeMode}</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">Enrutamiento y Control:</span>
          <span className="text-emerald-400 font-bold">{proofDetails.routingTopology}</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">Verificación:</span>
          <span className="text-white">{proofDetails.integrityVerification}</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">Gobernanza:</span>
          <span className="text-emerald-400 font-bold">{proofDetails.governanceAlignment}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 pt-4 text-[10px] text-slate-500 gap-2 font-mono">
        <span>Marca de tiempo: {proofDetails.timestamp}</span>
        <span className="text-cyan-400 font-semibold">Motor de Control S.A.A.R.E.</span>
      </div>
    </div>
  );
}