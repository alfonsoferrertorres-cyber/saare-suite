import React from 'react';

export default function GovernanceToolbar({ mode = 'SAARE-MD-IPRES', setMode, onExport }) {
  const modes = [
    ['SAARE-MD-FOR', 'Forense & Trazabilidad'],
    ['SAARE-MD-CORP', 'Gobernanza Corporativa'],
    ['SAARE-MD-SECU', 'Intercepción L7 Ex-Ante'],
    ['SAARE-MD-VERD', 'Veredictos Deterministas'],
    ['SAARE-MD-LEGAL', 'Cumplimiento Legal EU AI Act'],
    ['SAARE-MD-IPRES', 'IP & Custodia Preservada']
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-sans text-slate-100 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest whitespace-nowrap">
          GOVERNANCE / MODO:
        </span>
        <select
          value={mode}
          onChange={(e) => setMode && setMode(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono w-full sm:w-auto transition-colors"
        >
          {modes.map(([id, label]) => (
            <option value={id} key={id}>
              {id} · {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <button
          onClick={onExport}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold rounded-lg transition-colors flex items-center gap-2 text-xs w-full sm:w-auto justify-center"
        >
          <span>📦</span> Exportar Evidencias (.saare-proof)
        </button>
      </div>
    </div>
  );
}