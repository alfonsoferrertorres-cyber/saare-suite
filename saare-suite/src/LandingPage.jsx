// saare-suite/src/LandingPage.jsx
import React, { useState } from 'react';
import PricingSection from './components/PricingSection';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import ProofInspectorWidget from "./ui/ProofInspectorWidget";
import ZeroCloudComparison from './components/ZeroCloudComparison';

// Ruta estática directa servida desde la carpeta public/
const consolePreviewImg = "/cabecera.png";

export default function LandingPage({ onNavigateToLogin }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [evaluationForm, setEvaluationForm] = useState({
    workEmail: '',
    company: '',
    role: 'CTO',
    aiSystems: '1-5',
    requirement: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handlePlanSelection = (planId) => {
    let mappedPlan = 'DISCOVER_FREE';
    if (planId === 'compliance') mappedPlan = 'TRIAL_COMPLIANCE_7D';
    if (planId === 'professional') mappedPlan = 'TRIAL_PRO_7D';
    if (planId === 'enterprise' || planId === 'private') mappedPlan = 'TRIAL_PRO_7D';

    if (typeof onNavigateToLogin === 'function') {
      onNavigateToLogin(mappedPlan);
    }
  };

  const handleEvaluationSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      
      {/* NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/90 border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-950 flex items-center justify-center font-bold text-base tracking-tighter">
              S
            </div>
            <span className="font-bold tracking-wider text-base text-slate-100">
              S.A.A.R.E. <span className="text-slate-400 font-normal text-xs ml-1">Suite</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300 tracking-wide uppercase">
            <a href="#console-preview" className="hover:text-cyan-400 transition-colors">Console</a>
            <a href="#platform" className="hover:text-cyan-400 transition-colors">Platform</a>
            <a href="#architecture" className="hover:text-cyan-400 transition-colors">Architecture</a>
            <a href="#proof-inspector" className="hover:text-cyan-400 transition-colors">Proof Inspector</a>
            <a href="#zerocloud" className="hover:text-cyan-400 transition-colors">Zero-Cloud</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigateToLogin && onNavigateToLogin('DISCOVER_FREE')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors">
              Access Console
            </button>
            <a 
              href="#evaluation"
              className="px-4 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-all shadow-md shadow-cyan-500/10">
              Request Evaluation
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH VIDEO EMBED */}
      <section className="relative pt-20 pb-16 px-6 border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-mono font-semibold tracking-widest text-cyan-400 uppercase mb-4">
            AI Compliance Infrastructure for ISVs
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Turn AI governance into executable controls.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            S.A.A.R.E. connects policies, runtime controls, and verifiable evidence across the AI software lifecycle.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
            <a 
              href="#evaluation"
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-all text-center shadow-lg shadow-cyan-500/20">
              Request Architecture Evaluation
            </a>
            <button 
              onClick={() => onNavigateToLogin && onNavigateToLogin('DISCOVER_FREE')}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl transition-all text-center">
              Acceder a S.A.A.R.E. Console ↗
            </button>
          </div>

          {/* VÍDEO DEMOSTRATIVO HERO (public/hero.mp4) */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-2 shadow-2xl shadow-cyan-950/30 overflow-hidden mb-12">
            <div className="relative w-full overflow-hidden rounded-xl bg-slate-950">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                controls 
                className="w-full h-auto max-h-[520px] object-cover rounded-xl"
              >
                <source src="/hero.mp4" type="video/mp4" />
                Tu navegador no soporta el reproductor de vídeo HTML5.
              </video>
            </div>
            <div className="py-2 text-[11px] font-mono text-slate-400 flex justify-between items-center px-3">
              <span>📹 S.A.A.R.E. Architecture & Runtime Governance Demo</span>
              <span className="text-cyan-400">Zero-Storage RAM L7 Enforcement</span>
            </div>
          </div>

          {/* TRUST STRIP */}
          <div className="pt-8 border-t border-slate-800/60 flex flex-wrap justify-center items-center gap-8 sm:gap-16 text-xs font-mono text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Compliance Console
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Control Layer
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Evidence Layer
            </div>
          </div>
        </div>
      </section>

      {/* CONSOLE PRODUCT SHOWCASE SECTION */}
      <section id="console-preview" className="py-20 px-6 max-w-7xl mx-auto border-b border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-2">
            Interactive Control Plane
          </p>
          <h2 className="text-3xl font-extrabold text-white mb-3">
            Gobernanza de IA en Tiempo Real en una Solución Unificada
          </h2>
          <p className="text-sm text-slate-400">
            Cambia sin fricción entre vistas Ejecutivas (CEO), Cumplimiento Legal (GRC/DPO) y Operaciones de Ciberseguridad (SOC/SecOps).
          </p>
        </div>

        {/* MARCO VIRTUAL DE CONSOLA */}
        <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl shadow-cyan-950/40 overflow-hidden backdrop-blur-md">
          {/* BARRA SUPERIOR DE LA VENTANA */}
          <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
              <span className="ml-3 text-[11px] font-mono text-slate-400">https://console.saare.es — S.A.A.R.E. Console GRC v8.1</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                SSE STREAM ACTIVO
              </span>
              <span className="text-slate-500 hidden sm:inline">Trust Anchor: SAARE-MD-IPRES-2026</span>
            </div>
          </div>

          {/* CAPTURA DE PANTALLA CON HOVER OVERLAY */}
          <div className="relative group overflow-hidden bg-slate-950 flex justify-center items-center">
            <img 
              src={consolePreviewImg} 
              onError={(e) => { e.target.src = "/saare-console-preview.png"; }}
              alt="Vista Previa de la Consola S.A.A.R.E. GRC" 
              className="w-full h-auto object-contain max-h-[600px] rounded-b-xl border-t border-slate-800/50 transition-transform duration-500 group-hover:scale-[1.01]"
            />
            
            {/* CTA FLOTANTE EN HOVER */}
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm p-4 text-center">
              <div>
                <h3 className="text-xl font-extrabold text-white mb-2">Prueba el Panel de Control S.A.A.R.E.</h3>
                <p className="text-xs text-slate-300 mb-4 max-w-md">Supervisa telemetría en vivo, ejecuta auditorías ex-ante y gestiona licencias RBAC.</p>
                <button 
                  onClick={() => onNavigateToLogin && onNavigateToLogin('DISCOVER_FREE')}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105">
                  Probar Consola en Vivo ↗
                </button>
              </div>
            </div>
          </div>

          {/* MÉTRICAS E INFORMACIÓN CLAVE */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-950/90 border-t border-slate-800/80 text-center text-xs">
            <div className="border-r border-slate-800/60 last:border-r-0">
              <span className="block text-slate-500 text-[10px] font-mono uppercase mb-1">Modo Multi-Rol</span>
              <strong className="text-slate-200">Executive / GRC / SecOps</strong>
            </div>
            <div className="border-r border-slate-800/60 last:border-r-0">
              <span className="block text-slate-500 text-[10px] font-mono uppercase mb-1">Residuos en Disco</span>
              <strong className="text-emerald-400">0 Bytes (Zero-Storage RAM)</strong>
            </div>
            <div className="border-r border-slate-800/60 last:border-r-0">
              <span className="block text-slate-500 text-[10px] font-mono uppercase mb-1">Marco Normativo</span>
              <strong className="text-cyan-400">EU AI Act / DORA / LOPDGDD</strong>
            </div>
            <div>
              <span className="block text-slate-500 text-[10px] font-mono uppercase mb-1">Sello Inmutable</span>
              <strong className="text-purple-400">Ed25519 & Merkle Anchor</strong>
            </div>
          </div>
        </div>
      </section>

      {/* MARKET REALITY */}
      <section id="platform" className="py-20 px-6 max-w-7xl mx-auto border-b border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-2">Market Reality</p>
          <h2 className="text-3xl font-bold text-white">AI software is shipping faster than governance</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl">
            <div className="text-cyan-400 font-mono text-sm font-bold mb-3">01 / SYSTEMS</div>
            <h3 className="text-lg font-bold text-white mb-2">More AI Systems</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Rapid proliferation of LLMs, agents, and autonomous flows embedded directly into core product features.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl">
            <div className="text-cyan-400 font-mono text-sm font-bold mb-3">02 / GOVERNANCE</div>
            <h3 className="text-lg font-bold text-white mb-2">More Governance</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Internal policies, customer security questionnaires, and evolving regulatory frameworks (EU AI Act, DORA, ISO/IEC 42001).
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl">
            <div className="text-cyan-400 font-mono text-sm font-bold mb-3">03 / EVIDENCE</div>
            <h3 className="text-lg font-bold text-white mb-2">More Evidence</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Escalating demand from enterprise buyers and auditors to continuously prove how decisions are authorized and enforced.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-base text-slate-300 font-medium">
            Governance does not stay in a document. <strong className="text-white">It reaches the runtime.</strong>
          </p>
        </div>
      </section>

      {/* VISUAL ARCHITECTURE */}
      <section id="architecture" className="py-20 px-6 max-w-7xl mx-auto border-b border-slate-800/60">
        <ArchitectureDiagram />
      </section>

      {/* CLIENT-SIDE PROOF INSPECTOR WIDGET */}
      <section id="proof-inspector" className="py-20 px-6 max-w-7xl mx-auto border-b border-slate-800/60">
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-2">Independent Verification</p>
          <h2 className="text-3xl font-bold text-white mb-3">Don't trust the dashboard. Verify the proof.</h2>
          <p className="text-sm text-slate-400">
            Inspect cryptographic proof packages locally. Verification evaluates cryptographic signatures, digest alignment, and timestamp bindings independently.
          </p>
        </div>
        <ProofInspectorWidget />
      </section>

      {/* ZERO-CLOUD COMPARISON */}
      <section id="zerocloud" className="py-20 px-6 max-w-7xl mx-auto border-b border-slate-800/60">
        <ZeroCloudComparison />
      </section>

      {/* TECHNICAL DIFFERENTIATION */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-b border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-2">Engineered for Performance</p>
          <h2 className="text-3xl font-bold text-white">Technical Rigor Serving Business Outcomes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border border-slate-800 p-6 rounded-xl bg-slate-900/30">
            <h3 className="text-base font-bold text-white mb-1">Stateless RAM Execution</h3>
            <p className="text-xs text-cyan-400 font-mono mb-3">Zero-Disk In-Memory Processing</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Business benefit:</strong> Minimizes data residency exposure and PII persistence risks by processing runtime policies in volatile memory.
            </p>
          </div>

          <div className="border border-slate-800 p-6 rounded-xl bg-slate-900/30">
            <h3 className="text-base font-bold text-white mb-1">Ed25519 & RFC 3161</h3>
            <p className="text-xs text-cyan-400 font-mono mb-3">Cryptographic & Timestamp Integrity</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Business benefit:</strong> Binds execution evidence to verifiable signatures and timestamping protocols for non-repudiation.
            </p>
          </div>

          <div className="border border-slate-800 p-6 rounded-xl bg-slate-900/30">
            <h3 className="text-base font-bold text-white mb-1">Deterministic Engine</h3>
            <p className="text-xs text-cyan-400 font-mono mb-3">Fail-Closed Control Logic</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Business benefit:</strong> Eliminates probabilistic governance errors and hallucinations in policy enforcement decisions.
            </p>
          </div>
        </div>
      </section>

      {/* MONOREPO VALUE */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-b border-slate-800/60">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 sm:p-12">
          <div className="max-w-3xl">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-2">Compliance as Code</p>
            <h2 className="text-3xl font-bold text-white mb-4">
              Compliance evolves with your code.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Policies and controls evolve directly alongside software source code. This maintains exact alignment between code versions, runtime execution rules, and generated evidence.
            </p>
            <div className="flex flex-wrap gap-3 font-mono text-xs">
              <span className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-slate-300">/apps</span>
              <span className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-slate-300">/packages</span>
              <span className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-cyan-400">/policies</span>
              <span className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-cyan-400">/controls</span>
              <span className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-emerald-400">/evidence</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing">
        <PricingSection onSelectPlan={handlePlanSelection} />
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 px-6 max-w-4xl mx-auto border-b border-slate-800/60">
        <div className="text-center mb-16">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 mb-2">Common Questions</p>
          <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Does S.A.A.R.E. replace my existing GRC platform?",
              a: "No. S.A.A.R.E. acts as an operational governance layer, executing runtime controls and generating verifiable evidence for AI systems."
            },
            {
              q: "Do I need to modify my existing AI models?",
              a: "No. The architecture is model-agnostic and interfaces at the Layer 7 control perimeter."
            },
            {
              q: "Is S.A.A.R.E. just a reporting dashboard?",
              a: "No. The platform combines three integrated layers: Compliance Console, L7 Control Layer (execution), and Evidence Layer (custody)."
            },
            {
              q: "Can S.A.A.R.E. be deployed in private infrastructure?",
              a: "Yes. Enterprise and Private tiers support On-Premise, Air-Gapped, or dedicated VPC deployments."
            },
            {
              q: "Which regulatory frameworks are supported?",
              a: "The platform structures executable controls designed to align with EU AI Act, DORA, ISO/IEC 42001, ISO 27001, and GDPR requirements."
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-4 text-left font-semibold text-sm text-white flex justify-between items-center hover:bg-slate-800/40 transition-colors">
                <span>{item.q}</span>
                <span className="text-cyan-400 font-mono">{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/50 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA & EVALUATION FORM */}
      <section id="evaluation" className="py-20 px-6 max-w-4xl mx-auto">
        <div className="bg-slate-900/80 border border-slate-800 p-8 sm:p-12 rounded-3xl relative overflow-hidden">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-white mb-3">
              Request an Architecture Evaluation
            </h2>
            <p className="text-sm text-slate-400">
              Review your AI system runtime boundaries, control layer placement, and evidence retention specifications with our engineering team.
            </p>
          </div>

          {formSubmitted ? (
            <div className="bg-emerald-950/60 border border-emerald-500/50 p-6 rounded-2xl text-emerald-300 font-medium text-center text-sm">
              ✓ Evaluation request received. A solutions architect will contact you within 24 hours.
            </div>
          ) : (
            <form onSubmit={handleEvaluationSubmit} className="space-y-4 max-w-xl mx-auto text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Work Email *
                  </label>
                  <input 
                    type="email" 
                    required 
                    placeholder="cto@company.com"
                    value={evaluationForm.workEmail}
                    onChange={(e) => setEvaluationForm({...evaluationForm, workEmail: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Company *
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="ISV Name"
                    value={evaluationForm.company}
                    onChange={(e) => setEvaluationForm({...evaluationForm, company: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <select 
                    value={evaluationForm.role}
                    onChange={(e) => setEvaluationForm({...evaluationForm, role: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500">
                    <option value="CTO">CTO / VP Engineering</option>
                    <option value="CISO">CISO / Security Director</option>
                    <option value="Compliance">Head of Compliance / GRC</option>
                    <option value="Product">Product Lead</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Number of AI Systems
                  </label>
                  <select 
                    value={evaluationForm.aiSystems}
                    onChange={(e) => setEvaluationForm({...evaluationForm, aiSystems: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500">
                    <option value="1-5">1 - 5 systems</option>
                    <option value="6-20">6 - 20 systems</option>
                    <option value="20+">20+ systems</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Primary Requirement
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., Runtime controls, customer security questionnaires, EU AI Act"
                  value={evaluationForm.requirement}
                  onChange={(e) => setEvaluationForm({...evaluationForm, requirement: e.target.value})}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20">
                Submit Architecture Evaluation Request ↗
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <p className="font-semibold text-slate-300">S.A.A.R.E. AI Governance Infrastructure</p>
            <p className="mt-1">Designed to support the preservation, integrity, and verification of electronic evidence.</p>
          </div>
          <div className="flex gap-6 font-mono text-[11px]">
            <a href="#architecture" className="hover:text-slate-300">Architecture</a>
            <a href="#proof-inspector" className="hover:text-slate-300">Inspector</a>
            <a href="#pricing" className="hover:text-slate-300">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}