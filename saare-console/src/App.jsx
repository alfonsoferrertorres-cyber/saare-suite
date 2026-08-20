import React, { useState, useEffect } from "react";
import GlobalRegistryView from "./components/GlobalRegistryView";

export default function App() {
  const [activeTab, setActiveTab] = useState("registry");
  const [liveCount, setLiveCount] = useState(0);

  // Consulta global de contador de evidencias
  useEffect(() => {
    async function syncCount() {
      try {
        const res = await fetch("https://saare-api.alfonsoferrertorres.workers.dev/api/v1/runs?user=alfonsosb1@gmail.com");
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.runs || data.events || []);
          setLiveCount(list.length);
        }
      } catch (e) {}
    }
    syncCount();
    const interval = setInterval(syncCount, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans pb-12">
      {/* Header Superior */}
      <header className="border-b border-slate-800 bg-[#0d1322]/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400">
            🛡️
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">Tecnología de IA</h1>
            <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Control Perimetral y Peritaje Forense</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.location.href = "https://saare.es"} className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-xs text-slate-300 font-medium">
            🌐 Ver Landing
          </button>
          <button onClick={() => window.open("https://share.streamlit.io", "_blank")} className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-700/60 text-emerald-400 text-xs font-medium">
            📊 GRC Streamlit
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto mt-8 px-4 space-y-6">
        {/* Banner de Estado */}
        <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900">
              PANEL DE CONTROL GRC & CUMPLIMIENTO CORPORATIVO IA V2.5
            </h2>
            <p className="text-xs font-mono text-slate-600 mt-1">
              USUARIO: <span className="font-bold text-slate-900">alfonsosb1@gmail.com</span> | DIRECTIVAS: <span className="text-emerald-700 font-bold">4 Activas</span> | REGLAS: <span className="font-bold">2 Filtros</span>
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            • PRUEBA: 7 DÍAS RESTANTES
          </span>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("registry")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
              activeTab === "registry" 
                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30" 
                : "bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700"
            }`}
          >
            REGISTRO GLOBAL ({liveCount})
          </button>
        </div>

        {/* Vista del Registro Forense */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">Bóveda Forense de Evidencias (Evidence Vault)</h3>
              <p className="text-xs text-slate-400">Trazabilidad inmutable con firma criptográfica en tiempo real</p>
            </div>
            <button 
              onClick={() => window.open('https://saare-api.alfonsoferrertorres.workers.dev/api/v1/runs?user=alfonsosb1@gmail.com', '_blank')}
              className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg border border-slate-700 font-mono"
            >
              Exportar Bóveda (JSON)
            </button>
          </div>
          
          <GlobalRegistryView />
        </div>
      </main>
    </div>
  );
}
