import React, { useState } from 'react';

export default function VerticalUseCasesAndIntegration() {
  const [activeTab, setActiveTab] = useState('python');

  const codeSnippets = {
    python: `# Sustituye la base_url de OpenAI por el Gateway L7 de SAARE
import openai

client = openai.OpenAI(
    base_url="https://saare-api.alfonsoferrertorres.workers.dev/v1",
    api_key="tu_api_key_de_openai",
    default_headers={"X-SAARE-License": "SAARE-PRO-2026-ENTERPRISE"}
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Analizar balance financiero confidencial"}]
)
# El prompt viaja anonimizado en RAM (< 2ms) con evidencia criptográfica`,
    node: `// Integración directa con el SDK de OpenAI en Node.js
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://saare-api.alfonsoferrertorres.workers.dev/v1",
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "X-SAARE-License": "SAARE-PRO-2026-ENTERPRISE"
  }
});

const res = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Auditoría de contratos RGPD" }]
});`,
    curl: `# Petición HTTP estándar con inspección perimetral y sellado HMAC
curl https://saare-api.alfonsoferrertorres.workers.dev/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -H "X-SAARE-License: SAARE-PRO-2026-ENTERPRISE" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Consulta con datos sensibles"}]
  }'`
  };

  const verticals = [
    {
      icon: "🏦",
      tag: "FINANZAS & FINTECH",
      title: "Banca y Entidades Financieras",
      desc: "Control y trazabilidad de IA generativa bajo requerimientos de riesgo operacional DORA y PCI-DSS. Anonimización estricta de IBANs, tarjetas y balances contables.",
      action: "Cumplimiento DORA / ISO 42001"
    },
    {
      icon: "🏥",
      tag: "SECTOR SANITARIO",
      title: "Salud y Biomedicina",
      desc: "Protección de historiales clínicos e información sensible de pacientes antes de interactuar con modelos externos. Filtrado ex-ante con residuo cero en memoria volátil.",
      action: "Garantía RGPD / Art. 9"
    },
    {
      icon: "⚖️",
      tag: "LEGALTECH & PERITAJE",
      title: "Despachos y Asesorías Jurídicas",
      desc: "Gobernanza de secretos empresariales, contratos y expedientes. Emisión de dictámenes técnicos inmutables con no repudio procesal y firma digital Ed25519.",
      action: "Evidencia Forense Certificada"
    },
    {
      icon: "🏢",
      tag: "CORPORATIVO & TI",
      title: "Grandes Empresas (Enterprise)",
      desc: "Despliegue masivo y forzado mediante GPO de Active Directory. Erradicación total del Shadow AI en navegadores de empleados sobre ChatGPT, Claude y Gemini.",
      action: "Despliegue Centralizado GPO"
    }
  ];

  return (
    <div className="w-full bg-slate-950 text-white font-sans border-b border-slate-800 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* ============================================================ */}
        {/* 01. CASOS DE USO VERTICALES */}
        {/* ============================================================ */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase block mb-2">
            APLICABILIDAD SECTORIAL
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            ¿Para qué adquieren S.A.A.R.E. las empresas?
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Soluciones adaptadas a los sectores con mayor exigencia de confidencialidad, riesgo normativo y valor probatorio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          {verticals.map((v, i) => (
            <div key={i} className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{v.icon}</span>
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 text-[10px] font-mono font-bold">
                    {v.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{v.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                  {v.desc}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">{v.action}</span>
                <a href="https://saare-grc-dashboard.streamlit.app/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  Ver auditoría GRC ➔
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* ============================================================ */}
        {/* 02. UN ÚNICO GATEWAY. CUALQUIER MODELO. */}
        {/* ============================================================ */}
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/40 border border-slate-800 shadow-2xl">
          <div className="text-center mb-10">
            <span className="text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase block mb-2">
              COMPATIBILIDAD UNIVERSAL & ZERO FRICTION
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">
              Un único gateway. Cualquier modelo de IA.
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm">
              OpenAI · Azure OpenAI · Anthropic · Google Gemini · DeepSeek · LLMs Locales (Ollama / vLLM).
            </p>
          </div>

          {/* Selector de Pestañas de Código */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {['python', 'node', 'curl'].map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveTab(lang)}
                className={`px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all uppercase ${
                  activeTab === lang
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {lang === 'node' ? 'Node.js' : lang === 'curl' ? 'cURL' : 'Python SDK'}
              </button>
            ))}
          </div>

          {/* Bloque de Código */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto relative">
            <pre className="leading-relaxed">
              <code>{codeSnippets[activeTab]}</code>
            </pre>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>⚡ Latencia media añadida: &lt; 2 ms</span>
              <span className="text-emerald-400 font-semibold">✓ Compatible 100% con especificación OpenAI API</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
