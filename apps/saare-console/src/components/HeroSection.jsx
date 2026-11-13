import React from 'react';

export const HeroSection = ({ onScrollToPricing }) => {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white pt-20 pb-24 border-b border-slate-800">
      {/* Fondo sutil con gradiente técnico */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/40 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
        {/* Badge de cumplimiento normativo */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wide uppercase mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Protocolo MS3V · Cumplimiento Ex-Ante EU AI Act & RGPD
        </div>

        {/* Titular principal */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Gobernanza Determinista y{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
            Blindaje Perimetral L7
          </span>{' '}
          para la IA Corporativa
        </h1>

        {/* Subtítulo de propuesta de valor */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Intercepta, sanitiza datos sensibles (PII y secretos industriales) en memoria RAM volátil y sella cada interacción con cualquier LLM bajo cadena de custodia criptográfica SHA-256 y RFC-3161.
        </p>

        {/* Botones de acción (Embudo de conversión) */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onScrollToPricing}
            className="w-full sm:w-auto px-8 py-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            Desplegar Nodo Corporativo →
          </button>

          <a
            href="https://console.saare.es/?tenant=DEMO_ENTERPRISE"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm uppercase tracking-wider transition"
          >
            Acceder a Consola GRC Live
          </a>
        </div>

        {/* Indicadores de confianza técnica */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto pt-10 border-t border-slate-800/80 text-left">
          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            <div className="text-cyan-400 font-mono text-xs font-bold uppercase">01 · Zero-PII en RAM</div>
            <h3 className="text-white font-bold text-base mt-1">Sanitización Ex-Ante</h3>
            <p className="text-slate-400 text-sm mt-1">
              Anonimización automática de NIF, IBAN y claves API antes de abandonar el perímetro del navegador.
            </p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            <div className="text-emerald-400 font-mono text-xs font-bold uppercase">02 · Agnóstico a Modelos</div>
            <h3 className="text-white font-bold text-base mt-1">Multi-LLM Proxy L7</h3>
            <p className="text-slate-400 text-sm mt-1">
              Compatible con OpenAI, Gemini, Anthropic, DeepSeek y nodos locales Ollama sin fricción.
            </p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            <div className="text-amber-400 font-mono text-xs font-bold uppercase">03 · Validez Probatoria</div>
            <h3 className="text-white font-bold text-base mt-1">Bóveda WORM & eIDAS</h3>
            <p className="text-slate-400 text-sm mt-1">
              Trazabilidad inmutable con anclaje Merkle y sellado temporal cualificado bajo Art. 326 LEC.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;