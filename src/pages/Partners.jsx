import React from 'react';
import { Link } from 'react-router-dom';

export default function Partners() {
  return (
    <div className="min-h-screen bg-[#050811] text-white pt-24 pb-20 px-6 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <span className="font-mono text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-4 py-1.5 rounded-full border border-purple-500/30 inline-block">
            OEM & ISV Partner Program
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-white">
            Embed SAARE into Your Software
          </h1>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Integrate SAARE Engine as an embedded C/Rust library or sidecar container to deliver native AI governance and compliance in your enterprise product suite.
          </p>
        </div>

        {/* INTEGRATION OPTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="border border-slate-800 bg-slate-900/40 p-8 rounded-2xl hover:border-purple-500/40 transition-all flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-purple-400 font-bold uppercase tracking-wider bg-purple-500/10 px-3 py-1 rounded border border-purple-500/20">
                IN-PROCESS INTEGRATION
              </span>
              <h3 className="text-2xl font-serif font-bold text-white mt-4 mb-2">Embedded SDK</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Direct in-process Rust/C library bindings for ultra-low latency execution and zero network proxy overhead within your application codebase.
              </p>
            </div>
            <span className="font-mono text-[11px] text-slate-500">Stack: C-ABI / Rust / WASM / Python Native</span>
          </div>

          <div className="border border-slate-800 bg-slate-900/40 p-8 rounded-2xl hover:border-[#00f0ff]/40 transition-all flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] text-[#00f0ff] font-bold uppercase tracking-wider bg-[#00f0ff]/10 px-3 py-1 rounded border border-[#00f0ff]/20">
                CONTAINERIZED PROXY
              </span>
              <h3 className="text-2xl font-serif font-bold text-white mt-4 mb-2">Sidecar Container</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Kubernetes-native sidecar proxy designed for microservice architectures, intercepting mesh traffic transparently.
              </p>
            </div>
            <span className="font-mono text-[11px] text-slate-500">Stack: Docker / Kubernetes / Envoy Mesh</span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            to="/pricing"
            className="inline-block bg-purple-500 hover:bg-purple-400 text-black font-extrabold text-xs px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            Request OEM Integration Blueprint
          </Link>
        </div>

      </div>
    </div>
  );
}