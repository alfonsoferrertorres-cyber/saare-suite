import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Platform() {
  const [activeLayer, setActiveLayer] = useState('runtime');

  const layerDetails = {
    runtime: {
      title: 'SAARE Runtime (Data Plane)',
      subtitle: 'Layer 7 Interception & In-Memory Inspection',
      color: '#00f0ff',
      description: 'Ultra-lightweight execution engine acting as an inline proxy between clients/agents and LLM endpoints. Evaluates prompts and completions in real time with sub-millisecond latency.',
      capabilities: [
        'Volatile RAM inspection with latency < 1.2ms',
        'Ex-ante sanitization of sensitive data (PII / PCI / PHI)',
        'Active blocking of Prompt Injection & Jailbreak vectors',
        'Dynamic routing & automated failover across LLMs'
      ],
      techStack: 'Rust / C-ABI Native / WebAssembly'
    },
    control: {
      title: 'Transversal Control Plane',
      subtitle: 'Centralized Policy Orchestration & Management',
      color: '#C5A059',
      description: 'Logical administration layer distributing governance policies, managing license parameters, and synchronizing security rules across active Runtime nodes.',
      capabilities: [
        'Centralized declarative policy engine',
        'Multi-tenant license & Role-Based Access Control (RBAC)',
        'TLS 1.3 synchronization with execution nodes',
        'Real-time infrastructure health & status monitoring'
      ],
      techStack: 'gRPC / Distributed Control Plane / REST API'
    },
    assurance: {
      title: 'SAARE Assurance (Evidence Layer)',
      subtitle: 'Auditable Cryptographic Evidence & Traceability',
      color: '#C5A059',
      description: 'Generates immutable, cryptographically signed audit receipts designed to satisfy enterprise risk audits, regulatory mandates (EU AI Act, DORA), and executive reviews.',
      capabilities: [
        'Per-transaction immutable Ed25519 cryptographic signatures',
        'Automated technical control mapping (EU AI Act / DORA / NIS2)',
        'Executive risk posture dashboards',
        'Technical evidence package export for regulatory review'
      ],
      techStack: 'Ed25519 / Immutable Logs / OpenTelemetry'
    }
  };

  const current = layerDetails[activeLayer];

  return (
    <div className="min-h-screen bg-[#050811] text-white pt-24 pb-20 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* HERO PLATFORM */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <span className="font-mono text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest bg-[#00f0ff]/10 px-4 py-1.5 rounded-full border border-[#00f0ff]/20 inline-block">
            SAARE Platform Architecture
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-white">
            The AI Runtime Governance Platform
          </h1>
          <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
            Explore the three interconnected layers powering SAARE’s deterministic execution engine.
          </p>
        </div>

        {/* INTERACTIVE LAYER SELECTION */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-8">
          <div className="text-center mb-6">
            <span className="font-mono text-[10px] font-bold text-[#C5A059] uppercase tracking-widest">
              Core Architecture Hierarchy
            </span>
            <h2 className="text-2xl font-serif font-bold text-white mt-1">
              Unified Layer Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-1">Click on any layer to view technical specifications</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* LAYER 1 */}
            <button
              onClick={() => setActiveLayer('runtime')}
              className={`text-left p-6 rounded-xl border transition-all cursor-pointer ${
                activeLayer === 'runtime'
                  ? 'border-[#00f0ff] bg-[#00f0ff]/10 shadow-[0_0_20px_rgba(0,240,255,0.15)] scale-[1.02]'
                  : 'border-slate-800 bg-[#050811]/80 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] font-mono text-[#00f0ff] font-bold">01 / DATA PLANE</span>
              <h3 className="text-xl font-bold text-white mt-2 mb-1">SAARE Runtime</h3>
              <p className="text-xs text-slate-400">L7 interception and in-memory inspection.</p>
            </button>

            {/* LAYER 2 */}
            <button
              onClick={() => setActiveLayer('control')}
              className={`text-left p-6 rounded-xl border transition-all cursor-pointer ${
                activeLayer === 'control'
                  ? 'border-[#C5A059] bg-[#C5A059]/10 shadow-[0_0_20px_rgba(197,160,89,0.15)] scale-[1.02]'
                  : 'border-slate-800 bg-[#050811]/80 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] font-mono text-[#C5A059] font-bold">02 / TRANSVERSAL LAYER</span>
              <h3 className="text-xl font-bold text-white mt-2 mb-1">Control Plane</h3>
              <p className="text-xs text-slate-400">Centralized orchestration and policy enforcement.</p>
            </button>

            {/* LAYER 3 */}
            <button
              onClick={() => setActiveLayer('assurance')}
              className={`text-left p-6 rounded-xl border transition-all cursor-pointer ${
                activeLayer === 'assurance'
                  ? 'border-[#C5A059] bg-[#C5A059]/10 shadow-[0_0_20px_rgba(197,160,89,0.15)] scale-[1.02]'
                  : 'border-slate-800 bg-[#050811]/80 hover:border-slate-700'
              }`}
            >
              <span className="text-[10px] font-mono text-[#C5A059] font-bold">03 / EVIDENCE & GOVERNANCE</span>
              <h3 className="text-xl font-bold text-white mt-2 mb-1">SAARE Assurance</h3>
              <p className="text-xs text-slate-400">Cryptographic evidence and compliance reports.</p>
            </button>

          </div>

          {/* ACTIVE LAYER SPECIFICATION PANEL */}
          <div className="border border-slate-800 bg-[#050811]/90 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: current.color }}>
                  Active Layer Specification
                </span>
                <h3 className="text-2xl font-serif font-bold text-white mt-1">{current.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{current.subtitle}</p>
              </div>
              <span className="font-mono text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                Stack: <span className="text-white font-bold">{current.techStack}</span>
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {current.description}
            </p>

            <div>
              <h4 className="text-xs font-mono font-bold uppercase text-slate-400 mb-3 tracking-wider">
                Key Capabilities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                {current.capabilities.map((cap, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-slate-900/60 border border-slate-800 p-3 rounded-lg">
                    <span style={{ color: current.color }} className="font-bold">✓</span>
                    <span className="text-slate-200">{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* THREE CORE PILLARS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-3">
            <span className="text-[#00f0ff] font-mono text-xs font-bold">01 • INLINE PEP</span>
            <h3 className="text-lg font-bold text-white">Ex-Ante Interception</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Blocks malicious prompt injections, exfiltration vectors, and non-compliant payload structures prior to cloud or local LLM execution.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-3">
            <span className="text-[#C5A059] font-mono text-xs font-bold">02 • ZERO PERSISTENCE</span>
            <h3 className="text-lg font-bold text-white">RAM-Only Processing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Operates within isolated memory buffers. Payload contents are scrubbed ex-ante with zero persistent storage disk I/O.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-3">
            <span className="text-purple-400 font-mono text-xs font-bold">03 • CRYPTOGRAPHIC PROOF</span>
            <h3 className="text-lg font-bold text-white">Ed25519 Receipts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates tamper-evident audit receipts combining nonces, timestamps, and Ed25519 signatures for mathematical traceability.
            </p>
          </div>
        </div>

        {/* DEPLOYMENT ENVIRONMENT AND DATA FLOW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-slate-800 bg-slate-900/30 p-8 rounded-2xl">
            <h3 className="font-serif text-xl font-bold text-white mb-4">Where SAARE Runs</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Native infrastructure integration without proprietary vendor lock-in.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-300">
              <div className="p-3 bg-[#050811] border border-slate-800 rounded-lg">AWS / Azure / GCP</div>
              <div className="p-3 bg-[#050811] border border-slate-800 rounded-lg">Kubernetes / Docker</div>
              <div className="p-3 bg-[#050811] border border-slate-800 rounded-lg">On-Premise Private Cloud</div>
              <div className="p-3 bg-[#050811] border border-slate-800 rounded-lg">Air-Gapped / High-Sec</div>
            </div>
          </div>

          <div className="border border-slate-800 bg-slate-900/30 p-8 rounded-2xl">
            <h3 className="font-serif text-xl font-bold text-white mb-4">Where Data Flows</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Zero unauthorized persistence. Exclusive inspection executed in volatile RAM.
            </p>
            <ul className="space-y-3 text-xs text-slate-300 font-mono">
              <li className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Payload Inspection:</span>
                <span className="text-[#00f0ff]">Volatile RAM (Zero-Disk)</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Telemetry Storage:</span>
                <span className="text-[#C5A059]">Customer Tenant VPC</span>
              </li>
              <li className="flex justify-between pb-1">
                <span className="text-slate-400">Control Signals:</span>
                <span className="text-white">Encrypted TLS 1.3</span>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM CTAS */}
        <div className="text-center pt-8 border-t border-slate-900 flex flex-wrap justify-center gap-4">
          <Link
            to="/discovery"
            className="border border-slate-700 text-slate-300 hover:text-white hover:border-[#00f0ff] font-bold text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider transition-all"
          >
            Start Discovery
          </Link>
          <Link
            to="/pricing"
            className="bg-[#C5A059] text-black font-extrabold text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider hover:bg-[#d6b16a] transition-all shadow-lg shadow-[#C5A059]/20"
          >
            Request Architecture Review
          </Link>
        </div>

      </div>
    </div>
  );
}