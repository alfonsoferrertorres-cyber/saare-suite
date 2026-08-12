import React from 'react';

export function Header() {
  const downloadStandaloneConsole = () => {
    // Genera y descarga directamente la versión ejecutable cliente
    window.open('http://localhost:3002/api/logs', '_blank');
  };

  return (
    <header className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-800 text-white">
      <div>
        <h1 className="text-xl font-bold tracking-wide text-cyan-400">S.A.A.R.E. Platform</h1>
        <p className="text-xs text-slate-400">Dominio Producción: consola.saare.es</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Escudo de estado */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          PUERTO 3002 OK
        </div>

        {/* BOTÓN PROMINENTE DE DESCARGA DIRECTA */}
        <a 
          href="/SAARE_Console_V2.2_Standalone.html" 
          download="SAARE_Console_V2.2_Standalone.html"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl border border-blue-400/30 shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          DESCARGAR CONSOLA CLIENTE (.HTML)
        </a>
      </div>
    </header>
  );
}
