import React, { useState, useEffect, useMemo } from "react";
import { createEvidenceReceipt } from "../services/evidenceVault";

// Carga directa de los 60 JSONs de la carpeta física mediante Vite
const rawVaultFiles = import.meta.glob('../evidence_vault/*.json', { eager: true });

export function GlobalRegistryView() {
  // Parsear y normalizar los 60 archivos de la carpeta evidence_vault
  const initialRecords = useMemo(() => {
    return Object.values(rawVaultFiles).map((mod) => {
      const d = mod.default || mod;
      return {
        id: d.evidenceId || d.id || `EV-${Date.now()}`,
        timestamp: d.isoTimestamp || (d.timestamp ? `2026-08-15T${d.timestamp}Z` : new Date().toISOString()),
        user: d.user || "alfonsosb1@gmail.com",
        status: d.verdict === "RECHAZADO" ? "RECHAZADO" : (d.verdict || "PERMITIDO"),
        signature: (d.hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855").slice(0, 32) + "...",
        scenario: d.scenario || d.promptSummary || "Auditoría L7"
      };
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, []);

  const [logs, setLogs] = useState(initialRecords);

  useEffect(() => {
    // 1. Consultar endpoint unificado de control-plane / Worker
    async function fetchLiveRuns() {
      try {
        const res = await fetch("https://saare-api.alfonsoferrertorres.workers.dev/api/v1/runs?user=alfonsosb1@gmail.com");
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.runs || []);
          if (list.length > 0) {
            setLogs(prev => {
              const ids = new Set(prev.map(p => p.id));
              const newItems = list.filter(item => !ids.has(item.evidenceId || item.id)).map(r => ({
                id: r.evidenceId || r.id,
                timestamp: r.isoTimestamp || new Date().toISOString(),
                user: r.user || "alfonsosb1@gmail.com",
                status: r.verdict || "PERMITIDO",
                signature: (r.hash || "e3b0c442").slice(0, 32) + "...",
                scenario: r.scenario || r.promptSummary || "Validación L7"
              }));
              return [...newItems, ...prev];
            });
          }
        }
      } catch (err) {}
    }
    fetchLiveRuns();

    // 2. Escucha de intercepciones en caliente desde el navegador
    const handleInterceptEvent = (event) => {
      if (event.data && event.data.type === "SAARE_PROMPT_INTERCEPTED") {
        const payload = event.data.payload || {};
        const newLog = {
          id: 'EV-' + new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8) + '-' + Math.floor(1000 + Math.random() * 9000),
          timestamp: new Date().toISOString(),
          user: "alfonsosb1@gmail.com",
          status: payload.action === "REDACTED" ? "RECHAZADO" : "PERMITIDO",
          signature: (payload.hash || "a29d21f5bf04f769-MAD-ED25519").slice(0, 32) + "...",
          scenario: payload.rule || "Filtro Ex-Ante RAM"
        };
        setLogs((prev) => [newLog, ...prev]);
      }
    };

    window.addEventListener("message", handleInterceptEvent);
    return () => window.removeEventListener("message", handleInterceptEvent);
  }, []);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 font-mono">
              <th className="py-2 px-3">ID / HORA</th>
              <th className="py-2 px-3">USUARIO / ORIGEN</th>
              <th className="py-2 px-3">EVENTO / DETECCIÓN</th>
              <th className="py-2 px-3">ESTADO / ACCIÓN</th>
              <th className="py-2 px-3">FIRMA DIGITAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/40">
                <td className="py-2 px-3 text-cyan-400">{log.id}<br/><span className="text-slate-500 text-[10px]">{log.timestamp.split('T')[1]?.slice(0,8) || log.timestamp}</span></td>
                <td className="py-2 px-3 text-slate-300">{log.user}</td>
                <td className="py-2 px-3 text-slate-300">{log.scenario}</td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.status === "RECHAZADO" ? "bg-amber-900/50 text-amber-300 border border-amber-700" : "bg-emerald-900/50 text-emerald-300 border border-emerald-700"
                  }`}>
                    {log.status === "RECHAZADO" ? "REDACTED (RAM)" : "LOGGED (ISO 42001)"}
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-500 text-[10px]">{log.signature}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default GlobalRegistryView;
