import React from 'react';
import HeroBackground from './canvas/HeroBackground';

export default function HeroSection() {
  return (
    <section className="relative pt-24 pb-6 px-4 sm:px-6 bg-[#050811] text-white overflow-hidden flex flex-col items-center justify-center">
      {/* Fondo interactivo Canvas */}
      <HeroBackground />

      {/* Resplandor ambiental de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#C5A059]/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-6xl w-full mx-auto text-center flex flex-col items-center space-y-3">
        
        {/* NOMBRE COMPLETO ESTILO FIRMA EN ORO FINO */}
        <div className="font-serif italic font-light text-xs sm:text-sm md:text-base text-[#C5A059] tracking-widest uppercase opacity-90 select-none">
          Sistema Avanzado de Análisis y Resguardo Estructurado
        </div>

        {/* ESCUDO / BANNER PRINCIPAL */}
        <div className="relative group w-full overflow-hidden rounded-2xl border border-[#C5A059]/30 bg-[#050811]">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#C5A059] via-[#E5C158] to-[#C5A059] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          
          <img 
            src="/Gemini_Generated_Image_ddbiwaddbiwaddbi.png" 
            alt="S.A.A.R.E." 
            className="relative w-full h-auto object-cover rounded-2xl block"
          />
        </div>

      </div>
    </section>
  );
}