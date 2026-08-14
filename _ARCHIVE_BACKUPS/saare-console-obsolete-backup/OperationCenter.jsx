import React, { useEffect, useState } from "react";
import { fetchScenarios, createDeployment, subscribeToTelemetry } from "../services/apiClient";
import { GlobalRegistryView } from "../components/GlobalRegistryView";

export default function OperationCenter() {
  const [activeTab, setActiveTab] = useState("SAARE_LIVE");
  const [scenarios, setScenarios] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [telemetry, setTelemetry] = useState({ p50_ms: "0.20", p95_ms: "0.54", p99_ms: "0.96", interceptions: 12804 });

  useEffect(() => {
    fetchScenarios().then(data => setScenarios(data.scenarios || []));
    const unsubscribe = subscribeToTelemetry((data) => setTelemetry(data));
    return () => unsubscribe();
  }, []);

  const handleSubscribeScenario = async (scenarioId) => {
    setLoading(true);
    try {
      const dep = await createDeployment(scenarioId, 'sub_' + Date.now());
      setActiveSubscription(dep);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="font-mono text-[10px] text-[#C5A059] uppercase block">SAARE CONTROL PLANE V1</span>
          <h1 className="text-2xl font-serif font-bold text-white mt-1">Operation Center</h1>
        </div>

        <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl font-mono text-xs">
          {[
            { id: "SAARE_LIVE", label: "SAARE LIVE" },
            { id: "ESCENAS", label: "ESCENARIOS / SUSCRIPCIONES" },
            { id: "REGISTRO_GLOBAL", label: "REGISTRO GLOBAL" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                activeTab === tab.id ? "bg-[#C5A059] text-black" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl font-mono text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-emerald-400 font-bold">SSE ACTIVE</span>
        </div>
      </div>

      {activeTab === "SAARE_LIVE" && (
        <div className="space-y-8">
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
              <div className="text-xl font-mono font-bold text-amber-400 mt-1">{telemetry.p95_ms} ms</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="font-mono text-[10px] text-slate-400 uppercase">Latencia P99</span>
              <div className="text-xl font-mono font-bold text-amber-500 mt-1">{telemetry.p99_ms} ms</div>
            </div>
          </div>

          {activeSubscription && (
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-6 font-mono text-xs space-y-2">
              <span className="text-emerald-400 font-bold block">? ESCENARIO EN SUSCRIPCIÓN ACTIVA</span>
              <div>Subscription ID: <span className="text-white">{activeSubscription.execution_id}</span></div>
              <div>Estado Runtime: <span className="text-emerald-400 font-bold">{activeSubscription.status}</span></div>
            </div>
          )}
        </div>
      )}

      {activeTab === "ESCENAS" && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="font-mono text-xs text-slate-400 uppercase">Escenarios Disponibles para Suscripción</h3>
          {scenarios.map((sc) => (
            <div key={sc.id} className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <h4 className="font-bold text-white text-sm">{sc.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{sc.description}</p>
              </div>
              <button
                onClick={() => handleSubscribeScenario(sc.id)}
                disabled={loading}
                className="bg-[#C5A059] text-black font-mono text-xs font-bold px-4 py-2 rounded-lg hover:bg-white transition-all disabled:opacity-50"
              >
                {loading ? "SUSCRIBIENDO..." : "SUSCRIBIRSE AL ESCENARIO"}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "REGISTRO_GLOBAL" && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <GlobalRegistryView />
        </div>
      )}
    </div>
  );
}
