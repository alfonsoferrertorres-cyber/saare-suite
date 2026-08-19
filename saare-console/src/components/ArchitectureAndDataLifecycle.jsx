import React from 'react';

export default function ArchitectureAndDataLifecycle() {
  return (
    <div id="arquitectura-l7" className="w-full bg-slate-950 text-white font-sans border-b border-slate-800 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* ENCABEZADO DE SECCIÓN */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase block mb-2">
            INGENIERÍA PERIMETRAL EX-ANTE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Arquitectura L7 y Flujo de Inspección
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Cómo opera S.A.A.R.E. en la capa de aplicación antes de que cualquier token alcance un proveedor de Inteligencia Artificial externo o interno.
          </p>
        </div>

        {/* 01. DIAGRAMA VISUAL DEL PIPELINE */}
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl mb-16 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center text-center">
            
            {/* Paso 1: Origen */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-2xl mb-2">💻</div>
              <span className="text-xs font-mono text-cyan-400 block font-bold">01. ORIGEN</span>
              <p className="text-sm font-semibold text-white mt-1">Usuario / App / API</p>
              <p className="text-xs text-slate-400 mt-2">Navegador corporativo, SDK o llamada HTTP.</p>
            </div>

            <div className="hidden md:flex justify-center text-cyan-500 text-xl font-bold">➔</div>

            {/* Paso 2: SAARE Gateway (RAM) */}
            <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 shadow-lg shadow-cyan-500/10">
              <div className="text-2xl mb-2">⚡</div>
              <span className="text-xs font-mono text-cyan-300 block font-bold">02. SAARE GATEWAY</span>
              <p className="text-sm font-semibold text-white mt-1">Policy Engine (RAM)</p>
              <p className="text-xs text-slate-300 mt-2">Inspección ex-ante en &lt; 2 ms. Detección PII.</p>
            </div>

            <div className="hidden md:flex justify-center text-cyan-500 text-xl font-bold">➔</div>

            {/* Paso 3: Destino IA */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-2xl mb-2">🤖</div>
              <span className="text-xs font-mono text-emerald-400 block font-bold">03. LLM DESTINO</span>
              <p className="text-sm font-semibold text-white mt-1">Inferencia Segura</p>
              <p className="text-xs text-slate-400 mt-2">OpenAI, Anthropic, Azure o Modelos Locales.</p>
            </div>

          </div>

          {/* Sello de salida forense */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Evidencia criptográfica generada: <strong className="text-slate-200">HMAC-SHA256 + Ed25519</strong></span>
            </div>
            <a
              href="https://saare-grc-dashboard.streamlit.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4"
            >
              Verificar telemetría en Dashboard Streamlit ➔
            </a>
          </div>
        </div>

        {/* 02. SECCIÓN CISO: ¿DÓNDE ESTÁN MIS DATOS? */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">🔒</span> Ciclo de Vida: ¿Dónde están mis datos?
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              S.A.A.R.E. implementa un diseño <strong>Stateless estricto con residuo cero</strong>. Los datos confidenciales nunca se persisten en disco ni en bases de datos intermedias.
            </p>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-cyan-400 font-bold block mb-1">1. EN MEMORIA (RAM VOLÁTIL)</span>
                <span className="text-slate-300">El payload se evalúa en buffers efímeros. Al completarse la regla de política, la memoria se libera de inmediato.</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-emerald-400 font-bold block mb-1">2. EN REPOSO (0 BYTES DE PROMPT)</span>
                <span className="text-slate-300">No se guardan logs con el texto original. Solo se custodia la huella digital (hash unívoco) y el veredicto de auditoría.</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-purple-400 font-bold block mb-1">3. EN TRÁNSITO (HACIA EL LLM)</span>
                <span className="text-slate-300">Únicamente viajan tokens redactados o autorizados mediante túneles cifrados TLS 1.3 con clave corporativa.</span>
              </div>
            </div>
          </div>

          {/* MATRIZ DE RETENCIÓN Y EVIDENCIA */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-emerald-400">⚖️</span> Matriz de Retención y Garantía RGPD
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3">Elemento</th>
                    <th className="pb-3">Tratamiento</th>
                    <th className="pb-3 text-right">Persistencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-3 font-semibold text-white">Prompt Original</td>
                    <td className="py-3 text-slate-400">Inspección RAM</td>
                    <td className="py-3 text-right text-red-400 font-bold">0 Segundos (Purga)</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-white">PII / Secretos</td>
                    <td className="py-3 text-slate-400">Anonimización / Bloqueo</td>
                    <td className="py-3 text-right text-red-400 font-bold">No Persistido</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-white">Hash Forense</td>
                    <td className="py-3 text-slate-400">Sello Criptográfico</td>
                    <td className="py-3 text-right text-emerald-400 font-bold">Evidence Vault</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-white">Metadatos GRC</td>
                    <td className="py-3 text-slate-400">Tenant, Timestamp, Regla</td>
                    <td className="py-3 text-right text-cyan-400 font-bold">Dashboard Audit</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-300">
              <strong className="text-cyan-400 block mb-1">Garantía de Soberanía:</strong>
              Cumplimiento estricto del principio de minimización de datos (Art. 5.1.c RGPD) y requerimientos de gobernanza bajo ISO 42001.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
