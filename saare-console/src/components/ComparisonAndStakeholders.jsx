import React from 'react';

export default function ComparisonAndStakeholders() {
  const comparisonData = [
    {
      feature: "Control e Interceptación de Prompts",
      without: "Inexistente. El usuario envía datos directamente al proveedor externo.",
      withSaare: "Interceptación ex-ante en memoria RAM (< 2 ms) antes de la salida.",
      statusWithout: "❌",
      statusWith: "✅"
    },
    {
      feature: "Anonimización y Filtrado de PII",
      without: "Fuga silenciosa de DNIs, IBANs, tarjetas y secretos a servidores externos.",
      withSaare: "Redacción y ofuscación determinista en memoria volátil.",
      statusWithout: "❌",
      statusWith: "✅"
    },
    {
      feature: "Control Centralizado de Shadow AI",
      without: "Sin visibilidad. Cada empleado utiliza herramientas de IA sin gobernanza.",
      withSaare: "Despliegue forzado por directivas GPO / Registry inmune a desinstalación.",
      statusWithout: "❌",
      statusWith: "✅"
    },
    {
      feature: "Evidencia Criptográfica Forense",
      without: "Logs básicos no firmados, manipulables o inexistentes.",
      withSaare: "Sello inmutable HMAC-SHA256 y Ed25519 con valor probatorio en Evidence Vault.",
      statusWithout: "❌",
      statusWith: "✅"
    },
    {
      feature: "Gobernanza y Cumplimiento GRC",
      without: "Auditorías manuales retroactivas con alto riesgo sancionador.",
      withSaare: "Auditoría continua automatizada para EU AI Act, ISO 42001, DORA y RGPD.",
      statusWithout: "❌",
      statusWith: "✅"
    },
    {
      feature: "Compatibilidad de Modelos",
      without: "Silos dependientes de cada API individual.",
      withSaare: "Agnóstico y universal: OpenAI, Azure, Anthropic, Gemini y LLMs locales.",
      statusWithout: "⚠️ Limitada",
      statusWith: "✅ Universal"
    }
  ];

  return (
    <div className="w-full bg-slate-950 text-white font-sans border-b border-slate-800 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* ============================================================ */}
        {/* 01. MATRIZ COMPARATIVA BRUTALMENTE CLARA */}
        {/* ============================================================ */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase block mb-2">
            EVALUACIÓN DE IMPACTO OPERATIVO
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Sin S.A.A.R.E. vs. Con S.A.A.R.E.
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Comparativa directa entre el uso desprotegido de Inteligencia Artificial y una infraestructura blindada por gobernanza perimetral L7.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl mb-24">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-300 font-mono uppercase text-xs">
                <th className="py-4 px-6 w-1/4">Capacidad / Riesgo</th>
                <th className="py-4 px-6 w-3/8 text-slate-400">Sin S.A.A.R.E. (Uso Directo)</th>
                <th className="py-4 px-6 w-3/8 text-cyan-400 bg-cyan-950/30 border-l border-cyan-500/20">
                  Con S.A.A.R.E. L7 Gateway
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {comparisonData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/80 transition-colors">
                  <td className="py-4 px-6 font-semibold text-white">
                    {row.feature}
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    <span className="mr-2">{row.statusWithout}</span> {row.without}
                  </td>
                  <td className="py-4 px-6 text-slate-200 bg-cyan-950/20 border-l border-cyan-500/20 font-medium">
                    <span className="mr-2">{row.statusWith}</span> {row.withSaare}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ============================================================ */}
        {/* 02. DISEÑADO PARA TRES EQUIPOS (CISO / CTO / DPO) */}
        {/* ============================================================ */}
        <div className="text-center mb-14">
          <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase block mb-2">
            ALINEACIÓN DIRECTIVA
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">
            Diseñado para tres equipos. Una única capa de control.
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Resolvemos las fricciones entre seguridad, desarrollo tecnológico y requerimientos jurídicos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CISO */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-2xl mb-6">
                🛡️
              </div>
              <div className="text-xs font-mono text-cyan-400 font-bold uppercase mb-1">Para CISO & SecOps</div>
              <h3 className="text-xl font-bold text-white mb-3">Control Perimetral y Cero Fugas</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Reduce drásticamente la superficie de ataque. Erradica la fuga de propiedad intelectual y secretos corporativos sin restringir la productividad del empleado.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-500 border-t border-slate-800 pt-4">
              ✓ Interceptación ex-ante · Control Shadow AI
            </div>
          </div>

          {/* CTO */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-2xl mb-6">
                ⚡
              </div>
              <div className="text-xs font-mono text-emerald-400 font-bold uppercase mb-1">Para CTO & Arquitectura</div>
              <h3 className="text-xl font-bold text-white mb-3">Integración Transparente</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Integra el gateway en minutos sin reescribir código existente. Compatible con endpoints de OpenAI, SDKs corporativos y proxy perimetral a 1.16 ms de latencia.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-500 border-t border-slate-800 pt-4">
              ✓ Latencia imperceptible · Multi-LLM API
            </div>
          </div>

          {/* DPO */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-2xl mb-6">
                ⚖️
              </div>
              <div className="text-xs font-mono text-purple-400 font-bold uppercase mb-1">Para DPO & Compliance</div>
              <h3 className="text-xl font-bold text-white mb-3">Trazabilidad y Evidencia Forense</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Acredita la debida diligencia técnica. Obtén auditorías y dictámenes periciales inmutables para responder con garantías ante la AEPD, EU AI Act e ISO 42001.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-500 border-t border-slate-800 pt-4">
              ✓ RGPD por diseño · Bóveda HMAC-SHA256
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
