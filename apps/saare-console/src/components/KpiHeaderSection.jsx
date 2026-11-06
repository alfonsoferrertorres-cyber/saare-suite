// src/components/KpiHeaderSection.jsx
import React from 'react';

export const KpiHeaderSection = ({ evidences = [] }) => {
  const safeEvidences = Array.isArray(evidences) ? evidences : [];
  const totalEvidences = safeEvidences.length;

  const denyCount = safeEvidences.filter(
    e => e && (e.dictamen === 'DENY' || e.verdict === 'DENY' || e.decision === 'DENY' || e.verdict === 'RECHAZADO')
  ).length;

  const denyPercentage = totalEvidences > 0 ? ((denyCount / totalEvidences) * 100).toFixed(1) : '0.0';

  // Cálculo seguro de latencia promedio con fallback a 1.12ms (latencia base del Engine)
  const totalLatency = safeEvidences.reduce((acc, curr) => {
    const lat = curr?.metrics?.latency_ms || curr?.latency || 1.12;
    return acc + (typeof lat === 'number' ? lat : parseFloat(lat) || 1.12);
  }, 0);

  const avgLatency = totalEvidences > 0 ? (totalLatency / totalEvidences) : 1.12;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-slate-900/80 border border-slate-700/60 p-4 rounded-xl shadow-lg">
        <p className="text-xs font-semibold uppercase text-slate-400">Total Inspecciones L7</p>
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-3xl font-extrabold text-cyan-400">{totalEvidences}</span>
          <span className="text-xs text-slate-500 font-mono">Bóveda D1</span>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-700/60 p-4 rounded-xl shadow-lg">
        <p className="text-xs font-semibold uppercase text-slate-400">Amenazas Bloqueadas (Ex-Ante)</p>
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-3xl font-extrabold text-rose-500">{denyCount}</span>
          <span className="text-xs font-semibold text-rose-400/90">{denyPercentage}% del total</span>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-700/60 p-4 rounded-xl shadow-lg">
        <p className="text-xs font-semibold uppercase text-slate-400">Eventos PII / Jailbreak</p>
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-3xl font-extrabold text-amber-400">{denyCount}</span>
          <span className="text-xs text-amber-500/80">Filtrado Prevención</span>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-700/60 p-4 rounded-xl shadow-lg">
        <p className="text-xs font-semibold uppercase text-slate-400">Latencia Media Inspection</p>
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-3xl font-extrabold text-emerald-400">
            {avgLatency.toFixed(2)} <span className="text-sm font-normal">ms</span>
          </span>
          <span className="text-xs text-emerald-500/80">RAM Zero-Storage</span>
        </div>
      </div>
    </div>
  );
};

export default KpiHeaderSection;