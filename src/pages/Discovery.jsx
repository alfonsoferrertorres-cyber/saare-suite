import React from 'react';
import { Link } from 'react-router-dom';

export default function Discovery() {
  return (
    <div className="min-h-screen bg-[#050811] text-white pt-24 pb-20 px-6 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <span className="font-mono text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest bg-[#00f0ff]/10 px-4 py-1.5 rounded-full border border-[#00f0ff]/20 inline-block">
            Path 01 • Discovery Assessment
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-white">
            Audit Your AI Security Posture
          </h1>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Evaluate your current runtime vulnerability against prompt injection, data exfiltration, and unverified LLM API forwarding in a local sandbox environment.
          </p>
        </div>

        {/* ASSESSMENT SCOPE BOX */}
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl space-y-6 max-w-3xl mx-auto backdrop-blur-md">
          <div className="border-b border-slate-800 pb-4">
            <span className="font-mono text-[10px] text-[#C5A059] font-bold uppercase tracking-wider">Evaluation Methodology</span>
            <h2 className="text-2xl font-serif font-bold text-white mt-1">Assessment Scope & Deliverables</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#050811] border border-slate-800/80 p-4 rounded-xl">
              <span className="font-mono text-xs font-bold text-[#00f0ff]">01. Profiling</span>
              <p className="text-xs text-slate-400 mt-2">Runtime prompt injection vulnerability profiling using standardized test suites.</p>
            </div>
            <div className="bg-[#050811] border border-slate-800/80 p-4 rounded-xl">
              <span className="font-mono text-xs font-bold text-[#C5A059]">02. Leak Analysis</span>
              <p className="text-xs text-slate-400 mt-2">Outbound payload PII/PHI leak detection and unencrypted data flow inspection.</p>
            </div>
            <div className="bg-[#050811] border border-slate-800/80 p-4 rounded-xl">
              <span className="font-mono text-xs font-bold text-purple-400">03. Mapping</span>
              <p className="text-xs text-slate-400 mt-2">Shadow AI API usage and unauthorized endpoint mapping across active tools.</p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <Link
              to="/pricing"
              className="inline-block bg-[#00f0ff] hover:bg-[#38bdf8] text-black font-extrabold text-xs px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-[#00f0ff]/20"
            >
              Request Discovery Access
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}