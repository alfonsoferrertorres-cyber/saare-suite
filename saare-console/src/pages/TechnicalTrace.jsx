import React from 'react';

export default function TechnicalTrace() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono text-xs">
      <div className="border-b border-slate-800 pb-3">
        <span className="text-[10px] text-[#00f0ff] uppercase block">NIVEL 3 — DEEP TECHNICAL TRACE / Registro Global (ENGINEER & AUDITOR)</span>
        <h1 className="text-xl font-bold text-white font-serif mt-1">Execution Trace & Cryptographic Logs</h1>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
          <div><span className="text-slate-500">Module:</span> PerimeterShield</div>
          <div><span className="text-slate-500">Preset:</span> Enterprise Anti-Jailbreak</div>
          <div><span className="text-slate-500">Semantic Mode:</span> <span className="text-[#C5A059] font-bold">SAARE-MD-SECU</span></div>
          <div><span className="text-slate-500">Runtime Version:</span> Core Runtime v7.2.1-rust</div>
          <div><span className="text-slate-500">Last Decision:</span> <span className="text-rose-400 font-bold">BLOCK</span></div>
          <div><span className="text-slate-500">Reason:</span> Policy Violation (Prompt Injection Pattern #412)</div>
          <div><span className="text-slate-500">Crypto Verification:</span> <span className="text-emerald-400">Ed25519 Verified ✓</span></div>
          <div><span className="text-slate-500">Timestamp:</span> 2026-08-11T09:36:00Z</div>
        </div>

        <div className="pt-4 border-t border-slate-900">
          <span className="text-slate-500 block mb-1">Cryptographic Proof ID (Crypto-ID):</span>
          <div className="bg-slate-900 p-3 rounded-xl text-[#00f0ff] break-all border border-slate-800">
            SAARE-HASH-9981A72F08B211ECA8A30242AC120002-ED25519-SIG-8F32C1
          </div>
        </div>
      </div>
    </div>
  );
}
