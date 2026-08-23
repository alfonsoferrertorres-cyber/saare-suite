import React from 'react';
import { Link } from 'react-router-dom';

export default function Developers() {
  return (
    <div className="min-h-screen bg-[#050811] text-white pt-24 pb-20 px-4 sm:px-6 font-sans relative overflow-hidden border-t border-slate-900">
      
      {/* CAPA DE IMAGEN DE FONDO REALZADA (61e62dfdd3f3b01b84ece516_honeycomb.jpg) */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url('/61e62dfdd3f3b01b84ece516_honeycomb.jpg')` }}
      />
      
      {/* MÁSCARA DE DEGRADADO CORPORATIVA PARA TRASLUCIDEZ */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050811]/30 via-[#050811]/60 to-[#050811]/85 pointer-events-none" />

      {/* Resplandor ambiental sobrio en oro */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#C5A059]/15 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        
        {/* ENCABEZADO DE SECCIÓN */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-4 py-1.5 rounded-full border border-[#C5A059]/40 inline-block backdrop-blur-md">
            RECURSOS PARA DESARROLLADORES Y API
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight text-[#C5A059] leading-tight drop-shadow-md">
            Centro de integración
          </h1>
          <p className="text-slate-200 text-sm sm:text-base font-normal leading-relaxed max-w-2xl mx-auto drop-shadow">
            Integre el motor S.A.A.R.E. en el flujo de trabajo de su aplicación mediante sockets de dominio UNIX, proxies REST o enlaces de lenguaje ABI nativos de C/Rust.
          </p>
        </div>

        {/* RESUMEN EXTENDIDO DE LA PESTAÑA */}
        <div className="bg-[#0B0F19]/80 border border-[#C5A059]/40 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-5 shadow-2xl">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#C5A059] border-b border-slate-800 pb-3">
            Gobernanza de IA Determinista en Tiempo de Ejecución
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            El Centro de Integración pone a disposición de desarrolladores, ingenieros de IA y arquitectos de software los conectores de bajo nivel requeridos para interceptar, auditar y sanitizar ex-ante cualquier carga útil dirigida a modelos de lenguaje (LLMs) o agentes autónomos (MCP).
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 font-mono text-xs">
            <div className="bg-[#050811]/70 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
              <span className="text-[#C5A059] font-bold block">1. Sockets POSIX UNIX</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Comunicación inter-proceso de baja latencia mediante conectores locales (`/var/run/saare_core.sock`) para entornos Unix/Linux sin sobrecarga de red.
              </p>
            </div>

            <div className="bg-[#050811]/70 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
              <span className="text-[#C5A059] font-bold block">2. Enlaces ABI C / Rust</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Consumo in-process como librería dinámica o estática (`.dll` / `.so`), alcanzando velocidades de procesamiento sub-milisegundo (&lt; 0,82 ms).
              </p>
            </div>

            <div className="bg-[#050811]/70 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
              <span className="text-[#C5A059] font-bold block">3. Proxies API REST</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Pasarela intermedia transparente compatible con las especificaciones de OpenAI, Anthropic y Ollama para enrutamiento seguro instantáneo.
              </p>
            </div>
          </div>
        </div>

        {/* MUESTRA DE CÓDIGO DE INTEGRACIÓN */}
        <div className="bg-[#0B0F19]/80 border border-slate-800 p-6 sm:p-8 rounded-2xl space-y-4 backdrop-blur-md shadow-2xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="font-mono text-xs font-bold text-[#C5A059]">
              Conexión de bajo consumo para zócalos POSIX
            </span>
            <span className="font-mono text-[10px] text-slate-400">Node.js / JavaScript</span>
          </div>

          <pre className="font-mono text-xs text-slate-200 overflow-x-auto p-4 bg-[#050811]/90 rounded-xl border border-slate-800/80 leading-relaxed shadow-inner">
            <code>{`const net = require('net');

// Conexión con socket local UNIX de alto rendimiento
const socket = net.connect('/var/run/saare_core.sock');

// Reenvío de carga útil compatible con OpenAI para inspección ex-ante en RAM
const payload = {
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Execute workflow analysis' }]
};

socket.write(JSON.stringify(payload));`}</code>
          </pre>
        </div>

        {/* BOTÓN PRINCIPAL */}
        <div className="text-center pt-2">
          <Link
            to="/discovery"
            className="inline-block bg-[#C5A059] hover:bg-white text-black font-extrabold text-xs px-8 py-3.5 rounded-xl uppercase tracking-wider transition-all shadow-lg hover:shadow-[#C5A059]/20 cursor-pointer font-mono"
          >
            Acceder al Sandbox de Desarrolladores
          </Link>
        </div>

      </div>
    </div>
  );
}
