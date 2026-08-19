import React, { useState } from 'react';

export default function UniversalLLMCompatibility() {
  const [selectedProvider, setSelectedProvider] = useState('openai');

  const providers = [
    { id: 'openai', name: 'OpenAI', models: 'GPT-4o, GPT-4o-mini, o1-preview', icon: '🟢', latency: '1.14 ms' },
    { id: 'anthropic', name: 'Anthropic Claude', models: 'Claude 3.5 Sonnet, Claude 3 Opus', icon: '🟣', latency: '1.18 ms' },
    { id: 'azure', name: 'Azure OpenAI', models: 'Private Instances & Government Endpoints', icon: '🔵', latency: '1.12 ms' },
    { id: 'gemini', name: 'Google Gemini', models: 'Gemini 1.5 Pro, Flash, Ultra', icon: '🔷', latency: '1.16 ms' },
    { id: 'deepseek', name: 'DeepSeek', models: 'DeepSeek-V2, DeepSeek Coder', icon: '🐳', latency: '1.15 ms' },
    { id: 'local', name: 'Modelos Locales / On-Premise', models: 'Ollama, vLLM, HuggingFace TGI, LLaMA 3', icon: '⚡', latency: '0.84 ms' }
  ];

  const providerConfigs = {
    openai: {
      endpoint: "https://saare-api.alfonsoferrertorres.workers.dev/v1/chat/completions",
      target: "api.openai.com/v1",
      headers: {
        "Authorization": "Bearer sk-proj-...",
        "X-SAARE-License": "SAARE-ENTERPRISE-2026",
        "X-SAARE-Tenant": "tenant_corporate_id"
      }
    },
    anthropic: {
      endpoint: "https://saare-api.alfonsoferrertorres.workers.dev/v1/messages",
      target: "api.anthropic.com/v1",
      headers: {
        "x-api-key": "sk-ant-...",
        "anthropic-version": "2023-06-01",
        "X-SAARE-License": "SAARE-ENTERPRISE-2026"
      }
    },
    azure: {
      endpoint: "https://saare-api.alfonsoferrertorres.workers.dev/azure/openai/deployments/gpt-4o",
      target: "your-resource.openai.azure.com",
      headers: {
        "api-key": "azure-secret-key",
        "X-SAARE-License": "SAARE-ENTERPRISE-2026"
      }
    },
    gemini: {
      endpoint: "https://saare-api.alfonsoferrertorres.workers.dev/v1beta/models/gemini-1.5-pro:generateContent",
      target: "generativelanguage.googleapis.com",
      headers: {
        "x-goog-api-key": "AIzaSy...",
        "X-SAARE-License": "SAARE-ENTERPRISE-2026"
      }
    },
    deepseek: {
      endpoint: "https://saare-api.alfonsoferrertorres.workers.dev/v1/chat/completions",
      target: "api.deepseek.com/v1",
      headers: {
        "Authorization": "Bearer sk-deepseek-...",
        "X-SAARE-License": "SAARE-ENTERPRISE-2026"
      }
    },
    local: {
      endpoint: "https://saare-api.alfonsoferrertorres.workers.dev/local/v1/chat/completions",
      target: "http://10.0.0.50:11434 (Ollama / vLLM Cluster)",
      headers: {
        "X-SAARE-License": "SAARE-AIRGAPPED-NODE",
        "X-SAARE-Target-Internal": "http://10.0.0.50:11434"
      }
    }
  };

  return (
    <section id="multi-llm" className="w-full bg-slate-950 text-white font-sans border-b border-slate-800 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase block mb-2">
            09 — MODEL-AGNOSTIC ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Un Único Gateway. Cualquier Proveedor de IA.
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Gobernanza centralizada e intercambiable sin modificar el código de tus aplicaciones corporativas.
          </p>
        </div>

        {/* Grid de Modelos Soportados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProvider(p.id)}
              className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                selectedProvider === p.id
                  ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    RAM: {p.latency}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">{p.name}</h4>
                <p className="text-xs text-slate-400 font-mono">{p.models}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-cyan-400">{selectedProvider === p.id ? '● Seleccionado' : 'Configurar ➔'}</span>
                <span className="text-emerald-400 font-semibold">100% Compatible</span>
              </div>
            </button>
          ))}
        </div>

        {/* Visor de Enrutamiento del Gateway */}
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold block">
                ENRUTAMIENTO PERIMETRAL ACTIVO
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Conexión Proxy: {providers.find(p => p.id === selectedProvider)?.name}
              </h3>
            </div>
            <span className="px-3.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold">
              ESTÁNDAR OPENAI / SDK UNIVERSAL
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block mb-1">ENDPOINT DE ENTRADA PERIMETRAL (SAARE GATEWAY):</span>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 select-all">
                {providerConfigs[selectedProvider].endpoint}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">DESTINO DE INFERENCIA BLINDADO (UPSTREAM):</span>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 select-all">
                {providerConfigs[selectedProvider].target}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">CABECERAS INYECTADAS AUTOMÁTICAMENTE:</span>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 overflow-x-auto">
                <code>{JSON.stringify(providerConfigs[selectedProvider].headers, null, 2)}</code>
              </pre>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-slate-400 font-mono">
              🛡️ Inspección de entrada/salida aplicada en <strong className="text-cyan-400">RAM</strong> antes de reenviar el paquete.
            </span>
            <a
              href="https://console.saare.es"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20"
            >
              GESTIONAR RUTAS EN CONSOLA ➔
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
