import React, { useState, useEffect } from "react";

export function GlobalRegistryView() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function loadLogs() {
      let combined = [];

      // 1. Lectura de chrome.storage.local (capturas inmediatas de extensión)
      try {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          const localData = await new Promise((resolve) => {
            chrome.storage.local.get({ saare_logs: [] }, (res) => resolve(res.saare_logs || []));
          });
          if (Array.isArray(localData)) combined.push(...localData);
        }
      } catch (e) {}

      // 2. Lectura del Worker en Cloudflare (/api/v1/runs)
      try {
        const res = await fetch("https://saare-api.alfonsoferrertorres.workers.dev/api/v1/runs?user=alfonsosb1@gmail.com");
        if (res.ok) {
          const cloudData = await res.json();
          // Desempaqueta { total, runs: [...] } o array plano [...]
          const list = Array.isArray(cloudData) ? cloudData : (cloudData.runs || cloudData.events || []);
          combined.push(...list);
        }
      } catch (e) {}

      // 3. Normalizar propiedades y desduplicar por evidenceId
      if (combined.length > 0) {
        const uniqueMap = new Map();
        combined.forEach(item => {
          const id = item.evidenceId || item.id || `EV-${Math.random()}`;
          if (!uniqueMap.has(id)) {
            const isRejected = item.verdict === "RECHAZADO" || item.action === "REDACTED (RAM)";
            const eventDesc = item.event || (item.violationDetails ? `${item.violationDetails.norma}: ${item.violationDetails.reason}` : (item.scenario || item.promptSummary || "Auditoría L7"));
            
            uniqueMap.set(id, {
              id: id,
              timestamp: item.timestamp || item.isoTimestamp || new Date().toISOString(),
              user: item.user || item.auditor || "alfonsosb1@gmail.com",
              event: eventDesc,
              action: isRejected ? "REDACTED (RAM)" : "LOGGED (ISO 42001)",
              status: isRejected ? "RECHAZADO" : "CONFORME",
              signature: (item.hash || item.signature || "e3b0c44298fc1c14").slice(0, 24) + "..."
            });
          }
        });

        const sorted = Array.from(uniqueMap.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setLogs(sorted);
      }
    }

    loadLogs();
    const interval = setInterval(loadLogs, 2000);
    return () => clearInterval(interval);
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
                <td className="py-2 px-3 text-cyan-400">
                  {log.id}<br/>
                  <span className="text-slate-500 text-[10px]">
                    {log.timestamp.includes("T") ? log.timestamp.split("T")[1].slice(0, 8) : log.timestamp}
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-300">{log.user}</td>
                <td className="py-2 px-3 text-slate-300">{log.event}</td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.status === "RECHAZADO" ? "bg-amber-900/50 text-amber-300 border border-amber-700" : "bg-emerald-900/50 text-emerald-300 border border-emerald-700"
                  }`}>
                    {log.action}
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
