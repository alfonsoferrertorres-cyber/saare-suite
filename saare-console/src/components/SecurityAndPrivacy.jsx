import React from 'react';

export default function SecurityAndPrivacy() {
  const privacyPillars = [
    {
      icon: "⚡",
      title: "Memoria RAM Volátil (< 2 ms)",
      badge: "STATELESS",
      badgeColor: "border-cyan-500/40 text-cyan-400 bg-cyan-950/60",
      description: "La inspección y evaluación de directivas ocurren exclusivamente en buffers de memoria efímera. Al concluir el filtrado, los buffers se liberan y sobrescriben de inmediato."
    },
    {
      icon: "🛡️",
      title: "Anonimización Determinista de PII",
      badge: "ZERO EXFILTRATION",
      badgeColor: "border-emerald-500/40 text-emerald-400 bg-emerald-950/60",
      description: "Detección ex-ante en capa de aplicación de DNIs, números de tarjeta, IBANs, tokens Bearer y API keys. Redacción local antes de emitir tráfico al LLM."
    },
    {
      icon: "🔒",
      title: "Criptografía Asimétrica Ed25519",
      badge: "NON-REPUDIATION",
      badgeColor: "border-purple-500/40 text-purple-400 bg-purple-950/60",
      description: "Cada evento de bloqueo genera un hash unívoco HMAC-SHA256 firmado con clave privada Ed25519. Permite acreditar cadena de custodia ante cualquier tribunal o auditor."
    },
    {
      icon: "🚫",
      title: "Residuo Cero en Reposo",
      badge: "RGPD ART. 5",
      badgeColor: "border-amber-500/40 text-amber-400 bg-amber-950/60",
      description: "S.A.A.R.E. no almacena el texto del prompt en ninguna base de datos ni envía telemetría de contenido a servidores externos. Únicamente se custodia la huella probatoria."
    }
  ];

  return (
    <section id="security-privacy" className="w-full bg-slate-950 text-white font-sans border-b border-slate-800 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase block mb-2">
            06 — SECURITY & PRIVACY BY DESIGN
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Garantía de Privacidad y Blindaje Criptográfico
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            ¿Cómo aseguramos que tu información confidencial nunca quede expuesta ni retenida por terceros?
          </p>
        </div>

        {/* Matriz de 4 Pilares de Privacidad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {privacyPillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{pillar.icon}</span>
                  <span className={`px-3 py-1 rounded-full border text-[10px] font-mono font-bold ${pillar.badgeColor}`}>
                    {pillar.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Ficha Técnica de Demostración */}
        <div className="p-8 rounded-3xl bg-slate-900/40 border border-cyan-500/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold block mb-1">
                EVIDENCIA FORENSE VERIFICABLE EN TIEMPO REAL
              </span>
              <h4 className="text-xl font-bold text-white mb-2">
                Audita la inmutabilidad y latencia desde el panel pericial
              </h4>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
                Comprueba cómo el motor ejecuta la verificación de firma y aislamiento de inquilino sin persistencia de datos.
              </p>
            </div>
            <a
              href="https://saare-grc-dashboard.streamlit.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap"
            >
              VERIFICAR EN DASHBOARD STREAMLIT ➔
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
