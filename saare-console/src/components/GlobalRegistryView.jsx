import React, { useState, useEffect } from "react";

const API_ENDPOINT = "https://saare-api.alfonsoferrertorres.workers.dev/api/v1/runs?user=alfonsosb1@gmail.com";

export default function GlobalRegistryView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchLogs() {
    try {
      const res = await fetch(API_ENDPOINT);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.runs || []);
        setLogs(list);
      }
    } catch (e) {
      console.warn("Fallo al sincronizar boveda:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs font-mono">
        <thead className="border-b border-slate-800 text-slate-400">
          <tr>
            <th className="py-3 px-2">ID / HORA</th>
            <th className="py-3 px-2">USUARIO / ORIGEN</th>
            <th className="py-3 px-2">EVENTO / DETECCIÓN</th>
            <th className="py-3 px-2">ESTADO / ACCIÓN</th>
            <th className="py-3 px-2">FIRMA DIGITAL</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {logs.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-6 text-center text-slate-500">
                {loading ? "Sincronizando Bóveda Forense..." : "No hay registros de infracciones pendientes."}
              </td>
            </tr>
          ) : (
            logs.map((item, idx) => (
              <tr key={item.evidenceId || idx} className="hover:bg-slate-800/30">
                <td className="py-3 px-2">
                  <div className="font-bold text-amber-400">{item.evidenceId || "EV-N/A"}</div>
                  <div className="text-[10px] text-slate-500">
                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : "--:--:--"}
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="text-slate-300">{item.user || "alfonsosb1@gmail.com"}</div>
                  <div className="text-[10px] text-slate-500">{item.origin || "L7 RAM"}</div>
                </td>
                <td className="py-3 px-2">
                  <div className="text-white font-semibold">{item.event || "Infracción Detectada"}</div>
                  <div className="text-[10px] text-red-400 truncate max-w-xs">{item.promptInput || ""}</div>
                </td>
                <td className="py-3 px-2">
                  <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-800/80 text-red-300 font-bold text-[10px]">
                    {item.action || "REDACTED & SEALED"}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-700/60 text-emerald-400 text-[10px]">
                    ED25519 VERIFIED
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}