import React, { useState } from 'react';

export default function OverviewDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLive, setIsLive] = useState(true);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold tracking-wider text-emerald-400">SAARE CONSOLE</h1>
            <span className={`px-2 py-0.5 text-xs font-mono rounded ${isLive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
              S.A.A.R.E. ({isLive ? 'LIVE' : 'OFFLINE'})
            </span>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              OVERVIEW
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'scenarios' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              ESCENARIOS
            </button>
            <button
              onClick={() => setActiveTab('trace')}
              className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'trace' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              TECHNICAL TRACE
            </button>
          </nav>
        </div>

        <div className="text-xs text-slate-500 border-t border-slate-800 pt-4">
          <p>Máxima Seguridad Configurada</p>
          <p className="text-[10px] text-slate-600 mt-1">Core Runtime Engine v7.2</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Operation Center</h2>
            <p className="text-sm text-slate-400">SAARE CONTROL PLANE V1</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-950 text-emerald-400 text-xs font-mono rounded-full border border-emerald-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              SSE ACTIVE
            </span>
          </div>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">INTERCEPCIONES L7</p>
            <p className="text-2xl font-mono text-emerald-400">12.869</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">LATENCIA P50</p>
            <p className="text-2xl font-mono text-emerald-400">0.19 ms</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">LATENCIA P95</p>
            <p className="text-2xl font-mono text-amber-400">0.51 ms</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">LATENCIA P99</p>
            <p className="text-2xl font-mono text-amber-400">0.95 ms</p>
          </div>
        </div>

        {/* Escenarios Section */}
        <section className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4 tracking-wider">ESCENARIOS EN REGISTRY</h3>
          <div className="space-y-3">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-emerald-400">Cumplimiento Corporativo ES (Máxima Seguridad)</h4>
                <p className="text-xs text-slate-400">Protección integral L7 con bloqueo de PII y Prompt Injection</p>
              </div>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-slate-200">Banca & DORA / PCI-DSS Strict</h4>
                <p className="text-xs text-slate-400">Perfil estricto para entidades financieras bajo normativa europea</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
