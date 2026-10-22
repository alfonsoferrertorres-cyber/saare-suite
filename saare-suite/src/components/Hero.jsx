import React from 'react';
import { ShieldCheck, Zap, Lock, Terminal, FileCode2, Cpu } from 'lucide-react';
import { downloadGPOPolicy } from '../utils/api';

export default function Hero({ onOpenConsole }) {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium">
          <Zap className="w-3.5 h-3.5" />
          <span>Intercepción Ex-Ante Local | Latencia P99 ≤ 1.12 ms</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
          Gobernanza & Soberanía LLM <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Agnóstica en Capa 7 (Zero-Touch)
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Proteja los datos corporativos, enmascare PII en RAM volátil y certifique la cadena de custodia con sellado eIDAS RFC 3161 antes de que cualquier prompt toque los servidores de Google Gemini, OpenAI o Claude.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <button 
            onClick={downloadGPOPolicy}
            className="flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/25 transition"
          >
            <Lock className="w-4 h-4" />
            <span>Descargar Directiva GPO Enterprise (.reg)</span>
          </button>

          <button 
            onClick={onOpenConsole}
            className="flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition"
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Explorar Consola de Gobernanza (Sin Login)</span>
          </button>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <FileCode2 className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-base font-extrabold text-white">Despliegue SDK-less</h3>
          <p className="text-xs text-slate-400 mt-2">Inyección directa por Windows GPO/Registry sin modificar el código de sus aplicaciones ni instalar agentes pesados.</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <Cpu className="w-8 h-8 text-cyan-400 mb-3" />
          <h3 className="text-base font-extrabold text-white">Filtrado 7D en RAM</h3>
          <p className="text-xs text-slate-400 mt-2">Enmascaramiento de PII, secretos, jailbreaks y propiedad intelectual en memoria volátil epímera (`mlock_ephemeral`).</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <ShieldCheck className="w-8 h-8 text-indigo-400 mb-3" />
          <h3 className="text-base font-extrabold text-white">Prueba Judicial eIDAS</h3>
          <p className="text-xs text-slate-400 mt-2">Agregación en Árboles de Merkle, firmas Ed25519 y anclaje temporal RFC 3161 con plena validez (LEC Art. 326).</p>
        </div>
      </div>
    </section>
  );
}
