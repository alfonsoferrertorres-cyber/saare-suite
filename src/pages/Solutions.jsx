import React from 'react';
import { Link } from 'react-router-dom';

export default function Solutions() {
  return (
    <div className="min-h-screen bg-[#050811] text-white pt-24 pb-20 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <span className="font-mono text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest bg-[#00f0ff]/10 px-4 py-1.5 rounded-full border border-[#00f0ff]/20 inline-block">
            Enterprise Vertical Solutions
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-white">
            Targeted AI Governance by Industry
          </h1>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
            Align your artificial intelligence models with industry-specific regulatory and security requirements at runtime.
          </p>
        </div>

        {/* VERTICAL SOLUTIONS MATRIX */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* BANKING & FINANCIAL SERVICES */}
          <div className="border border-slate-800 bg-slate-900/40 p-8 rounded-2xl hover:border-[#C5A059]/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[10px] font-bold text-[#C5A059] uppercase tracking-wider bg-[#C5A059]/10 px-3 py-1 rounded border border-[#C5A059]/20">
                  DORA & PCI-DSS
                </span>
                <span className="text-xs font-mono text-slate-500">SECTOR 01</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-3">Banking & Financial Services</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Ex-ante protection against PII/PCI data leaks in LLM prompts, auditable traceability for credit risk supervision, and strict compliance with the DORA framework.
              </p>
            </div>
            <ul className="text-xs font-mono text-slate-400 space-y-2 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2"><span className="text-[#C5A059] font-bold">✓</span> Real-time RAM PII and Payment Card Detection</li>
              <li className="flex items-center gap-2"><span className="text-[#C5A059] font-bold">✓</span> Cryptographic Audit Receipts for Banking Inspection</li>
              <li className="flex items-center gap-2"><span className="text-[#C5A059] font-bold">✓</span> Sub-millisecond Latency for High-Frequency Scoring</li>
            </ul>
          </div>

          {/* HEALTHCARE & PHARMACEUTICALS */}
          <div className="border border-slate-800 bg-slate-900/40 p-8 rounded-2xl hover:border-[#00f0ff]/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[10px] font-bold text-[#00f0ff] uppercase tracking-wider bg-[#00f0ff]/10 px-3 py-1 rounded border border-[#00f0ff]/20">
                  HIPAA & EU AI ACT (HIGH RISK)
                </span>
                <span className="text-xs font-mono text-slate-500">SECTOR 02</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-3">Healthcare & Pharmaceuticals</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Deterministic anonymization of electronic health records (EHR) and clinical trial data in real time prior to forwarding requests to cloud LLM endpoints.
              </p>
            </div>
            <ul className="text-xs font-mono text-slate-400 space-y-2 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2"><span className="text-[#00f0ff] font-bold">✓</span> Ex-Ante PHI Data Masking & Redaction</li>
              <li className="flex items-center gap-2"><span className="text-[#00f0ff] font-bold">✓</span> Runtime EU AI Act Risk Classification</li>
              <li className="flex items-center gap-2"><span className="text-[#00f0ff] font-bold">✓</span> Zero-Disk Persistence for Maximum Privacy</li>
            </ul>
          </div>

          {/* DEFENSE & PUBLIC SECTOR */}
          <div className="border border-slate-800 bg-slate-900/40 p-8 rounded-2xl hover:border-[#C5A059]/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[10px] font-bold text-[#C5A059] uppercase tracking-wider bg-[#C5A059]/10 px-3 py-1 rounded border border-[#C5A059]/20">
                  AIR-GAPPED / HIGH SECURITY
                </span>
                <span className="text-xs font-mono text-slate-500">SECTOR 03</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-3">Defense & Government</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Air-Gapped network deployments featuring standalone policy integrity verification without requiring outbound internet calls.
              </p>
            </div>
            <ul className="text-xs font-mono text-slate-400 space-y-2 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2"><span className="text-[#C5A059] font-bold">✓</span> Native Rust Execution Engine for Isolated Environments</li>
              <li className="flex items-center gap-2"><span className="text-[#C5A059] font-bold">✓</span> High Security Framework Compliance</li>
              <li className="flex items-center gap-2"><span className="text-[#C5A059] font-bold">✓</span> Role-Based Access Control and Ed25519 Signatures</li>
            </ul>
          </div>

          {/* TELECOMMUNICATIONS & CRITICAL INFRASTRUCTURE */}
          <div className="border border-slate-800 bg-slate-900/40 p-8 rounded-2xl hover:border-[#00f0ff]/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[10px] font-bold text-[#00f0ff] uppercase tracking-wider bg-[#00f0ff]/10 px-3 py-1 rounded border border-[#00f0ff]/20">
                  NIS2 & CRITICAL INFRASTRUCTURE
                </span>
                <span className="text-xs font-mono text-slate-500">SECTOR 04</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-3">Telco & Critical Infrastructure</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Runtime guardrails for AI agents operating across communication networks and critical asset management systems, featuring indirect prompt injection defense.
              </p>
            </div>
            <ul className="text-xs font-mono text-slate-400 space-y-2 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2"><span className="text-[#00f0ff] font-bold">✓</span> Indirect Prompt Injection Mitigation</li>
              <li className="flex items-center gap-2"><span className="text-[#00f0ff] font-bold">✓</span> Ultra-low Latency SLA (&lt;1.2ms P99)</li>
              <li className="flex items-center gap-2"><span className="text-[#00f0ff] font-bold">✓</span> Autonomous Agent Execution Traceability</li>
            </ul>
          </div>

        </div>

        {/* BOTTOM CONVERSION BANNER */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center max-w-4xl mx-auto backdrop-blur-md">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-4">
            Need to tailor a custom industry use case?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
            We evaluate your current architecture's runtime governance posture and define the exact policy rulesets required to satisfy your compliance framework.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/discovery"
              className="bg-[#C5A059] text-black font-extrabold text-xs px-8 py-3.5 rounded-xl uppercase tracking-wider hover:bg-[#d6b16a] transition-all shadow-lg shadow-[#C5A059]/20 cursor-pointer"
            >
              Start Discovery
            </Link>
            <Link
              to="/pricing"
              className="border border-slate-700 text-slate-200 hover:text-white hover:border-[#00f0ff] font-bold text-xs px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer"
            >
              Request Architecture
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}