import React from 'react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-black pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold bg-blue-950/60 px-4 py-1.5 rounded-full border border-blue-800/40">
          Middleware de Gobernanza e IA en RAM
        </span>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Seguridad de Datos Sensitivos y Filtrado Avanzado L7
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
          Plataforma de gobernanza en tiempo real con evidencia criptográfica Ed25519 y control contextual para agentes IA.
        </p>

        {/* Botonera Principal de Enlaces */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a 
            href="/console" 
            className="px-6 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-lg shadow-blue-600/30"
          >
            Acceder a la Consola
          </a>
          <a 
            href="https://console.saare.es" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold transition"
          >
            Consola Directa (Edge)
          </a>
          <a 
            href="#arquitectura" 
            className="px-6 py-3.5 rounded-lg bg-transparent hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800 font-medium transition"
          >
            Ver Arquitectura
          </a>
        </div>
      </div>
    </section>
  );
}
