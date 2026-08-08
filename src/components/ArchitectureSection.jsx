import React from 'react';
import RuntimeStream from './canvas/RuntimeStream';

export default function ArchitectureSection() {
  return (
    <section className="py-20 px-6 bg-[#050811] text-white border-t border-slate-900 relative overflow-hidden">
      {/* Resplandor ambiental de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#00f0ff]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        
        {/* Insignia de categoría */}
        <span className="font-mono text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest bg-[#00f0ff]/10 px-3.5 py-1 rounded-full border border-[#00f0ff]/20 inline-block mb-4">
          SAARE Data Plane Inspection
        </span>

        <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight mb-4">
          Zero-Copy RAM Policy Enforcement
        </h2>
        
        <p className="text-slate-400 text-sm sm:text-base font-light mb-10 max-w-2xl mx-auto leading-relaxed">
          Inspección determinista L7 sobre flujos de agentes y LLMs. Evaluación en tiempo real sobre memoria RAM sin persistencia de datos en disco.
        </p>

        {/* Tarjeta contenedora con efecto Glassmorphism y visualización de flujo */}
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-2xl mb-8 space-y-6">
          
          {/* Canvas interactivo / animación de partículas y flujo */}
          <div className="w-full min-h-[220px] rounded-xl overflow-hidden bg-black/40 border border-slate-800/60 relative">
            <RuntimeStream />
          </div>

          {/* Consola de Telemetría L7 (Camuflaje de código mediante eventos JSON) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left font-mono text-[11px]">
            
            {/* ETAPA 1 */}
            <div className="bg-black/60 border border-slate-800/80 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 font-bold border-b border-slate-800 pb-1.5 mb-2">
                <span className="text-[10px] uppercase tracking-wider">01. INBOUND STREAM</span>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              </div>
              <div className="text-blue-400 font-bold">&gt; POST /v1/chat/completions</div>
              <div className="text-slate-500 text-[10px]">Protocol: MCP / REST / gRPC</div>
              <div className="text-slate-400 text-[10px] truncate">Payload: [Raw User Prompt Stream]</div>
            </div>

            {/* ETAPA 2 */}
            <div className="bg-black/80 border border-[#00f0ff]/40 rounded-xl p-4 space-y-1.5 shadow-[0_0_15px_rgba(0,240,255,0.05)]">
              <div className="flex items-center justify-between text-[#00f0ff] font-bold border-b border-slate-800 pb-1.5 mb-2">
                <span className="text-[10px] uppercase tracking-wider">02. L7 POLICY SHIELD</span>
                <span className="text-[9px] bg-[#00f0ff]/10 px-1.5 py-0.5 rounded border border-[#00f0ff]/20">&lt; 1.16 ms</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>DLP & PII Masking:</span>
                <span className="text-emerald-400 font-bold">ENFORCED</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Injection Guard:</span>
                <span className="text-emerald-400 font-bold">CLEAN</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>RAM Ephemeral:</span>
                <span className="text-[#00f0ff] font-bold">0 Bytes Disk</span>
              </div>
            </div>

            {/* ETAPA 3 */}
            <div className="bg-black/60 border border-slate-800/80 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center justify-between text-[#C5A059] font-bold border-b border-slate-800 pb-1.5 mb-2">
                <span className="text-[10px] uppercase tracking-wider">03. SIGNED LEDGER</span>
                <span className="w-2 h-2 rounded-full bg-[#C5A059]"></span>
              </div>
              <div className="text-slate-300"><span className="text-[#C5A059] font-bold">Sig:</span> ed25519:8f9a2b...</div>
              <div className="text-slate-500 text-[10px] truncate">Hash: sha256:e3b0c44298fc1...</div>
              <div className="text-emerald-400 font-bold text-[10px] pt-0.5">&gt; Forwarding to Foundation LLM</div>
            </div>

          </div>

        </div>

        {/* Leyenda y métricas clave */}
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Tráfico Entrante / Prompts</span>
          </div>
          
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
            <span>Barrera L7 Policy Engine</span>
          </div>
          
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059] shadow-[0_0_8px_#C5A059]" />
            <span>Evidencia Firmada Ed25519</span>
          </div>
        </div>

      </div>
    </section>
  );
}