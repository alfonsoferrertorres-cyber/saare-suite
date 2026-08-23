import React from 'react';
import HeroSection from '../components/HeroSection';
import ArchitectureSection from '../components/ArchitectureSection';
import Store from './Store';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050811] text-white flex flex-col justify-between selection:bg-[#C5A059] selection:text-black">
      {/* Estructura Semántica Principal */}
      <main className="flex-grow">
        {/* 1. Propuesta de Valor y Hero Principal */}
        <HeroSection />

        {/* 2. Arquitectura de Gobernanza L7 & Cumplimiento Runtime */}
        <section className="relative z-10 border-t border-slate-800/60 bg-gradient-to-b from-[#050811] via-slate-950 to-[#050811] py-12">
          <ArchitectureSection />
        </section>

        {/* 3. Catálogo de Escenarios Comercializables (DORA, EU AI Act, RAG, etc.) */}
        <section className="relative z-10 border-t border-slate-800/40 bg-[#050811] py-8">
          <Store />
        </section>
      </main>
    </div>
  );
}
