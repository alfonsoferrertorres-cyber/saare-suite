import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, isLive = true }) {
  return (
    <aside className="w-64 border-r border-slate-800 p-4 flex flex-col justify-between bg-slate-950 text-slate-100 font-sans h-screen">
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold tracking-wider text-emerald-400">SAARE CONSOLE</h1>
          <span className={`px-2 py-0.5 text-xs font-mono rounded ${isLive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
            S.A.A.R.E. ({isLive ? 'LIVE' : 'OFFLINE'})
          </span>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab && setActiveTab('overview')}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab && setActiveTab('scenarios')}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'scenarios' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            ESCENARIOS
          </button>
          <button
            onClick={() => setActiveTab && setActiveTab('trace')}
            className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'trace' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            TECHNICAL TRACE / Registro Global
          </button>
        </nav>
      </div>

      <div className="text-xs text-slate-500 border-t border-slate-800 pt-4">
        <p>Máxima Protección Configurada</p>
        <p className="text-[10px] text-slate-600 mt-1">Core Runtime Engine v7.2</p>
      </div>
    </aside>
  );
}
