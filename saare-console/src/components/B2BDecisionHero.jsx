import React from 'react';

export default function B2BDecisionHero() {
  return (
    <div className="w-full bg-slate-950 text-white font-sans border-b border-slate-800">
      
      {/* 01. CABECERA CORPORATIVA DE DECISIÓN B2B */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6 text-center">
        {/* Resplandor decorativo de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase mb-8">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            AI GOVERNANCE & L7 SECURITY GATEWAY
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
            Protege tus datos antes <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
              de que lleguen al LLM.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 font-normal leading-relaxed mb-10">
            S.A.A.R.E. inspecciona, anonimiza y genera evidencia forense inmutable de cada interacción con IA, desde el perímetro de tu infraestructura. <strong className="text-white font-semibold">Sin modificar tus modelos de lenguaje ni almacenar datos en reposo.</strong>
          </p>

          {/* ACCIONES PRINCIPALES */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <a
              href="https://saare-grc-dashboard.streamlit.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-7 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20"
            >
              📊 VER AUDITORÍA GRC EN STREAMLIT →
            </a>
            <a
              href="https://console.saare.es"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-semibold px-6 py-3.5 rounded-xl text-sm transition-all"
            >
              🛡️ ACCESO CONSOLA GRC
            </a>
            <a
              href="#riesgos-empresariales"
              className="inline-flex items-center gap-2 bg-slate-900/60 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold px-6 py-3.5 rounded-xl text-sm transition-all"
            >
              🔍 MATRIZ DE RIESGOS
            </a>
          </div>

          {/* METADATOS TÉCNICOS VERIFICADOS */}
          <div className="flex flex-wrap justify-center gap-3 text-xs font-mono text-slate-400">
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
              ⚡ Latencia RAM: <strong className="text-cyan-400">1.16 ms</strong>
            </span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
              🔒 Firma Forense: <strong className="text-emerald-400">Ed25519 + SHA-256</strong>
            </span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
              📜 Registro RPI: <strong className="text-amber-400">2607076315021</strong>
            </span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
              🛡️ Cobertura: <strong className="text-blue-400">EU AI Act · ISO 42001 · DORA</strong>
            </span>
          </div>
        </div>
      </section>

      {/* 02. BLOQUE DE RESOLUCIÓN DE RIESGOS EMPRESARIALES */}
      <section id="riesgos-empresariales" className="w-full bg-slate-900/40 border-t border-slate-800/80 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-14">
            <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase block mb-2">
              ZERO TRUST PARA INTELIGENCIA ARTIFICIAL
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
              ¿Qué riesgos elimina S.A.A.R.E. en tu organización?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
              Control técnico preventivo ex-ante que transforma la adopción de IA en una ventaja competitiva segura, auditable y jurídicamente blindada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Tarjeta 1: PII y Secretos */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-xl mb-4">
                🛡️
              </div>
              <h3 className="text-base font-bold text-white mb-2">Fuga de PII y Secretos</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Intercepta y redacta automáticamente DNIs, IBANs, tarjetas de crédito y API keys en memoria volátil antes de su transmisión al modelo externo.
              </p>
            </div>

            {/* Tarjeta 2: Shadow AI */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-xl mb-4">
                👁️
              </div>
              <h3 className="text-base font-bold text-white mb-2">Control de Shadow AI</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Aplica directivas corporativas centralizadas en ChatGPT, Claude, Gemini o APIs privadas sin depender de configuraciones individuales por empleado.
              </p>
            </div>

            {/* Tarjeta 3: Cumplimiento GRC */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-xl mb-4">
                ⚖️
              </div>
              <h3 className="text-base font-bold text-white mb-2">Sanciones Regulatorias</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Garantiza la debida diligencia ante la AEPD y los requerimientos de gobernanza bajo la directiva europea EU AI Act, ISO 42001 e ISO 27001.
              </p>
            </div>

            {/* Tarjeta 4: No Repudio Forense */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-xl mb-4">
                📜
              </div>
              <h3 className="text-base font-bold text-white mb-2">Falta de Trazabilidad</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Sella cada intento de exfiltración con un hash HMAC-SHA256 inmutable en la bóveda, generando evidencia técnica admisible en sede judicial.
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}

