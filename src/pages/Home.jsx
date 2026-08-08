import React from 'react';
import { Link } from 'react-router-dom';
import HeroBackground from '../components/canvas/HeroBackground';
import ArchitectureSection from '../components/ArchitectureSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050811] text-white flex flex-col justify-between">
      
      {/* HERO SECTION - POSICIONAMIENTO PLATFORM */}
      <section className="relative w-full min-h-[680px] flex items-center justify-center overflow-hidden border-b border-slate-900">
        <HeroBackground />

        {/* Resplandor focal de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#C5A059]/5 blur-[140px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-5xl mx-auto text-center px-6 py-20">
          
          <span className="font-mono text-[10px] font-bold text-[#C5A059] uppercase tracking-widest bg-[#C5A059]/10 px-4 py-1.5 rounded-full border border-[#C5A059]/30 inline-block mb-6 shadow-[0_0_15px_rgba(197,160,89,0.1)]">
            SAARE Platform • AI Infrastructure
          </span>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6 leading-[1.1]">
            THE AI RUNTIME GOVERNANCE PLATFORM
          </h1>

          <p className="text-slate-300 text-base sm:text-xl font-light leading-relaxed max-w-3xl mx-auto mb-10">
            Deploy AI with control, policy enforcement, evidence and governance at runtime.
          </p>

          {/* EMBUDO COMERCIAL ENTERPRISE & DESCARGA DOCUMENTAL */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <Link
              to="/pricing"
              className="bg-[#C5A059] text-black font-extrabold text-xs px-8 py-4 rounded-xl uppercase tracking-wider hover:bg-[#d6b16a] transition-all shadow-lg shadow-[#C5A059]/20 hover:scale-[1.02] cursor-pointer"
            >
              Request Architecture
            </Link>

            <Link
              to="/discovery"
              className="bg-slate-900/80 text-slate-200 border border-slate-700 font-bold text-xs px-8 py-4 rounded-xl uppercase tracking-wider hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all backdrop-blur-md hover:scale-[1.02] cursor-pointer"
            >
              Start Discovery
            </Link>
          </div>

          {/* DESCARGAS DE DOCUMENTACIÓN TÉCNICA (PUBLIC/DOCS) */}
          <div className="flex flex-wrap justify-center items-center gap-6 pt-4 border-t border-slate-800/60 max-w-2xl mx-auto">
            <a
              href="/docs/SAARE-Technical-Whitepaper-v14.pdf"
              download="SAARE-Technical-Whitepaper-v14.pdf"
              className="font-mono text-[11px] text-slate-400 hover:text-[#C5A059] transition-colors flex items-center gap-2 group cursor-pointer"
            >
              <span className="text-[#C5A059] font-bold">↓</span>
              <span className="underline underline-offset-4 group-hover:text-white">Technical Whitepaper (PDF)</span>
            </a>

            <span className="text-slate-700 hidden sm:inline">•</span>

            <a
              href="/docs/SAARE-Technical-Whitepaper-v16.pdf"
              download="SAARE-Technical-Whitepaper-v16.pdf"
              className="font-mono text-[11px] text-slate-400 hover:text-[#00f0ff] transition-colors flex items-center gap-2 group cursor-pointer"
            >
              <span className="text-[#00f0ff] font-bold">↓</span>
              <span className="underline underline-offset-4 group-hover:text-white">Verification Spec V16 (PDF)</span>
            </a>
          </div>

        </div>
      </section>

      {/* DEMOSTRACIÓN TÉCNICA - DATA PLANE INSPECTION */}
      <section className="relative z-10">
        <ArchitectureSection />
      </section>

    </div>
  );
}