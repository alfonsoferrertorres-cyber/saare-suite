import React, { useState } from 'react';

export default function EnterpriseFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: "DESPLIEGUE & ARQUITECTURA",
      q: "¿Cómo se despliega en una organización con cientos de puestos de trabajo?",
      a: "El despliegue se ejecuta de forma 100% desatendida mediante directivas de grupo de Active Directory (GPO), Microsoft Intune o archivos de registro (.reg). La directiva 'ExtensionInstallForcelist' instala el gateway en los navegadores corporativos impidiendo su desactivación o desinstalación por parte del usuario final."
    },
    {
      category: "PRIVACIDAD & RGPD",
      q: "¿Qué ocurre con el texto de los prompts y dónde se almacenan?",
      a: "Los prompts operan bajo un modelo Stateless con residuo cero. La inspección ocurre exclusivamente en la memoria RAM volátil (< 2 ms). Una vez evaluada la política y redactados los datos PII, la memoria se purga y sobrescribe. En ningún caso se persiste el texto en bases de datos intermedias ni en discos."
    },
    {
      category: "RENDIMIENTO & LATENCIA",
      q: "¿Afecta a la velocidad de respuesta en herramientas como ChatGPT o Claude?",
      a: "No. La latencia media añadida en memoria volátil es de 1.16 milisegundos. Es una latencia técnicamente imperceptible tanto para el usuario humano como para arquitecturas de inferencia en tiempo real y streaming de tokens."
    },
    {
      category: "VALOR PROBATORIO & LEGAL",
      q: "¿Qué validez jurídica tiene la evidencia forense generada por la Evidence Vault?",
      a: "Cada bloqueo o modificación genera un sello criptográfico inmutable HMAC-SHA256 con firma asimétrica Ed25519. Este registro cuenta con respaldo pericial del Gabinete Jurídico MS3V y está acreditado ante el Registro de la Propiedad Intelectual (Safe Creative 2607076315021), aportando presunción de certeza técnica y no repudio procesal ante tribunales y la AEPD."
    },
    {
      category: "ENTORNOS AISLADOS (ON-PREM)",
      q: "¿Funciona en infraestructuras locales o entornos cerrados (Air-Gapped)?",
      a: "Sí. S.A.A.R.E. cuenta con soporte agnóstico para servidores de inferencia locales (vLLM, Ollama, TGI y clústeres privados de GPUs), permitiendo aplicar gobernanza perimetral estricta sin salida a internet."
    },
    {
      category: "LICENCIAMIENTO & TOKENS",
      q: "¿Existen límites de tokens o sobrecostes por volumen de peticiones?",
      a: "No. El licenciamiento es plano por identidad corporativa protegida (€/mes/puesto). Incluye volumen ilimitado de peticiones, tokens infinitos, inspección en tiempo real, soporte de políticas GPO y acceso a la bóveda forense sin costes variables."
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq-enterprise" className="w-full bg-slate-950 text-white font-sans border-b border-slate-800 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Encabezado */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase block mb-2">
            13 — RESOLUCIÓN DE OBJECIONES TÉCNICAS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Preguntas Frecuentes Enterprise
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Respuestas detalladas a las exigencias operativas, de seguridad y normativas formuladas por CISOs, DPOs y Directores de TI.
          </p>
        </div>

        {/* Acordeón Interactivo de FAQs */}
        <div className="space-y-4 mb-16">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'bg-slate-900/80 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase block mb-1">
                      {faq.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {faq.q}
                    </h3>
                  </div>
                  <span className={`text-xl font-mono text-cyan-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tarjeta de Soporte Pericial Directo */}
        <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h4 className="text-lg font-bold text-white mb-1">
              ¿Tienes una consulta técnica específica para tu entorno?
            </h4>
            <p className="text-xs sm:text-sm text-slate-400">
              Nuestro gabinete técnico y equipo de arquitectura evalúan tus requerimientos de cumplimiento.
            </p>
          </div>
          <a
            href="https://saare-grc-dashboard.streamlit.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-semibold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all whitespace-nowrap"
          >
            CONSULTAR AUDITORÍA GRC ➔
          </a>
        </div>

      </div>
    </section>
  );
}
