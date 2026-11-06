import React from 'react';

export default function ArchitectureDiagram() {
  const pipelineSteps = [
    { step: "01", name: "POLICY", desc: "Versioned Declarative Policies" },
    { step: "02", name: "RISK", desc: "Threat & Context Assessment" },
    { step: "03", name: "CONTROL", desc: "L7 Vector Engine (7 Dimensions)" },
    { step: "04", name: "RUNTIME", desc: "Ex-Ante RAM Interception (`mlock`)" },
    { step: "05", name: "DECISION", desc: "ALLOW / DENY / REVIEW" },
    { step: "06", name: "EVIDENCE", desc: "Signed `.saare-proof` Package" },
    { step: "07", name: "AUDIT", desc: "Independent Client Verification" }
  ];

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 my-8 font-sans text-white shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <div className="text-center mb-8">
        <span className="inline-block text-[11px] font-mono font-bold text-cyan-400 tracking-widest uppercase bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full mb-2">
          SGP 1.0 Runtime Architecture
        </span>
        <h3 className="text-2xl md:text-3xl font-extrabold text-white">
          Perimeter Flow: From Policy to Evidence
        </h3>
        <p className="text-xs text-slate-400 mt-2 max-w-xl mx-auto">
          L7 deterministic pipeline executed in volatile memory prior to authorizing model inference.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {pipelineSteps.map((item, idx) => (
          <div key={idx} className="relative group flex flex-col justify-between">
            <div className="h-full bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-center group-hover:border-cyan-500/50 group-hover:bg-slate-900 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-500 block font-semibold">
                  {item.step}
                </span>
                <span className="text-xs font-extrabold text-cyan-400 block my-1 tracking-wide">
                  {item.name}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 leading-tight block mt-2">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>
            <strong className="text-white">L7 Interception:</strong> P99 &lt; 1.12 ms | Zero-Disk RAM isolation (`mlock`)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>
            <strong className="text-white">Cryptographic Vault:</strong> Ed25519 + Merkle Root + TSA RFC 3161
          </span>
        </div>
      </div>
    </div>
  );
}