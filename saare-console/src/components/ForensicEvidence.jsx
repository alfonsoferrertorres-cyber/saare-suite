import React, { useState } from 'react';

export default function ForensicEvidence() {
  const [copied, setCopied] = useState(false);
  const rootHash = "128fa8c937f946a010588def204bd0a8a4e7b6c2a1279937a48f195f82c79a07";

  const handleCopy = () => {
    navigator.clipboard.writeText(rootHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const techSpecs = [
    { label: "Metodología", value: "Validación Ex-Ante de Espacio Latente L7" },
    { label: "Algoritmo de Firma", value: "Asimétrica Ed25519 + HMAC-SHA256" },
    { label: "Entorno de Ejecución", value: "RAM Volátil (Stateless Engine)" },
    { label: "Latencia Auditada", value: "1.16 ms (Residuo Cero)" },
    { label: "Registro Propiedad Intelectual", value: "Safe Creative 2607076315021" },
    { label: "Dictamen Pericial", value: "Gabinete Jurídico Técnico MS3V" }
  ];

  return (
    <section id="forensic-evidence" className="w-full bg-slate-950 text-white font-sans border-b border-slate-800 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Encabezado */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase block mb-2">
            07 — FORENSIC EVIDENCE & VERIFIABILITY
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Evidencia Forense Inmutable y Cadena de Custodia
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Sustituimos las afirmaciones de palabra por sellos criptográficos verificables con valor probatorio procesal.
          </p>
        </div>

        {/* Panel Central: Ficha Técnica Pericial */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl mb-12">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold block">
                FICHA TÉCNICA DEL NODO RAÍZ
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Certificación de Integridad Determinista
              </h3>
            </div>
            <span className="px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold">
              NO REPUDIO PROCESAL ACTIVO
            </span>
          </div>

          {/* Grid de especificaciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {techSpecs.map((spec, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono">
                <span className="text-slate-500 block mb-1 uppercase text-[11px]">{spec.label}</span>
                <span className="text-slate-200 font-semibold">{spec.value}</span>
              </div>
            ))}
          </div>

          {/* Bloque Hash con botón de copiado */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono text-cyan-400 font-bold">
                HUELLA DIGITAL RAÍZ (SHA-256):
              </span>
              <button
                onClick={handleCopy}
                className="text-xs font-mono text-cyan-300 hover:text-cyan-200 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-md transition-colors"
              >
                {copied ? "✓ Copiado en Portapapeles" : "📋 Copiar Huella"}
              </button>
            </div>
            <code className="text-xs sm:text-sm text-slate-200 font-mono break-all select-all block">
              {rootHash}
            </code>
          </div>

          {/* Acciones de Validación Externa */}
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://saare-grc-dashboard.streamlit.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20"
            >
              📊 VERIFICAR FIRMA EN DASHBOARD GRC ➔
            </a>
            <a
              href="https://www.safecreative.org/work/2607076315021"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-5 py-3 rounded-xl text-xs transition-all"
            >
              📜 CONSULTAR REGISTRO SAFE CREATIVE
            </a>
          </div>

        </div>

        {/* Explicación de la Cadena de Custodia (Dual-Vault) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-cyan-400">🛡️</span> Aislamiento Multi-Tenant de Evidencias
            </h4>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Cada cliente dispone de un subespacio aislado criptográficamente en la <code>Evidence Vault</code>. Ningún evento de auditoría puede ser cruzado o visualizado por otras identidades u organizaciones.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-emerald-400">⚖️</span> Validez Probatoria ante Reguladores
            </h4>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              El sello criptográfico acredita la hora exacta del evento, el tipo de directiva aplicada y el resultado sin exponer el secreto del prompt original, garantizando la defensa jurídica frente a sanciones RGPD / AI Act.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
