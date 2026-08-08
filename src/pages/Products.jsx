import React from 'react';
import { Link } from 'react-router-dom';

export default function Products() {
  return (
    <div className="min-h-screen bg-[#050811] text-white pt-24 pb-20 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <span className="font-mono text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest bg-[#00f0ff]/10 px-4 py-1.5 rounded-full border border-[#00f0ff]/20 inline-block">
            SAARE Platform Modules
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-white">
            Core Engine Products
          </h1>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
            The platform delivers unified, modular products combining L7 inline interception capabilities, immutable evidence generation, and deterministic policy enforcement.
          </p>
        </div>

        {/* PRODUCT GRID (2x2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* SAARE RUNTIME */}
          <div className="border border-slate-800 bg-slate-900/40 p-8 rounded-2xl hover:border-[#00f0ff]/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[10px] font-bold text-[#00f0ff] uppercase tracking-wider bg-[#00f0ff]/10 px-3 py-1 rounded border border-[#00f0ff]/20">
                  DATA PLANE
                </span>
                <svg className="w-6 h-6 text-[#00f0ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-3">SAARE Runtime</h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Executes policies in real time. Intercepts, inspects, and routes AI requests operating directly in volatile RAM memory with zero persistent storage disk I/O.
              </p>
            </div>
            <ul className="text-xs font-mono text-slate-400 space-y-2 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2"><span className="text-[#00f0ff] font-bold">+</span> Interception & Real-time Inspection</li>
              <li className="flex items-center gap-2"><span className="text-[#00f0ff] font-bold">+</span> Sub-1.2ms Policy Enforcement</li>
              <li className="flex items-center gap-2"><span className="text-[#00f0ff] font-bold">+</span> Ex-Ante PII Sanitization & Dynamic Routing</li>
            </ul>
          </div>

          {/* SAARE ASSURANCE */}
          <div className="border border-slate-800 bg-slate-900/40 p-8 rounded-2xl hover:border-[#C5A059]/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[10px] font-bold text-[#C5A059] uppercase tracking-wider bg-[#C5A059]/10 px-3 py-1 rounded border border-[#C5A059]/30">
                  EVIDENCE & GOVERNANCE
                </span>
                <svg className="w-6 h-6 text-[#C5A059]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-3">SAARE Assurance</h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Immutable traceability system. Converts Runtime decisions into auditable cryptographic evidence for risk committees, CISOs, and regulatory bodies.
              </p>
            </div>
            <ul className="text-xs font-mono text-slate-400 space-y-2 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2"><span className="text-[#C5A059] font-bold">+</span> Cryptographic Ed25519 Signatures</li>
              <li className="flex items-center gap-2"><span className="text-[#C5A059] font-bold">+</span> Executive Risk Dashboards</li>
              <li className="flex items-center gap-2"><span className="text-[#C5A059] font-bold">+</span> Technical Control Mapping (EU AI Act, DORA)</li>
            </ul>
          </div>

          {/* SAARE FRAMEWORK */}
          <div className="border border-slate-800 bg-slate-900/40 p-8 rounded-2xl hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-800 px-3 py-1 rounded border border-slate-700">
                  POLICY ARCHITECTURE
                </span>
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-3">SAARE Framework</h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                The foundational framework establishing operational boundaries for AI systems, translating legal and risk mandates into declarative policy rulesets.
              </p>
            </div>
            <ul className="text-xs font-mono text-slate-400 space-y-2 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2"><span className="text-white font-bold">+</span> Declarative YAML/JSON Policy Rules</li>
              <li className="flex items-center gap-2"><span className="text-white font-bold">+</span> Governance Controls & Guardrails</li>
              <li className="flex items-center gap-2"><span className="text-white font-bold">+</span> Custom Ruleset Hot-Reloading</li>
            </ul>
          </div>

          {/* SAARE SDK & C-ABI */}
          <div className="border border-slate-800 bg-slate-900/40 p-8 rounded-2xl hover:border-[#00f0ff]/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[10px] font-bold text-[#00f0ff] uppercase tracking-wider bg-[#00f0ff]/10 px-3 py-1 rounded border border-[#00f0ff]/20">
                  INTEGRATION TOOLS
                </span>
                <svg className="w-6 h-6 text-[#00f0ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-3">SAARE SDK & C-ABI</h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Official libraries and linkable connectors designed to natively embed the SAARE Runtime engine directly into your source code and enterprise stack.
              </p>
            </div>
            <div className="border-t border-slate-800 pt-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">Supported Language Bindings</span>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <span className="bg-[#050811] border border-slate-800 px-2.5 py-1 rounded text-slate-300">Python</span>
                <span className="bg-[#050811] border border-slate-800 px-2.5 py-1 rounded text-slate-300">Rust</span>
                <span className="bg-[#050811] border border-slate-800 px-2.5 py-1 rounded text-slate-300">Go</span>
                <span className="bg-[#050811] border border-slate-800 px-2.5 py-1 rounded text-[#00f0ff]">C-ABI / WASM</span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM CONVERSION CTA */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center max-w-4xl mx-auto backdrop-blur-md">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-4">
            Ready to integrate SAARE products into your infrastructure?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Explore interactive developer documentation or evaluate your operational security posture through our Discovery Program.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/developers"
              className="bg-[#00f0ff]/10 border border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black font-extrabold text-xs px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer"
            >
              Explore Developers Hub
            </Link>
            <Link
              to="/discovery"
              className="bg-[#C5A059] text-black font-extrabold text-xs px-8 py-3.5 rounded-xl uppercase tracking-wider hover:bg-[#d6b16a] transition-all shadow-lg shadow-[#C5A059]/20 cursor-pointer"
            >
              Start Discovery Program
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}