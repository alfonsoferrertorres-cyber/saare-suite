import React from "react";
import { ShieldCheck } from "lucide-react";

export default function HeroSection({ onOpenLicencias }) {
  return (
    <section className="relative px-4 sm:px-6 pt-6 max-w-7xl mx-auto">
      <div className="relative rounded-3xl border border-slate-800 bg-[#050811] overflow-hidden min-h-[460px] flex items-end p-6 sm:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-cover bg-center opacity-70 pointer-events-none" style={{ backgroundImage: "url(/saare_auditor_sovereignty.jfif)" }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl bg-slate-950/90 border border-slate-800 p-6 sm:p-8 rounded-2xl backdrop-blur-md space-y-4 shadow-2xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
            <span className="text-[10px] font-mono tracking-widest text-[#C5A059] uppercase font-bold">Soberanía Digital e Inferencia Confiable</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">Gobernanza Técnica e Inmutabilidad Forense L7</h1>
          <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">Middleware perimetral para el blindaje de modelos de lenguaje en RAM, erradicación de fugas PII y trazabilidad criptográfica probatoria SHA-256 e ISO 42001.</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={onOpenLicencias} className="px-5 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#dfba6f] text-black font-black font-mono text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-105">Obtener Licencias (-50%)</button>
            <a href="#calculadora" className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black font-mono text-xs uppercase tracking-wider transition-all shadow-lg hover:scale-105 flex items-center gap-1.5"><span>Probar Sandbox L7</span><span className="text-amber-300">⚡</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
