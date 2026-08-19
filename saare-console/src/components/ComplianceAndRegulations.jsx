import React from 'react';

export default function ComplianceAndRegulations() {
  const regulations = [
    {
      code: "EU AI ACT",
      title: "Reglamento Europeo de IA",
      scope: "Gobernanza & Trazabilidad Obligatoria",
      color: "border-cyan-500/40 text-cyan-400 bg-cyan-950/40",
      points: [
        "Clasificación y mitigación de riesgos en sistemas de IA de propósito general (GPAI).",
        "Registro inmutable y verificable de eventos de inferencia y prompts corporativos.",
        "Prevención técnica de manipulaciones algorítmicas y uso no conforme."
      ]
    },
    {
      code: "ISO/IEC 42001:2023",
      title: "Sistema de Gestión de IA (AIMS)",
      scope: "Estándar Global de IA Responsable",
      color: "border-emerald-500/40 text-emerald-400 bg-emerald-950/40",
      points: [
        "Control de debida diligencia en el ciclo de vida de inferencia en tiempo real.",
        "Evaluación de impacto y erradicación determinista de sesgos y derivas estocásticas.",
        "Mecanismos continuos de supervisión y reporte probatorio para auditores."
      ]
    },
    {
      code: "REGLAMENTO DORA",
      title: "Resiliencia Operativa Digital (UE 2022/2554)",
      scope: "Sector Financiero & Fintech",
      color: "border-purple-500/40 text-purple-400 bg-purple-950/40",
      points: [
        "Supervisión estricta y blindaje del riesgo TIC derivado de terceros (proveedores de LLM).",
        "Aislamiento de transacciones y datos de balance bancario en memoria RAM.",
        "Registro de incidentes con firma criptográfica admisible en auditorías del BCE."
      ]
    },
    {
      code: "RGPD / LOPDGDD",
      title: "Protección de Datos Personales",
      scope: "Artículos 5, 9, 25 y 32",
      color: "border-amber-500/40 text-amber-400 bg-amber-950/40",
      points: [
        "Principio de minimización radical: 0 segundos de persistencia del prompt original.",
        "Anonimización ex-ante de datos de categoría especial antes de salir del perímetro.",
        "Privacidad desde el diseño (Privacy by Design) avalada por dictamen jurídico MS3V."
      ]
    },
    {
      code: "ISO/IEC 27001:2022",
      title: "Seguridad de la Información",
      scope: "Controles Perimetrales A.8",
      color: "border-blue-500/40 text-blue-400 bg-blue-950/40",
      points: [
        "Control perimetral de canales de fuga de datos no autorizados (Shadow AI).",
        "Cifrado asimétrico y gestión aislada de claves criptográficas por organización.",
        "Integridad de registros mediante sellos inviolables HMAC-SHA256."
      ]
    },
    {
      code: "LEY 1/2019",
      title: "Secretos Empresariales",
      scope: "Protección de Propiedad Intelectual",
      color: "border-rose-500/40 text-rose-400 bg-rose-950/40",
      points: [
        "Acreditación de 'medidas razonables' exigidas por ley para preservar el secreto.",
        "Bloqueo de código fuente, fórmulas y estrategias antes de ser absorbidas por el modelo.",
        "Custodia probatoria en Evidence Vault con no repudio pericial."
      ]
    }
  ];

  return (
    <section id="compliance-normativas" className="w-full bg-slate-950 text-white font-sans border-b border-slate-800 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase block mb-2">
            08 — REGULATORY COMPLIANCE & LEGAL SHIELD
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Alineación Normativa y Cumplimiento Regulatorio
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            S.A.A.R.E. dota a tu empresa de la cobertura técnica y documental exigida por las normativas más estrictas de Europa y la industria global.
          </p>
        </div>

        {/* Grid de Marcos Normativos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {regulations.map((reg, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full border text-[11px] font-mono font-bold ${reg.color}`}>
                    {reg.code}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{reg.title}</h3>
                <span className="text-xs text-slate-400 font-mono block mb-4">{reg.scope}</span>
                
                <ul className="space-y-2 text-xs text-slate-300">
                  {reg.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">✓</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Certificación Jurídica y Descarga */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 to-slate-950 border border-cyan-500/30 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase block mb-1">
              DICTAMEN TÉCNICO-JURÍDICO AVALADO
            </span>
            <h4 className="text-xl font-bold text-white mb-2">
              ¿Preparado para una auditoría de la AEPD o del Regulador Bancario?
            </h4>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
              Genera informes forenses certificados con sellado de tiempo y firma digital directa para responder con garantías ante cualquier requerimiento sancionador.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://saare-grc-dashboard.streamlit.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap"
            >
              📊 AUDITORÍA EN STREAMLIT ➔
            </a>
            <a
              href="https://console.saare.es"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-5 py-3.5 rounded-xl text-xs transition-all whitespace-nowrap"
            >
              CONSOLA DE CUMPLIMIENTO
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
