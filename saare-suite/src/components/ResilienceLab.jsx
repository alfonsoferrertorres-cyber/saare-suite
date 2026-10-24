import React, { useState } from 'react';

export default function ResilienceLab() {
  const [delta, setDelta] = useState(0.004);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);

    setTimeout(() => {
      const numDelta = Number(delta);
      const isFailed = numDelta >= 0.01;

      setResult({
        status: isFailed ? 'FORENSIC_ISOLATION' : 'OPERATIONAL_NOMINAL',
        invariants: [
          { id: 'INV-01: NO_UNAUTHORIZED_EXFILTRATION', state: 'PASS' },
          { id: 'INV-02: STRUCTURAL_DELTA_BOUND', state: isFailed ? 'FAIL' : 'PASS' },
          { id: 'INV-03: FAIL_CLOSED_CIRCUIT_BREAKER', state: 'PASS' },
          { id: 'INV-04: RAM_MEMORY_LOCK_ACTIVE', state: 'PASS' },
          { id: 'INV-05: RFC3161_TIMESTAMP_VALID', state: 'PASS' },
          { id: 'INV-06: ED25519_SIGNATURE_VERIFIED', state: 'PASS' },
          { id: 'INV-07: MERKLE_LOG_APPEND_ONLY', state: 'PASS' },
          { id: 'INV-08: LATENCY_UNDER_THRESHOLD', state: 'PASS' }
        ]
      });

      setBusy(false);
    }, 400);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans text-slate-100">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
        <div>
          <div className="border-b border-slate-800 pb-3 mb-4">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              🧪 S.A.A.R.E. RESILIENCE LAB
            </span>
            <h3 className="text-lg font-bold text-white">Laboratorio de Simulación de Estrés</h3>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 flex justify-between items-center font-mono text-xs">
            <span className="text-slate-400">UMBRAL MÁXIMO DE DESVIACIÓN (Δ):</span>
            <strong className="text-emerald-400 font-bold">Δ &lt; 0.010%</strong>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Desviación estructural simulada:</span>
              <span className="font-mono text-cyan-400 font-bold text-sm">
                {Number(delta).toFixed(3)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.02"
              step="0.001"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              className="w-full accent-cyan-400 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 leading-relaxed pt-2">
              Superar el umbral del 0.010% forzará una transición automática al estado de <strong>Aislamiento Forense</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={run}
          disabled={busy}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20"
        >
          {busy ? 'Verificando Invariantes en RAM...' : '🧪 Ejecutar Auditoría de Invariantes ↗'}
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                INVARIANT AUDIT RESULT
              </span>
              <h3 className="text-lg font-bold text-white">8 Invariantes de Seguridad</h3>
            </div>
            <span className="text-[10px] font-mono bg-slate-950 text-slate-400 border border-slate-800 px-2 py-1 rounded">
              FAIL-CLOSED
            </span>
          </div>

          {!result ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500 italic text-center">
              Ejecuta el laboratorio para evaluar el estado de las invariantes.
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={`p-3.5 rounded-xl border font-mono text-center text-xs font-bold ${
                  result.status === 'OPERATIONAL_NOMINAL'
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                }`}
              >
                ESTADO DEL SISTEMA: {result.status}
              </div>

              <div className="space-y-2">
                {result.invariants.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono"
                  >
                    <span className="text-slate-300 truncate max-w-[260px]">{inv.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.state === 'PASS'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {inv.state}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500">
          Supervisión continua en RAM bajo aislamiento perimetral.
        </div>
      </div>
    </div>
  );
}