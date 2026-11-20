// HeroSection.jsx
import React from 'react';

export const HeroSection = ({ onScrollToPricing, consoleUrl = '/console' }) => {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white pt-20 pb-24 border-b border-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/40 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wide uppercase mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Gobernanza Ex-Ante &amp; Trazabilidad Multitenant
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Gobernanza Determinista y{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
            Blindaje Perimetral L7
          </span>{' '}
          para la IA Corporativa
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Intercepta, sanitiza datos sensibles en memoria y sella cada interacción con aislamiento estricto por tenant.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onScrollToPricing}
            className="w-full sm:w-auto px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            Desplegar Nodo Corporativo →
          </button>

          <a
            href={consoleUrl}
            className="w-full sm:w-auto px-8 py-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm uppercase tracking-wider transition"
          >
            Acceder a Consola GRC
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;