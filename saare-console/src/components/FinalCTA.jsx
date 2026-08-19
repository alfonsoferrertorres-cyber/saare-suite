import React from 'react';

export default function FinalCTA() {
  return (
    <section id="cta-final" className="w-full bg-slate-950 text-white font-sans py-24 px-6 relative overflow-hidden border-t border-slate-800">
      
      {/* Resplandor decorativo perimetral */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-cyan-500/10 via-blue-500/10 to-transparent blur-[140px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase mb-8 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          PRUEBA DE CONCEPTO EMPRESARIAL · 7 DÍAS GRATIS
        </div>

        {/* Mensaje de alto impacto */}
        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
          Tu IA ya está funcionando. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
            Ahora haz que sea gobernable.
          </span>
        </h2>

        <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed mb-12">
          Activa la inspección L7 en el perímetro de tu infraestructura. Sin fricción, sin modificar tus modelos y con informe pericial de auditoría forense incluido.
        </p>

        {/* Botonera de Conversión */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a
            href="https://saare-grc-dashboard.streamlit.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-8 py-4 rounded-xl text-sm uppercase tracking-wider transition-all shadow-xl shadow-cyan-500/20"
          >
            PROBAR SANDBOX L7 (7 DÍAS GRATIS) ➔
          </a>
          <a
            href="https://buy.stripe.com/cNiaEX2zz2dTegz2NL8g004"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-semibold px-8 py-4 rounded-xl text-sm uppercase tracking-wider transition-all shadow-md"
          >
            💳 CONTRATAR LICENCIA EMPRESA
          </a>
        </div>

        {/* Garantías y Reducción de Fricción */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-mono text-slate-400 pt-8 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Sin tarjeta requerida</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Compatible con OpenAI API</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Despliegue GPO en 5 min</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Informe pericial con firma Ed25519</span>
          </div>
        </div>

      </div>
    </section>
  );
}
