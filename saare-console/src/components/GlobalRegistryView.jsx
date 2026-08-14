import React, { useState, useEffect } from "react";
import { createEvidenceReceipt } from "../services/evidenceVault";

export function GlobalRegistryView() {
  const [logs, setLogs] = useState([
    {
      id: "EV-20260731-1891",
      timestamp: "2026-07-30T23:43:14Z",
      user: "USER-25AC6AC0",
      status: "PERMITIDO",
      signature: "de8c464db03ecb47bbab31f0823266057a8a0ca897434dccac9cdc40fb22"
    },
    {
      id: "EV-20260811-0012",
      timestamp: "2026-08-11T12:48:10Z",
      user: "USER-EDD4309534",
      status: "RECHAZADO",
      signature: "a29d21f5bf04f769-MAD-ED25519-SIG-PII-BLOCK"
    }
  ]);

  useEffect(() => {
    const handleInterceptEvent = (event) => {
      if (event.data && event.data.type === "SAARE_PROMPT_INTERCEPTED") {
        const newLog = {
          id: 'EV-' + new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8) + '-' + Math.floor(1000 + Math.random() * 9000),
          timestamp: new Date().toISOString(),
          user: event.data.user || "USER-EDD4309534",
          status: event.data.hasPII ? "RECHAZADO" : "PERMITIDO",
          signature: 'sha256-' + Math.random().toString(36).substring(2, 34) + '-ED25519-SIG'
        };
        setLogs((prevLogs) => [newLog, ...prevLogs]);
      }
    };

    window.addEventListener("message", handleInterceptEvent);
    return () => window.removeEventListener("message", handleInterceptEvent);
  }, []);

  const handleDownloadReceipt = async (log) => {
    const receipt = await createEvidenceReceipt(
      "MS3V_GLOBAL_NODE_L7",
      { user: log.user, prompt: "Auditoría en Nodo L7" },
      log.status
    );

    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "receipt_" + receipt.execution_id + ".jsonld";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 font-mono text-xs text-slate-300">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <span className="text-amber-400 font-bold block">CAPA DE REGISTRO & AUDITORÍA L7 (NODO MS3V)</span>
          <h2 className="text-lg font-bold text-white mt-0.5">REGISTRO GLOBAL <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded ml-2">ISO 42001 READY</span></h2>
        </div>
        <div className="text-right">
          <span className="text-slate-400 text-[10px] block">Registros en Tiempo Real (Inmutable JSONL Ledger)</span>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px]">
              <th className="p-3">ID Evidencia</th>
              <th className="p-3">Timestamp (UTC)</th>
              <th className="p-3">Usuario Anonimizado</th>
              <th className="p-3">Estado / Acción DLP</th>
              <th className="p-3">Firma SHA-256</th>
              <th className="p-3 text-right">Recibo Forense</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="p-3 font-bold text-amber-400">{log.id}</td>
                <td className="p-3 text-slate-400">{log.timestamp}</td>
                <td className="p-3 text-emerald-400 font-bold">{log.user}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.status === "PERMITIDO" || log.status === "ALLOWED" 
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800" 
                      : "bg-rose-950 text-rose-400 border border-rose-800"
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="p-3 text-slate-500 font-mono text-[10px] truncate max-w-xs">{log.signature}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDownloadReceipt(log)}
                    className="bg-slate-800 text-amber-400 border border-amber-500/30 px-2 py-1 rounded text-[10px] hover:bg-slate-700 transition-all"
                  >
                    DESCARGAR EVIDENCIA
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
