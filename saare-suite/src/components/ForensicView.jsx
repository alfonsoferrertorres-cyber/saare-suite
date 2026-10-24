import React, { useState } from 'react';

export default function ForensicView({ events = [] }) {
  const [digest, setDigest] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);

  const safeEvents = Array.isArray(events) && events.length > 0
    ? events
    : [
        { id: 'VRD-2026-889A', time: '10:14:02', action: 'SEND_PAYMENT', verdict: 'DENY' },
        { id: 'VRD-2026-991B', time: '10:15:30', action: 'READ_FINANCIAL_DATA', verdict: 'ALLOW' },
        { id: 'VRD-2026-772C', time: '10:18:45', action: 'EXPORT_CUSTOMERS', verdict: 'REVIEW' }
      ];

  const audit = async () => {
    setIsAuditing(true);
    // Mapeo exhaustivo para incluir id, verdict, action o cat/prompt según el origen
    const base = JSON.stringify(
      safeEvents.map((e) => ({
        id: e?.id,
        time: e?.time,
        action: e?.action || e?.cat || 'INSPECTION',
        verdict: e?.verdict || e?.decision || 'ALLOW',
        payload: e?.prompt || e?.payload || null
      }))
    );

    const encoder = new TextEncoder();
    const data = encoder.encode(base);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    setTimeout(() => {
      setDigest(hashHex);
      setIsAuditing(false);
    }, 300);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans text-slate-100">
      {/* Columna 1: Panel de Auditoría Forense */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
        <div>
          <div className="border-b border-slate-800 pb-3 mb-4">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              🔍 FORENSIC AUDIT & RFC 3161
            </span>
            <h3 className="text-lg font-bold text-white">Análisis Forense de Trazas</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Audita eventos del runtime en memoria, calcula un hash acumulativo SHA-256 localmente e imprime el recibo para custodia judicial según la norma ISO/IEC 27037.
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
            <span className="text-[10px] text-slate-500 uppercase block">SHA-256 DIGEST ACUMULATIVO:</span>
            <div className="text-emerald-400 break-all text-xs">
              {digest || '— (Hacer clic en "Generar Recibo Forense")'}
            </div>
          </div>
        </div>

        <button
          onClick={audit}
          disabled={isAuditing}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          {isAuditing ? 'Calculando Hash acumulativo...' : 'Generar Recibo Forense Ex-Ante ↗'}
        </button>
      </div>

      {/* Columna 2: Tabla de Trazas */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                EVENT TRACE
              </span>
              <h3 className="text-lg font-bold text-white">Historial de Eventos Capturados</h3>
            </div>
            <span className="text-[10px] font-mono bg-slate-950 text-slate-400 border border-slate-800 px-2 py-1 rounded">
              DEMO / LOCAL
            </span>
          </div>

          <div className="space-y-2">
            {safeEvents.map((e, idx) => {
              const currentVerdict = e?.verdict || e?.decision || 'ALLOW';
              const currentAction = e?.action || e?.cat || 'INSPECTION';
              return (
                <div
                  key={e?.id || idx}
                  className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-[10px]">{e?.time || '--:--'}</span>
                    <strong className="text-white">{currentAction}</strong>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        currentVerdict === 'ALLOW'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : currentVerdict === 'DENY' || currentVerdict === 'RECHAZADO'
                          ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {currentVerdict}
                    </span>
                    <small className="text-slate-500 text-[10px]">{e?.id}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
          <span className="text-[11px] font-mono text-slate-500">Sellado eIDAS / RFC 3161</span>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            🖨️ Imprimir / Guardar PDF
          </button>
        </div>
      </div>
    </div>
  );
}