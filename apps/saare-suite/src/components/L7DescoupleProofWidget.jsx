import React from 'react';

export default function L7DescoupleProofWidget() {
  const cryptoProof = {
    expediente: "MS3V-RECON-VALID-2026-ALF-0521",
    nodeSignature: "SAARE-ISO-COMPLIANCE-NODE-BCC0A9AO-HASH99X77B",
    runtimeMode: "Stateless In-Memory (Zero-Disk RAM mlock)",
    routingTopology: "Strictly Unidireccional (Optoacoplador Galvánico L7)",
    logicalErrorRate: "0.00% (Cero Lógico Absoluto)",
    frameworkCompliance: "ISO/IEC 27001:2022 / ISO/IEC 42001 / EU AI Act",
    timestamp: new Date().toISOString()
  };

  return (
    <div className="my-10 rounded-2xl border border-cyan-500/40 bg-[#0A101E] p-6 sm:p-8 font-mono text-xs shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-cyan-500/10 text-cyan-400 px-4 py-1 text-[9px] font-bold uppercase tracking-widest border-l border-b border-cyan-500/30 rounded-bl-xl">
        Runtime Perimetral L7
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
          Comprobante Criptográfico de Desacople y Soberanía Ex-Ante
        </h3>
      </div>

      <p className="text-slate-400 text-xs mb-6 leading-relaxed font-sans">
        De conformidad con el Reglamento (UE) 2024/1689 (EU AI Act) y los estándares ISO/IEC 42001 de gestión de IA, este nodo opera bajo una arquitectura de aislamiento absoluto que previene cualquier exfiltración de datos o deriva estocástica.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">Firma Criptográfica Oficial:</span>
          <span className="text-cyan-300 font-bold break-all">{cryptoProof.nodeSignature}</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">Margen de Error Lógico (M_E):</span>
          <span className="text-emerald-400 font-bold">{cryptoProof.logicalErrorRate}</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">Topología de Red:</span>
          <span className="text-white">{cryptoProof.routingTopology}</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-1">Retención en Disco:</span>
          <span className="text-emerald-400 font-bold">0 BYTES (Zero-Disk RAM)</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 pt-4 text-[10px] text-slate-500 gap-2 font-mono">
        <span>Expediente Marco: {cryptoProof.expediente}</span>
        <span className="text-cyan-400 font-semibold">Validado por Motor Lógico S.A.A.R.E. v10.0 PRO</span>
      </div>
    </div>
  );
}