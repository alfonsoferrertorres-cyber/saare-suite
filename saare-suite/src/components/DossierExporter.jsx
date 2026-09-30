import React from 'react';

export default function DossierExporter({ events = [], onClose }) {
  const safeEvents = Array.isArray(events) ? events : [];

  function exportJson() {
    const data = {
      exportedAt: new Date().toISOString(),
      specVersion: 'SGP 1.0',
      eventCount: safeEvents.length,
      events: safeEvents,
      labels: { DEMO: true, BENCHMARK: true, REFERENCE: true, LIVE: false }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saare-evidence-dossier-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const rows = [
      ['id', 'time', 'agent', 'action', 'verdict'],
      ...safeEvents.map((e) => [e?.id, e?.time, e?.agent, e?.action, e?.verdict])
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saare-evidence-trace-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[9999] p-4 font-sans text-slate-100">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative space-y-5">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              DOSSIER EXPORTER
            </span>
            <h3 className="text-lg font-bold text-white">Exportación de Expediente .saare-proof</h3>
          </div>
          <span className="text-xs font-mono bg-slate-950 text-slate-400 px-2.5 py-1 rounded border border-slate-800">
            SAARE-MD-IPRES
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Genera un paquete empaquetado de auditoría que incluye la firma asimétrica Ed25519, raíces del Árbol de Merkle y marcas de tiempo calificadas bajo el estándar RFC 3161.
        </p>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Eventos capturados:</span>
            <strong className="text-white">{safeEvents.length}</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Formato de salida:</span>
            <span className="text-emerald-400">JSON Canónico / CSV</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={exportJson}
            className="py-2.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all text-center shadow-lg shadow-cyan-500/20"
          >
            JSON Firmado
          </button>
          <button
            onClick={exportCsv}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-all text-center"
          >
            CSV Trace
          </button>
          <button
            onClick={() => window.print()}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-all text-center"
          >
            PDF / Imprimir
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-300 pt-2 block font-mono"
          >
            [ CERRAR VENTANA ]
          </button>
        )}
      </div>
    </div>
  );
}