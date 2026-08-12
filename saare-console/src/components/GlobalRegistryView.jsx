import React, { useState } from "react";

export const GlobalRegistryView = ({ activeScenes = ["Blindaje Activo"] }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const hasActia = activeScenes.includes("ACTia");
  const hasDora = activeScenes.includes("DORA");
  const hasEnterprise = activeScenes.includes("Enterprise");

  const events = [
    {
      id: "EV-20260811-0012",
      timestamp: "2026-08-11T12:48:10Z",
      user: "USER-25AC6AC0",
      type: "BLOQUEO L7",
      scene: "Blindaje Activo",
      decision: "REJECTED",
      reason: "Patrón de inyección rápida n.º 412",
      cryptoId: "SAARE-HASH-9981A72F08B211ECA8A30242AC120002-ED25519-SIG-8F32C1",
      actiaRisk: hasActia ? "ALTO RIESGO (Art. 6 EU AI Act)" : null,
      doraControl: hasDora ? "DORA-ICT-07 (Protección de Integridad)" : null,
      traceId: hasEnterprise ? "4bf92f3577b34da6a3ce929d0e0e4736" : null
    },
    {
      id: "EV-20260811-0011",
      timestamp: "2026-08-11T12:45:02Z",
      user: "USER-88F92A10",
      type: "OPERACIÓN",
      scene: "Blindaje Activo",
      decision: "ALLOWED",
      reason: "Solicitud limpia, sin sesgo ni PII",
      cryptoId: "SAARE-HASH-11A9C83022F11BC099182390A00129F1-ED25519-SIG-3A21F9",
      actiaRisk: hasActia ? "RIESGO MÍNIMO" : null,
      doraControl: hasDora ? "DORA-ICT-05" : null,
      traceId: hasEnterprise ? "7c102a1109a22f319200aa00129033a1" : null
    }
  ];

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      {/* Target Banner: Cobertura Telemétrica por Escenas Compradas */}
      <div className="flex flex-wrap justify-between items-center bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Capa de Registro & Auditoría</div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            REGISTRO GLOBAL <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">ISO 42001 READY</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-slate-400">Escenas Activas: </span>
            <span className="text-blue-400 font-bold">{activeScenes.join(", ")}</span>
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-600/20">
            EXPORTAR MANIFIESTO
          </button>
        </div>
      </div>

      {/* Main Events Feed: Tabla Moderna de Registro */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800/80 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>REGISTROS EN TIEMPO REAL (INMUTABLE HASH CHAIN)</span>
          <span className="font-mono text-slate-500">Local Ledger: C:\MS3V_SAARE_Auditoria\ledger.jsonl</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {events.map((ev) => (
            <div 
              key={ev.id} 
              onClick={() => setSelectedEvent(selectedEvent === ev.id ? null : ev.id)}
              className="p-4 hover:bg-slate-800/30 transition-colors cursor-pointer space-y-2"
            >
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-blue-400 font-semibold">{ev.id}</span>
                  <span className="text-slate-500 font-mono">{ev.timestamp}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ev.decision === "REJECTED" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                    {ev.decision}
                  </span>
                </div>
                <span className="text-emerald-400 text-xs flex items-center gap-1 font-mono">
                  Ed25519 Verificado ?
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="text-slate-200 font-medium">{ev.reason}</div>
                <div className="text-xs text-slate-400 font-mono">{ev.user}</div>
              </div>

              {/* Módulos de Telemetría Adicional según Escenas Adquiridas */}
              {(hasActia || hasDora || hasEnterprise) && (
                <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                  {hasActia && <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-mono">{ev.actiaRisk}</span>}
                  {hasDora && <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded font-mono">{ev.doraControl}</span>}
                  {hasEnterprise && <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded font-mono">TraceId: {ev.traceId}</span>}
                </div>
              )}

              {/* Inspección Técnica Profunda Plegable */}
              {selectedEvent === ev.id && (
                <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono space-y-2 text-slate-400">
                  <div><span className="text-slate-500">Módulo/Escena:</span> {ev.scene}</div>
                  <div><span className="text-slate-500">Crypto-ID:</span> <span className="text-blue-300">{ev.cryptoId}</span></div>
                  <div><span className="text-slate-500">Estado de la evidencia:</span> Guardado en el registro local inmutable y sincronizado en el árbol de Merkle.</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

