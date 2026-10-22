import React, { useState } from 'react';
import { CheckCircle2, ShieldAlert, Cpu, Download, RefreshCw, Key, Database, Lock } from 'lucide-react';
import { downloadGPOPolicy } from '../utils/api';

export default function ConsolePreview() {
  const [activeTab, setActiveTab] = useState('audit');
  const [testPrompt, setTestPrompt] = useState('Analizar contrato para cliente NIF 48553065L con clave API sk-live-992138a8d7a12');
  const [evalResult, setEvalResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const handleSimulateInspection = () => {
    setEvaluating(true);
    setTimeout(() => {
      setEvalResult({
        verdict: 'SANCP_SANITIZED',
        original_payload: testPrompt,
        sanitized_payload: 'Analizar contrato para cliente NIF [PII_ANONYMIZED_ES] con clave API [SECRET_MASKED_KEY]',
        latency_ms: 0.84,
        rules_triggered: ['DLP_PII_NIF_ES', 'SECRET_SCANNING_API_KEY'],
        signature_ed25519: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991678526855',
        evaluator_node: 'Core-PEP-L7-v8.4-RAM'
      });
      setEvaluating(false);
    }, 400);
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
            </div>
            <span className="text-xs font-mono text-slate-400">saare-console-v10.0 // Core-PEP-L7-v8.4</span>
          </div>

          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('audit')} 
              className={`px-3 py-1 rounded text-xs font-semibold ${activeTab === 'audit' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              Simulador Ex-Ante L7
            </button>
            <button 
              onClick={() => setActiveTab('gpo')} 
              className={`px-3 py-1 rounded text-xs font-semibold ${activeTab === 'gpo' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              Despliegue GPO
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'audit' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Entrada HTTP/Prompt de Prueba
                </label>
                <textarea 
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  className="w-full h-32 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleSimulateInspection}
                  disabled={evaluating}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center space-x-2 transition"
                >
                  {evaluating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                  <span>Ejecutar Intercepción Ex-Ante en RAM Local (≤ 1.12 ms)</span>
                </button>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Veredicto del Motor PEP L7
                </label>
                {evalResult ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Estado:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {evalResult.verdict}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Payload Sanitizado (Hacia Google LLM):</span>
                      <p className="mt-1 text-slate-200 bg-slate-900 p-2 rounded border border-slate-800">{evalResult.sanitized_payload}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                      <div>Latencia: <span className="text-blue-400 font-bold">{evalResult.latency_ms} ms</span></div>
                      <div>Nodo: <span className="text-slate-200">{evalResult.evaluator_node}</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-center text-slate-500 text-xs">
                    Haz clic en ejecutar para probar el algoritmo ex-ante.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'gpo' && (
            <div className="text-center py-8 space-y-4 max-w-xl mx-auto">
              <Lock className="w-12 h-12 text-blue-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Despliegue Directivo de Empresa (Fricción Cero)</h3>
              <p className="text-xs text-slate-400">
                La directiva Windows Registry (.reg) inyecta las políticas de intercepción L7 en Google Chrome y Microsoft Edge a nivel de sistema operativo sin necesidad de login de usuario.
              </p>
              <button 
                onClick={downloadGPOPolicy}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-600/20 transition"
              >
                Descargar SAARE_L7_Enterprise_GPO.reg
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
