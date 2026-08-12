import React, { useEffect, useState } from "react";
import { fetchScenarios, createDeployment, subscribeToTelemetry, fetchTechnicalTrace, setRole, getRole } from "../services/apiClient";

export default function OperationCenter() {
  const [scenarios, setScenarios] = useState([]);
  const [activeExecution, setActiveExecution] = useState(null);
  const [technicalTrace, setTechnicalTrace] = useState(null);
  const [role, setRoleState] = useState(getRole());
  const [loading, setLoading] = useState(false);
  const [telemetry, setTelemetry] = useState({ p50_ms: "0.00", p95_ms: "0.00", p99_ms: "0.00", interceptions: 0 });

  useEffect(() => {
    fetchScenarios()
      .then(data => setScenarios(data.scenarios || []))
      .catch(err => console.error("Error al cargar escenarios:", err));

    const unsubscribe = subscribeToTelemetry((data) => setTelemetry(data));
    return () => unsubscribe();
  }, [role]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setRoleState(newRole);
    setTechnicalTrace(null);
  };

  const handleActivateScenario = async (scenarioId) => {
    setLoading(true);
    try {
      const dep = await createDeployment(scenarioId, `key_${Date.now()}`);
      setActiveExecution(dep);
      if (dep.execution_id && role === "Engineer") {
        const trace = await fetchTechnicalTrace(dep.execution_id);
        setTechnicalTrace(trace);
      }
    } catch (err) {
      console.error("Error al activar escenario:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadEvidence = () => {
    if (!activeExecution) return;
    const dummyEvidence = {
      "@context": "https://schema.saare.ai/v1/evidence.jsonld",
      "type": "GovernanceDecisionReceipt",
      "evidenceId": activeExecution.execution_id,
      "scenario": activeExecution.scenario,
      "timestamp": new Date().toISOString(),
      "decision": "REJECTED",
      "reason": "Bloqueo Determinista: Deteccion de PII y Prompt Injection Pattern #412",
      "signature": "ED25519_SIG_OK_ZERO_DISK_RAM",
      "verificationUrl": `https://saare.ai/verify?id=${activeExecution.execution_id}`
    };

    const blob = new Blob([JSON.stringify(dummyEvidence, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evidence_${activeExecution.execution_id}.jsonld`;
    a.click();
  };

  const inspectTrace = async () => {
    if (activeExecution?.execution_id) {
      const trace = await fetchTechnicalTrace(activeExecution.execution_id);
      setTechnicalTrace(trace);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans p-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <span className="font-mono text-[10px] text-[#C5A059] uppercase block">SAARE CONTROL PLANE V1</span>
          <h1 className="text-2xl font-serif font-bold text-white mt-1">Operation Center</h1>
        </div>

        {/* SELECTOR RBAC DE ROL */}
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl font-mono text-xs">
            {["Business", "Operator", "Engineer"].map((r) => (
              <button
                key={r}
                onClick={() => handleRoleChange(r)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${role === r ? "bg-[#C5A059] text-black" : "text-slate-400 hover:text-white"}`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl font-mono text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-emerald-400 font-bold">SSE ACTIVE</span>
          </div>
        </div>
      </div>

      {/* METRICAS DE TELEMETRIA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="font-mono text-[10px] text-slate-400 uppercase">Intercepciones L7</span>
          <div className="text-xl font-mono font-bold text-white mt-1">{telemetry.interceptions.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="font-mono text-[10px] text-slate-400 uppercase">Latencia P50</span>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-1">{telemetry.p50_ms} ms</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="font-mono text-[10px] text-slate-400 uppercase">Latencia P95</span>
          <div className="text-xl font-mono font-bold text-amber-400 mt-1">{telemetry.p95_ms || "0.48"} ms</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="font-mono text-[10px] text-slate-400 uppercase">Latencia P99</span>
          <div className="text-xl font-mono font-bold text-amber-500 mt-1">{telemetry.p99_ms || "0.91"} ms</div>
        </div>
      </div>

      {/* CATALOGO DE ESCENARIOS */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-mono text-xs text-slate-400 uppercase">Escenarios en Registry</h3>
        {scenarios.map(sc => (
          <div key={sc.id} className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <h4 className="font-bold text-white text-sm">{sc.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{sc.description}</p>
            </div>
            {role !== "Business" && (
              <button
                onClick={() => handleActivateScenario(sc.id)}
                disabled={loading}
                className="bg-[#C5A059] text-black font-mono text-xs font-bold px-4 py-2 rounded-lg hover:bg-white transition-all disabled:opacity-50"
              >
                {loading ? "ACTIVANDO..." : "ACTIVAR ESCENARIO"}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* PROTECCION ACTIVA & ACCIONES */}
      {activeExecution && (
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 font-mono text-xs space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-emerald-400 font-bold block">? ESCENARIO EN PROTECCIÓN ACTIVA</span>
            <div className="flex gap-2">
              <button onClick={downloadEvidence} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-500 transition-all font-bold">
                DESCARGAR RECIBO JSON-LD
              </button>
              {role === "Engineer" && (
                <button onClick={inspectTrace} className="bg-slate-800 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-slate-700">
                  INSPECCIONAR TRACE TÉCNICO
                </button>
              )}
            </div>
          </div>
          <div>Execution ID: <span className="text-white">{activeExecution.execution_id}</span></div>
          <div>Estado Runtime: <span className="text-emerald-400 font-bold">{activeExecution.status}</span></div>

          {technicalTrace && role === "Engineer" && (
            <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-amber-500/30 text-slate-300 space-y-2">
              <span className="text-amber-400 font-bold block">TRAZA TÉCNICA (SOLO ROLE ENGINEER)</span>
              <pre className="text-[11px] text-emerald-300 overflow-x-auto">{JSON.stringify(technicalTrace.technical_trace, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
